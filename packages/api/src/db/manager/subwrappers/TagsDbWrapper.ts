import {
  NewMultiTagging,
  NewUserTagging,
  SavedTag,
  TagWithTaggingId,
  NewUserTaggingSchema,
} from "@b5x/types";

import {
  UserTagRemovalParams,
  UserTagRemovalParamsSchema,
  UserTagSearchCriteria,
  UserTagSearchCriteriaSchema,
} from "./types/tags";

import { DbWrapper } from "./DbWrapper";
const _ = require("lodash");

/**
 * This class is for managing tags and taggings. While the only valid
 * type of taggable right now is a user, this functionality is expected to expand
 * to topics and other types of taggables in the future. At that point,
 * a portion of the code will need to be refactored to be more generic,
 * though most of the tagging functions should still work properly as-is.
 * The relevant data tables are also already set up to be generic.
 */
export class TagsDbWrapper extends DbWrapper {
  knex: any;

  constructor(knex: any) {
    super(knex, "tags");
    this.knex = knex;
  }

  // TODO: Shouldn't the value be optional here? Or are we using null?
  async #createTag(key: string, value: any) {
    // attempt to create the tag
    try {
      const insertedTags = await this.knex("tags")
        .returning(["id", "key", "value", "createdAt", "updatedAt"])
        .insert({ key, value: JSON.stringify(value) });
      let matchingTag: SavedTag = insertedTags[0];
      return matchingTag;
    } catch (e) {
      // if the error is communicating that the tag already exists
      // (because it was created very recently by a different process),
      // simply return the existing tag instead of creating a new one
      if (
        // @ts-ignore
        e.routine === "_bt_check_unique" &&
        // @ts-ignore
        e.constraint === "tags_key_value_unique"
      ) {
        const matchingTags: SavedTag[] = await this.knex("tags").where({
          key,
          value: JSON.stringify(value),
        });
        return matchingTags[0];
        // throw the error if it's not an expected one
      } else {
        throw e;
      }
    }
  }

  /**
   *  Answers two questions at the same time:
   *  - Does ANY tag with this key/value (or just key) exist?
   *  - If it does exist, is it already assigned to the given taggable?
   */
  // TODO: This does not actually always provide a tagging ID, sometimes that field will be null.
  // This is an issue for the TagWithTaggingId type, which assumes that a tagging id will be present.
  #getTagsWithTaggingIds(taggingSearch: {
    taggableTableName: string;
    taggableId: number;
    key: string;
    value?: any;
  }): Promise<TagWithTaggingId[]> {
    let tagSearchCriteria: { key: string; value?: any } = {
      key: taggingSearch.key,
    };
    if ("value" in taggingSearch) {
      tagSearchCriteria.value = JSON.stringify(taggingSearch.value);
    }

    const knex = this.knex; // for use in functions with their own 'this'

    return (
      this.knex
        .select(
          "tags.id",
          "tags.key",
          "tags.value",
          "tags.createdAt",
          "tags.updatedAt",
          "taggings.id AS taggingId",
          "taggings.mode"
        )
        // get all tags with this key or key/value
        .from("tags")
        .where(tagSearchCriteria)
        // join with the given taggable
        .fullOuterJoin("taggings", function () {
          // @ts-ignore
          this.on("taggings.tagId", "=", "tags.id")
            .andOn(
              knex.raw("taggings.taggable_id = ?", taggingSearch.taggableId)
            )
            .andOn(
              knex.raw(
                "taggings.taggable_table_name = ?",
                taggingSearch.taggableTableName
              )
            );
        })
    );
  }

  // TODO: This is a search for a given user (and eventually other taggable),
  // not plain tags themselves.
  // Should it be called allFor to make the intent clearer? .all in ActiveRecord etc.
  // means something much more flexible.
  all(tagSearchCriteria: UserTagSearchCriteria): Promise<TagWithTaggingId[]> {
    tagSearchCriteria = UserTagSearchCriteriaSchema.parse(tagSearchCriteria);
    const taggableId = tagSearchCriteria.userId;
    const taggableTableName = "users";

    let tableSearchCriteria: { key?: string; value?: any } = {};

    if ("key" in tagSearchCriteria) {
      tableSearchCriteria.key = tagSearchCriteria.key;
    }
    if ("value" in tagSearchCriteria) {
      tableSearchCriteria.value = JSON.stringify(tagSearchCriteria.value);
    }

    return this.knex
      .select("tags.*", "taggings.mode", "taggings.id AS taggingId")
      .from("tags")
      .leftJoin("taggings", "taggings.tagId", "tags.id")
      .where("taggings.taggableTableName", "=", taggableTableName)
      .andWhere("taggings.taggableId", "=", taggableId)
      .andWhere(tableSearchCriteria);
  }

  async remove(tagRemovalParams: UserTagRemovalParams): Promise<boolean> {
    tagRemovalParams = UserTagRemovalParamsSchema.parse(tagRemovalParams);

    const tableSearchCriteria = UserTagSearchCriteriaSchema.parse(
      _.omit(tagRemovalParams, "confirmRemoveAll")
    );

    const existingTagsWithTaggingIds = await this.all(tableSearchCriteria);

    let taggingIdsToRemove: number[] = [];

    existingTagsWithTaggingIds.forEach((tagWithTaggingId) => {
      if (!tagWithTaggingId.taggingId) {
        return;
      }
      taggingIdsToRemove.push(tagWithTaggingId.taggingId);
    });

    return this.knex("taggings")
      .whereIn("id", taggingIdsToRemove)
      .delete()
      .then(() => {
        return true;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  /**
   *  Mono tag functions
   */

  async set(newTaggingParams: NewUserTagging): Promise<TagWithTaggingId> {
    newTaggingParams = NewUserTaggingSchema.parse(newTaggingParams);
    let newTaggingTableName = "users";
    let newTaggingTaggableId = newTaggingParams.userId;

    const existingTagsWithTaggingIds = await this.#getTagsWithTaggingIds({
      taggableTableName: newTaggingTableName,
      taggableId: newTaggingTaggableId,
      key: newTaggingParams.key,
    });

    let multiTaggings: TagWithTaggingId[] = [];
    let existingMatchingTag: SavedTag | undefined;
    let existingUserTagWithTaggingId: TagWithTaggingId | undefined;

    existingTagsWithTaggingIds.forEach((tagWithTaggingId) => {
      // collect any existing multi taggings under this key
      // (will later cause an error if they exist)
      if (tagWithTaggingId.mode === "multi") {
        multiTaggings.push(tagWithTaggingId);
      }

      // if a tagging ID is found, save the tagging ID
      // so it can be updated to reflect the new value if needed
      if (tagWithTaggingId.taggingId) {
        existingUserTagWithTaggingId = tagWithTaggingId;
      }

      // if a matching tag exists with the requested key/value,
      // keep it even if there is no tagging associated with it
      if (tagWithTaggingId.value === newTaggingParams.value) {
        existingMatchingTag = _.omit(tagWithTaggingId, ["taggingId"]);
      }
    });

    // throw an error if multi taggings were detected
    if (multiTaggings.length > 0) {
      throw new Error(`Cannot overwrite existing multi taggings: 
        ${multiTaggings.forEach((tagging) => {
          return `\n{ id: ${tagging.taggingId}, key: ${tagging.key}, value: ${tagging.value} }\n`;
        })} 
        To switch to mono tagging, first use remove() to delete the multi taggings, then use set().
        `);
    }

    // if a tag exists, and a tagging exists, and they already align,
    // do nothing and return the matching tag
    if (
      existingMatchingTag &&
      existingUserTagWithTaggingId &&
      existingMatchingTag.id === existingUserTagWithTaggingId.id
    ) {
      return existingUserTagWithTaggingId;
    }

    // if a matching tag does not exist, create it
    if (!existingMatchingTag) {
      existingMatchingTag = await this.#createTag(
        newTaggingParams.key,
        newTaggingParams.value
      ); // TODO: Switch createTag back to taking params
    }

    // if the tagging exists
    // (but is pointing to the wrong tag if we've made it this far),
    // update it
    if (existingUserTagWithTaggingId) {
      const taggingIdToUpdate = existingUserTagWithTaggingId.taggingId;
      const newTagId = existingMatchingTag.id;
      const taggingUpdateResult = await this.knex("taggings")
        .where({ id: taggingIdToUpdate })
        .update({ tagId: newTagId }, ["id", "mode"]);

      return {
        ...existingMatchingTag,
        taggingId: taggingUpdateResult[0].id,
        mode: taggingUpdateResult[0].mode,
      };
    }

    // otherwise, create the tagging
    const insertedTaggings = await this.knex("taggings")
      .returning(["id", "mode"])
      .insert({
        taggableTableName: newTaggingTableName,
        taggableId: newTaggingTaggableId,
        tagId: existingMatchingTag.id,
        mode: "mono",
      });

    return {
      ...existingMatchingTag,
      taggingId: insertedTaggings[0].id,
      mode: insertedTaggings[0].mode,
    };
  }

  /**
   *  Multi tag functions
   */
  async add(newTagging: NewUserTagging): Promise<TagWithTaggingId> {
    newTagging = NewUserTaggingSchema.parse(newTagging);
    const newMultiTagging = {
      taggableTableName: "users",
      taggableId: newTagging.userId,
      key: newTagging.key,
      value: newTagging.value,
    };
    return this.#add(newMultiTagging);
  }

  async #add(newMultiTagging: NewMultiTagging): Promise<TagWithTaggingId> {
    // pull ALL tags with this key,
    // in case there is already a mono tagging
    // with the same key but a different value
    const existingTagsWithTaggingIds = await this.#getTagsWithTaggingIds({
      taggableTableName: newMultiTagging.taggableTableName,
      taggableId: newMultiTagging.taggableId,
      key: newMultiTagging.key,
    });

    let existingTagWithTaggingId: TagWithTaggingId | undefined;

    // look for matching tags
    existingTagsWithTaggingIds.forEach((tagWithTaggingId) => {
      // if a mono tagging already exists with a different value, throw an error.
      // the mono tag must first be removed, or update must be used
      if (
        tagWithTaggingId.mode === "mono" &&
        tagWithTaggingId.value !== newMultiTagging.value
      ) {
        throw new Error(`Cannot overwrite existing mono tagging: 
        { id: ${tagWithTaggingId.taggingId}, key: ${tagWithTaggingId.key}, value: ${tagWithTaggingId.value} }. 
        To overwrite the value of a mono tagging, use set(), update(), or increment(). 
        To switch to a multi tagging, first use remove() to delete the mono tagging, then use add().
        `);
      }

      // if a tag already exists but in mono mode, throw an error.
      if (
        tagWithTaggingId.mode === "mono" &&
        tagWithTaggingId.value === newMultiTagging.value
      ) {
        throw new Error(`You called add(), which creates taggings in 'multi' mode, 
        but a tagging for the requested key/value pair already exists in 'mono' mode:
        { id: ${tagWithTaggingId.taggingId}, key: ${tagWithTaggingId.key}, value: ${tagWithTaggingId.value} }. 
        First use remove() to delete the above tagging.`);
      }

      if (
        tagWithTaggingId.key === newMultiTagging.key &&
        tagWithTaggingId.value === newMultiTagging.value
      ) {
        existingTagWithTaggingId = tagWithTaggingId;
      }
    });

    // if a tag and tagging already exist, do nothing and return them
    if (existingTagWithTaggingId && existingTagWithTaggingId.taggingId) {
      return existingTagWithTaggingId;
    }

    let newlyCreatedTag: SavedTag | undefined;

    // if no tag exists at all, create the tag
    if (!existingTagWithTaggingId) {
      newlyCreatedTag = await this.#createTag(
        newMultiTagging.key,
        newMultiTagging.value
      );
    }

    // since we know the tagging doesn't exist if we've made it this far, create the tagging
    // and update the tag with the tagging data
    let savedTag: SavedTag =
      newlyCreatedTag || _.omit(existingTagWithTaggingId, "taggingId");
    let insertedTaggings: { id: number; mode: "mono" | "multi" }[];

    try {
      insertedTaggings = await this.knex("taggings")
        .returning(["id", "mode"])
        .insert({
          taggableTableName: newMultiTagging.taggableTableName,
          taggableId: newMultiTagging.taggableId,
          tagId: savedTag.id,
          mode: "multi",
        });
    } catch (e) {
      // if the error is communicating that the tagging already exists
      // (because it was created very recently by a different process),
      // simply return the existing tag instead of creating a new one
      if (
        // @ts-ignore
        e.routine === "_bt_check_unique" &&
        // @ts-ignore
        e.constraint ===
          "taggings_taggable_table_name_taggable_id_tag_id_unique"
      ) {
        insertedTaggings = await this.knex
          .select(["id", "mode"])
          .from("taggings")
          .where({
            taggableTableName: newMultiTagging.taggableTableName,
            taggableId: newMultiTagging.taggableId,
            tagId: savedTag.id,
            mode: "multi",
          });
      } else {
        // throw the error if it's not an expected one
        throw e;
      }
    }

    return {
      ...savedTag,
      taggingId: insertedTaggings[0].id,
      mode: insertedTaggings[0].mode,
    };
  }
}
