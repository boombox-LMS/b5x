import { DbWrapper } from "./DbWrapper";
import { TagsDbWrapper } from "./TagsDbWrapper";
import { TopicsDbWrapper } from "./TopicsDbWrapper";
import {
  SavedUser,
  NewTag,
  NewTagging,
  SavedTag,
  TagWithTaggingId,
  TopicAccessLevel,
  TopicConfig,
  UserWithGroupNames,
  UserWithGroupModifications,
} from "@b5x/types";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

export interface UserWithTagsByValue {
  id: number;
  email: string;
  tagsByValue: Record<
    string,
    {
      value: string;
      key: string;
      id: number;
      taggingId: number;
    }
  >;
}

export class UsersDbWrapper extends DbWrapper {
  tags: TagsDbWrapper;
  topics: TopicsDbWrapper;

  constructor(knex: any) {
    super(knex, "users");
    this.knex = knex;
    this.tags = new TagsDbWrapper(knex);
    this.topics = new TopicsDbWrapper(knex);
  }

  /**
   *  Mass-modify user groups (performed by someone with admin privileges).
   *  Because any qualifying potential user can auth anytime
   *  without an admin needing to create their account or send them an invite first,
   *  the user may or may not already exist in the database.
   */
  async modifyGroups(params: {
    users: UserWithGroupModifications[];
  }): Promise<UserWithGroupNames> {
    let usersToInsert: { email: string; username: string }[] = [];
    let userEmails: string[] = [];
    let tagValues: string[] = [];
    let tagsToInsert: NewTag[] = [];

    params.users.forEach((user) => {
      // validate user data
      if (!user.email) {
        throw "Each user object must have an email key.";
      }

      const email = user.email;

      // collect users to create in bulk
      usersToInsert.push({ email, username: this.#generateUsername() });

      // collect user emails for re-retrieval purposes later
      userEmails.push(email);

      // collect tags to create in bulk
      user.addToGroups.forEach((groupName) => {
        tagsToInsert.push({
          key: "user-group",
          value: JSON.stringify(groupName),
        });
        // collect tag values for re-retrieval purposes later
        tagValues.push(JSON.stringify(groupName));
      });

      // collect tag values for re-retrieval purposes later
      user.removeFromGroups.forEach((groupName) => {
        tagValues.push(JSON.stringify(groupName));
      });
    });

    let tagAndUserCreationPromises: Promise<any>[] = [];

    // create any users that do not exist
    tagAndUserCreationPromises.push(
      this.knex.raw(
        `? ON CONFLICT (email)
          DO NOTHING`,
        [this.knex("users").insert(usersToInsert)]
      )
    );

    // create any tags that do not exist
    tagAndUserCreationPromises.push(
      this.knex.raw(
        `? ON CONFLICT (key, value)
          DO NOTHING`,
        [this.knex("tags").insert(tagsToInsert)]
      )
    );

    await Promise.all(tagAndUserCreationPromises);

    // fetch all relevant users and tags
    let tagAndUserFetchPromises: Promise<any>[] = [];

    interface UserWithGroupTagsQueryResult {
      rows: {
        id: number;
        email: string;
        tagging_id: number;
        tag_key: string;
        tag_value: any;
        tag_id: number;
      }[];
    }

    const usersWithGroupTagsQuery = `
      SELECT 
        matching_users.id, 
        matching_users.email, 
        user_tags.tagging_id, 
        user_tags.key AS tag_key, 
        user_tags.value AS tag_value, 
        user_tags.tag_id
      FROM (
        SELECT id, email FROM users
        WHERE email IN (${userEmails
          .map((email) => {
            return `'${email}'`;
          })
          .join(", ")})
      ) AS matching_users
      LEFT JOIN (
        SELECT 
          taggings.id AS tagging_id, 
          taggings.taggable_id AS taggable_id, 
          tags.key AS key, 
          tags.value AS value, 
          tags.id AS tag_id
        FROM tags
        LEFT JOIN taggings ON taggings.tag_id = tags.id
        WHERE tags.key = 'user-group'
      ) AS user_tags 
      ON user_tags.taggable_id = matching_users.id
    `;

    let usersByEmail: Record<string, UserWithTagsByValue> = {};
    tagAndUserFetchPromises.push(
      this.knex
        .raw(usersWithGroupTagsQuery)
        .then((result: UserWithGroupTagsQueryResult) => {
          result.rows.forEach((row) => {
            // add the user to the collection the first time the user is encountered
            if (!usersByEmail[row.email]) {
              usersByEmail[row.email] = {
                id: row.id,
                email: row.email,
                tagsByValue: {},
              };
            }
            // if this row contains tag data, add that too
            if (row.tagging_id) {
              usersByEmail[row.email].tagsByValue[row.tag_value] = {
                value: row.tag_value,
                key: row.tag_key,
                id: row.tag_id,
                taggingId: row.tagging_id,
              };
            }
          });
        })
    );

    let userGroupTagsByValue: Record<string, SavedTag> = {};
    tagAndUserFetchPromises.push(
      this.knex("tags")
        .whereIn("value", tagValues)
        .andWhere({ key: "user-group" })
        .then((rows: SavedTag[]) => {
          rows.forEach((tag) => {
            userGroupTagsByValue[tag.value] = tag;
          });
        })
    );

    await Promise.all(tagAndUserFetchPromises);

    // loop through the original submitted list, building the taggings to add and remove
    let taggingsToInsert: NewTagging[] = [];
    let taggingIdsToDelete: number[] = [];

    params.users.forEach((user) => {
      user.addToGroups.forEach((groupName) => {
        // skip if tag has already been added in the past
        if (usersByEmail[user.email].tagsByValue[groupName]) {
          return;
        }
        // otherwise, collect the tagging for insertion
        taggingsToInsert.push({
          taggableTableName: "users",
          taggableId: usersByEmail[user.email].id,
          tagId: userGroupTagsByValue[groupName].id,
          mode: "multi",
        });
      });
      user.removeFromGroups.forEach((groupName) => {
        const tag = usersByEmail[user.email].tagsByValue[groupName];
        if (tag) {
          taggingIdsToDelete.push(tag.taggingId);
        }
      });
    });

    let modificationPromises: Promise<any>[] = [];

    if (taggingsToInsert.length > 0) {
      modificationPromises.push(this.knex("taggings").insert(taggingsToInsert));
    }

    if (taggingIdsToDelete.length > 0) {
      modificationPromises.push(
        this.knex("taggings").whereIn("id", taggingIdsToDelete).delete()
      );
    }

    await Promise.all(modificationPromises);

    // verify and return the result
    return this.knex
      .raw(usersWithGroupTagsQuery)
      .then((result: UserWithGroupTagsQueryResult) => {
        let finishedUsersByEmail: Record<string, UserWithGroupNames> = {};
        result.rows.forEach((row) => {
          // add user to the finished result if not yet encountered
          if (!finishedUsersByEmail[row.email]) {
            finishedUsersByEmail[row.email] = {
              id: row.id,
              email: row.email,
              groups: [],
            };
          }

          // if the row contains group data, add that in as well
          if (row.tagging_id) {
            finishedUsersByEmail[row.email].groups.push(row.tag_value);
          }
        });
        return Object.values(finishedUsersByEmail);
      });
  }

  async getTopicAccessStatus(params: {
    userId: number;
    topicUri?: string;
    topicSlug?: string;
  }) {
    // get the user's group list
    const userGroupList = await this.#getUserGroupNames({
      userId: params.userId,
    });
    let topicVersion;
    let topicSlug = params.topicSlug;

    if (params.topicUri !== undefined) {
      const { slug, version } = this.topics.parseTopicUri(params.topicUri);
      topicSlug = slug;
      topicVersion = version;
    }

    let queryPromises: Promise<any>[] = [];

    // check the user's enrollment data in order to get the current document ID
    let enrollmentData:
      | { currentDocumentUri: string; topicVersion: string }
      | undefined;

    queryPromises.push(
      this.knex
        .select("enrollments.currentDocumentUri", "topics.version")
        .from("enrollments")
        .leftJoin("topics", "topics.uri", "enrollments.topicUri")
        .where("topics.slug", "=", topicSlug)
        .andWhere("enrollments.userId", "=", params.userId)
        .orderBy("topics.version", "desc")
        .limit(1)
        .then((rows: { currentDocumentUri: string; version: string }[]) => {
          if (rows.length > 0) {
            enrollmentData = {
              currentDocumentUri: rows[0].currentDocumentUri,
              topicVersion: rows[0].version,
            };
          }
        })
    );

    // check whether the topic is blocked, per the access rules
    let topicIsBlocked = false;

    queryPromises.push(
      this.knex
        .select("accessLevel")
        .from("accessRules")
        .whereIn("accessRules.groupName", userGroupList)
        .whereIn("accessRules.accessLevel", [
          "blocked",
          "assigned",
          "recommended",
          "available",
        ])
        .andWhere("accessRules.topicSlug", "=", topicSlug)
        .then((accessLevels: TopicAccessLevel[]) => {
          // if there is no access rule present,
          // the user is not in a group with access to the topic
          if (accessLevels.length === 0) {
            topicIsBlocked = true;
          } else if (accessLevels.includes("blocked")) {
            topicIsBlocked = true;
          }
        })
    );

    // get the topic's prerequisites
    let prerequisites: string[] = [];

    // if we know the version, pull the prereqs for that version
    if (topicVersion) {
      queryPromises.push(
        this.knex
          .select("config")
          .from("topics")
          .where({ slug: topicSlug, version: topicVersion })
          .cache()
          .then((rows: { config: TopicConfig }[]) => {
            prerequisites = rows[0].config.prerequisites;
          })
      );
      // otherwise, pull the prereqs for the latest version
    } else {
      queryPromises.push(
        this.knex
          .select("config")
          .from("topics")
          .where({ slug: topicSlug })
          .orderBy("version", "desc")
          .limit(1)
          .then((rows: { config: TopicConfig }[]) => {
            prerequisites = rows[0].config.prerequisites;
          })
      );
    }

    // get the user's completed topic slugs
    let completedTopicSlugs: string[] = [];

    queryPromises.push(
      this.tags
        .all({ userId: params.userId, key: "completed-topic-slug" })
        .then((tags) => {
          completedTopicSlugs = tags.map((tag) => tag.value);
        })
    );

    await Promise.all(queryPromises);

    let unmetPrerequisites: string[] = [];
    for (let i = 0; i < prerequisites.length; i++) {
      let prerequisiteSlug = prerequisites[i];
      if (!completedTopicSlugs.includes(prerequisiteSlug)) {
        unmetPrerequisites.push(prerequisiteSlug);
      }
    }

    // get the titles / slugs of unmet prerequisites, for linking to topic pages
    if (unmetPrerequisites.length > 0) {
      unmetPrerequisites = await this.knex
        .select("slug", "title")
        .from("topics")
        .whereIn("slug", unmetPrerequisites);
    }

    let result = {
      topicIsBlocked,
      unmetPrerequisites,
      enrollmentData,
    };

    return result;
  }

  #getUserGroupNames(params: { userId: number }): Promise<string[]> {
    return this.tags
      .all({ userId: params.userId, key: "user-group" })
      .then((tags) => {
        let groupNames = tags.map((tag) => tag.value);
        groupNames.push("all");
        return groupNames;
      });
  }

  // DANGEROUS: Temporary, just for dev auth
  findOrCreateByEmail(email: string): Promise<SavedUser> {
    return this.knex("users")
      .where({ email })
      .then((selectedUsers: SavedUser[]) => {
        const user = selectedUsers[0];
        if (user) {
          return user;
        } else {
          return this.createByEmail(email);
        }
      });
  }

  // TODO This is just a stub, URL-friend user identification
  // is a problem to be solved once identity management is being developed
  #generateUsername() {
    return uuidv4();
  }

  async createByEmail(
    email: string
  ): Promise<{ email: string; username: string }> {
    const username = this.#generateUsername();

    return this.knex("users")
      .returning(["id", "email"])
      .insert({
        email,
        username,
      })
      .then((insertedUsers: { email: string; username: string }[]) => {
        return insertedUsers[0];
      });
  }

  findById(id: number): Promise<null | SavedUser> {
    return this.knex("users")
      .where("id", id)
      .then((selectedUsers: SavedUser[]) => {
        if (selectedUsers.length === 0) {
          return null;
        }

        return selectedUsers[0];
      });
  }

  // AWKWARD: Rename api_key to api_key_hash
  // in the database?
  async verifyApiKey(params: {
    username: string;
    apiKey: string;
  }): Promise<boolean> {
    const hash = await this.knex
      .select("apiKey")
      .from("users")
      .where({ username: params.username })
      .limit(1)
      .then((rows: { apiKey: string }[]) => {
        return rows[0].apiKey;
      });

    return bcrypt.compare(params.apiKey, hash).then((result: boolean) => {
      return result;
    });
  }

  async assignApiKey(params: {
    username: string;
  }): Promise<{ apiKey: string }> {
    const newApiKey = uuidv4();
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newApiKey, salt);
    return this.knex("users")
      .where({ username: params.username })
      .update({ apiKey: hash })
      .then(() => {
        return { apiKey: newApiKey };
      });
  }

  // TODO: Will include stats eventually, not bothering to define the interfaces for now
  profile(params: { username: string }): Promise<{
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    badges: {
      title: string;
      description: string;
      icon: string;
    }[];
  }> {
    let badges: {
      title: string;
      description: string;
      icon: string;
    }[] = [];

    let userData: {
      firstName: string | null;
      lastName: string | null;
      username: string | null;
    } = { firstName: null, lastName: null, username: null };

    const queryPromises: Promise<any>[] = [];

    // get user information
    queryPromises.push(
      this.knex
        .select("firstName", "lastName", "username", "email")
        .from("users")
        .where({ username: params.username })
        .then(
          (
            rows: {
              email: string;
              firstName: string | null;
              lastName: string | null;
              username: string | null;
            }[]
          ) => {
            userData = rows[0];
          }
        )
    );

    // get badges
    queryPromises.push(
      this.knex
        .select("fragmentExcerpts.data", "fragmentRefs.uri")
        .from("fragmentExcerpts")
        .join(
          "fragmentRefs",
          "fragmentRefs.fragmentExcerptId",
          "fragmentExcerpts.id"
        )
        .join("responses", "responses.fragmentRefUri", "fragmentRefs.uri")
        .join("enrollments", "enrollments.id", "responses.enrollmentId")
        .join("users", "users.id", "enrollments.userId")
        .where("fragmentExcerpts.contentType", "=", "Badge")
        .andWhere("users.username", "=", params.username)
        .orderBy("responses.createdAt", "desc")
        .then(
          (
            rows: {
              uri: string;
              data: { title: string; description: string; icon: string };
            }[]
          ) => {
            const badgesByFragmentUri: any = {};
            rows.map((row) => {
              badgesByFragmentUri[row.uri] = row.data;
            });
            badges = Object.values(badgesByFragmentUri);
          }
        )
    );

    return Promise.all(queryPromises).then(() => {
      return {
        ...userData,
        badges,
      };
    });
  }
}
