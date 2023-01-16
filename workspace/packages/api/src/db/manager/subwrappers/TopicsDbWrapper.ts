const crypto = require("crypto");
import { TagsDbWrapper } from "./TagsDbWrapper";
import { DbWrapper } from "./DbWrapper";
import { DocumentsDbWrapper } from "./DocumentsDbWrapper";
import {
  ExpandedTopic,
  PublicTopic,
  RawTopic,
  SavedTopic,
  TopicAccessLevel,
  TopicAccessRule,
  TopicCompletionStatus,
  TopicConfig,
  UnmetTopicPrerequisite,
  RawCatalogTopic,
  TopicInfo,
} from "@b5x/types";
import { Catalog } from "@b5x/types";
const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");

export class TopicsDbWrapper extends DbWrapper {
  tags: TagsDbWrapper;
  documents: DocumentsDbWrapper;
  knex: any;

  constructor(knex: any) {
    super(knex, "topics");
    this.knex = knex;
    this.tags = new TagsDbWrapper(knex);
    this.documents = new DocumentsDbWrapper(knex);
  }

  async register(params: { slug: string }) {
    // verify that the slug is not already taken
    // if the slug is not taken, publish an MVP draft to reserve the slug
    // return the version of the MVP draft,
    // so the CLI tool can store that as the current version
    const slugIsAvailable = await this.knex
      .select("id")
      .from("topics")
      .where({ slug: params.slug })
      .then((rows: { id: number }[]) => {
        return rows.length === 0;
      });

    if (!slugIsAvailable) {
      throw `Topic slug ${params.slug} is already in use`; // TODO: Make a custom error for this sort of thing?
    }

    // create essentially empty topic
    await this.knex("topics").insert({ slug: params.slug });

    return true;
  }

  async markAsComplete(params: { userId: number; topicUri: string }) {
    const { slug, version } = this.parseTopicUri(params.topicUri);
    const taggingPromises = [
      this.tags.add({
        userId: params.userId,
        key: "completed-topic-uri",
        value: `${slug}-v${version}`,
      }),
      this.tags.add({
        userId: params.userId,
        key: "completed-topic-slug",
        value: slug,
      }),
    ];
    Promise.all(taggingPromises).then(() => {
      return true;
    });
  }

  // TODO: Refactor, this is gigantic and could probably also be sped up with better SQL ...
  // is there a way to assign rule strengths inside of SQL instead of looping through?
  async getCatalog(params: { userId: number }) {
    let queryPromises: Promise<any>[] = [];

    // Populate the user's access group names
    let userGroupNames = ["all"];

    queryPromises.push(
      this.tags
        .all({ userId: params.userId, key: "user-group" })
        .then((tags) => {
          tags.forEach((tag) => {
            userGroupNames.push(tag.value);
          });
          return userGroupNames;
        })
    );

    // Fetch all of the user's enrolled topic uris -- these are in progress
    let currentDocumentUrisByTopicUri: Record<string, string> = {};
    let enrolledTopicUris: string[] = [];

    queryPromises.push(
      // TODO: For version pancaking, this query will need to pull more topic data,
      // and when multiple enrollments in the same topic are found, only the
      // most recent topic version should be displayed in the catalog
      this.knex
        .select("topicUri", "currentDocumentUri")
        .from("enrollments")
        .where({ userId: params.userId })
        .then((rows: { topicUri: string; currentDocumentUri: string }[]) => {
          rows.forEach(({ topicUri, currentDocumentUri }) => {
            enrolledTopicUris.push(topicUri);
            currentDocumentUrisByTopicUri[topicUri] = currentDocumentUri;
          });
          return { currentDocumentUrisByTopicUri, enrolledTopicUris };
        })
    );

    // Populate the user's completed topic URIs and slugs
    let completedTopicUris: string[] = [];
    let completedTopicSlugs: string[] = [];

    queryPromises.push(
      this.tags
        .all({ userId: params.userId, key: "completed-topic-uri" })
        .then((tags) => {
          tags.forEach((tag) => {
            completedTopicUris.push(tag.value);
            const { slug } = this.parseTopicUri(tag.value);
            completedTopicSlugs.push(slug);
          });
          return completedTopicUris;
        }) // TODO: un-hardcode completed topic key
    );

    // Wait for all of the above to finish,
    // as this data is required for the next section
    await Promise.all(queryPromises);

    interface TopicWithAccessLevelQueryResult extends SavedTopic {
      accessLevel: TopicAccessLevel;
    }

    const topicsWithAccessLevel: TopicWithAccessLevelQueryResult[] =
      await this.knex
        .select(
          "accessRules.accessLevel",
          "topics.uri",
          "topics.config",
          "topics.version",
          "topics.slug",
          "topics.subtitle",
          "topics.title",
          "topics.coverImageUrl"
        )
        .from("accessRules")
        .leftJoin("topics", "topics.slug", "accessRules.topicSlug")
        .whereIn("accessRules.groupName", userGroupNames)
        .whereIn("accessRules.accessLevel", [
          "blocked",
          "assigned",
          "recommended",
          "available",
        ])
        .orderBy("topics.version", "desc")
        .orderBy("topics.title", "asc");

    // Calculate access level for each topic
    // (the strongest rule wins)
    // TODO: Won't some of these rules be out of date?
    // Like if a more recent version is shipped with broader rules,
    // shouldn't people still be given access even if an older block rule
    // is still in place in the database?
    // So the date the rule was set matters too.
    // TODO: Pull this out into its own function.
    const accessLevelBySlug: Record<string, TopicAccessLevel> = {};

    const ruleStrengths = {
      blocked: 4,
      assigned: 3,
      recommended: 2,
      available: 1,
    };

    topicsWithAccessLevel.forEach((topicWithAccessLevel) => {
      const topicSlug = topicWithAccessLevel.slug;
      const newAccessLevel = topicWithAccessLevel.accessLevel;
      // replace existing access level if new rule is stronger
      if (accessLevelBySlug[topicSlug]) {
        const currentAccessLevel = accessLevelBySlug[topicSlug];
        // @ts-ignore
        const currentRuleStrength = ruleStrengths[currentAccessLevel];
        // @ts-ignore
        const newRuleStrength = ruleStrengths[newAccessLevel];
        if (newRuleStrength > currentRuleStrength) {
          accessLevelBySlug[topicSlug] = topicWithAccessLevel.accessLevel;
        }
        // if no existing rule is found, default to the current rule
      } else {
        accessLevelBySlug[topicSlug] = topicWithAccessLevel.accessLevel;
      }
    });

    // Build a user-specific topic list to run further calculations on
    const precalculatedTopicsBySlug: Record<string, RawCatalogTopic> = {};

    topicsWithAccessLevel.forEach((topicWithAccessLevel) => {
      const topicSlug = topicWithAccessLevel.slug;
      const prerequisites = topicWithAccessLevel.config.prerequisites;
      // add topic to topics list, if it's not already there
      if (!precalculatedTopicsBySlug[topicSlug]) {
        const { uri, version, slug, subtitle, title, coverImageUrl } =
          topicWithAccessLevel;
        precalculatedTopicsBySlug[topicSlug] = {
          uri,
          version,
          slug,
          subtitle,
          title,
          coverImageUrl,
          contentMode: topicWithAccessLevel.config.contentMode,
          prerequisites,
        };
      } else {
        // only replace the existing entry if the user is enrolled in this particular topic id
        // TODO: on topic migration, consider updating the existing enrollment
        // instead of creating new ones, it will make this logic simpler
        if (enrolledTopicUris.includes(topicWithAccessLevel.uri)) {
          const { uri, version, slug, subtitle, title, coverImageUrl } =
            topicWithAccessLevel;
          precalculatedTopicsBySlug[topicSlug] = {
            uri,
            version,
            slug,
            subtitle,
            title,
            coverImageUrl,
            contentMode: topicWithAccessLevel.config.contentMode,
            prerequisites,
          };
        }
      }
    });

    // Build the list of this specific user's unmet prequisites
    // for each topic
    const unmetPrerequisitesBySlug: Record<string, UnmetTopicPrerequisite[]> =
      {};

    for (const topicSlug of Object.keys(precalculatedTopicsBySlug)) {
      const topic = precalculatedTopicsBySlug[topicSlug];
      const prerequisiteSlugs = topic.prerequisites;
      if (unmetPrerequisitesBySlug[topicSlug] === undefined) {
        unmetPrerequisitesBySlug[topicSlug] = [];
      }
      prerequisiteSlugs.forEach((prerequisiteSlug) => {
        if (!completedTopicSlugs.includes(prerequisiteSlug)) {
          unmetPrerequisitesBySlug[topicSlug].push({
            title: precalculatedTopicsBySlug[prerequisiteSlug].title,
            uri: precalculatedTopicsBySlug[prerequisiteSlug].uri,
          });
        }
      });
    }

    // Calculate the completion status and currentDocumentId for each topic
    const completionStatusBySlug: Record<string, TopicCompletionStatus> = {};
    const currentDocumentUrisByTopicSlug: Record<string, string | null> = {};

    for (const topicSlug of Object.keys(precalculatedTopicsBySlug)) {
      const currentTopic = precalculatedTopicsBySlug[topicSlug];

      let completionStatus: TopicCompletionStatus;
      let currentDocumentUri: string | null;
      const topicUri = `${currentTopic.slug}-v${currentTopic.version}`;

      // skip blocked topics
      if (accessLevelBySlug[topicSlug] === "blocked") {
        continue;
      }

      // AWKWARD: probably not the most efficient approach,
      // but can tune when overall catalog logic is more finalized
      if (completedTopicUris.includes(topicUri)) {
        completionStatus = "completed";
        currentDocumentUri = currentDocumentUrisByTopicUri[currentTopic.uri];
      } else if (enrolledTopicUris.includes(currentTopic.uri)) {
        completionStatus = "in progress";
        currentDocumentUri = currentDocumentUrisByTopicUri[currentTopic.uri];
        // TODO: Because completions are tracked with tags instead of in the enrollment,
        // there's going to be an issue here when versions are being pancaked.
      } else {
        completionStatus = "not started";
        currentDocumentUri = null;
      }

      completionStatusBySlug[topicSlug] = completionStatus;
      currentDocumentUrisByTopicSlug[topicSlug] = currentDocumentUri;
    }

    const catalog: Catalog = { topics: [] };

    // Populate and return the catalog of topics
    for (const topicSlug of Object.keys(precalculatedTopicsBySlug)) {
      // skip blocked topics
      if (accessLevelBySlug[topicSlug] === "blocked") {
        continue;
      }

      catalog.topics.push({
        ...precalculatedTopicsBySlug[topicSlug],
        priorityLevel: accessLevelBySlug[topicSlug],
        firstDocumentUri: await this.getFirstDocumentUri({
          topicUri: precalculatedTopicsBySlug[topicSlug].uri,
        }), // TODO: Inefficient N+1 query
        currentDocumentUri: currentDocumentUrisByTopicSlug[topicSlug],
        unmetPrerequisites: unmetPrerequisitesBySlug[topicSlug],
        completionStatus: completionStatusBySlug[topicSlug],
      });
    }

    return catalog;
  }

  getFirstDocumentUri(params: { topicUri: string }): Promise<string> {
    return this.knex
      .select("uri")
      .from("documents")
      .where({ topicUri: params.topicUri })
      .orderBy("order")
      .limit(1)
      .cache()
      .then((documentRows: { uri: string }[]) => {
        return documentRows[0].uri;
      });
  }

  parseTopicUri(uri: string) {
    const topicUriRegex = /^(.*)-v(.*)$/; // TODO: Make the version separator a double dash or something, for safety, and throw an error if the initial slug contains a double dash
    const match = uri.match(topicUriRegex);
    if (match) {
      return {
        slug: match[1],
        version: match[2],
      };
    } else {
      throw `Unable to parse topic uri: ${uri}`;
    }
  }

  async info(params: { uri?: string; slug?: string }): Promise<TopicInfo> {
    let version;
    let { uri, slug } = params;

    if (uri) {
      const parsedTopicUri = this.parseTopicUri(uri);
      slug = parsedTopicUri.slug;
      version = parsedTopicUri.version;
      // if the version is not known, pull the latest available version
    } else {
      version = await this.knex
        .select("version")
        .from("topics")
        .where({ slug })
        .orderBy("version", "desc")
        .limit(1)
        .then((rows: { version: number | string }[]) => {
          return rows[0].version;
        });
    }

    // fetch topic
    const topic = await this.knex
      .select(
        "uri",
        "title",
        "config",
        "slug",
        "coverImageUrl",
        "version",
        "subtitle"
      )
      .from("topics")
      .where({ slug, version })
      .limit(1)
      .cache()
      .then((rows: SavedTopic[]) => {
        if (rows.length > 0) {
          const topic = rows[0];
          return topic;
        } else {
          return undefined;
        }
      });

    // fetch prereqs and first document ID
    let queryPromises: Promise<any>[] = [];

    // still need to fetch prereqs here since the access check can already do it?
    queryPromises.push(
      this.knex
        .select(this.knex.raw("MAX(version) AS version"), "slug", "title")
        .from("topics")
        .whereIn("slug", topic.config.prerequisites)
        .orderBy("title")
        .groupBy("slug", "title")
        .then(
          (
            prerequisites: { version: number; slug: string; title: string }[]
          ) => {
            topic.prerequisites = prerequisites.map((prereq) => {
              return { slug: prereq.slug, title: prereq.title };
            });
          }
        )
    );

    queryPromises.push(
      this.getFirstDocumentUri({ topicUri: topic.uri }).then((documentUri) => {
        topic.firstDocumentUri = documentUri;
      })
    );

    await Promise.all(queryPromises);

    return topic;
  }

  async contents(params: { uri: string }): Promise<PublicTopic> {
    const { slug, version } = this.parseTopicUri(params.uri);

    interface TopicContentsQueryResultRow {
      topicUriCol: string;
      documentUriCol: string;
      topicTitleCol: string;
      config: TopicConfig;
      documentTitleCol: string;
      slug: string;
      coverImageUrl: string;
      version: number;
      subtitle: string;
      createdAt: Date;
    }

    const topic = await this.knex
      .select(
        "topics.uri AS topicUriCol",
        "documents.uri AS documentUriCol",
        "topics.title AS topicTitleCol",
        "topics.config",
        "documents.title AS documentTitleCol",
        "topics.slug",
        "topics.coverImageUrl",
        "topics.version",
        "topics.subtitle",
        "documents.createdAt"
      )
      .from("topics")
      .where("topics.slug", "=", slug)
      .andWhere("topics.version", "=", version)
      .leftJoin("documents", "topics.uri", "documents.topicUri")
      .orderBy("documents.order", "asc")
      .cache()
      .then((results: TopicContentsQueryResultRow[]) => {
        // build the topic object using any row (since they all contain the same topic data)
        let topic: PublicTopic = {
          uri: results[0].topicUriCol,
          subtitle: results[0].subtitle,
          title: results[0].topicTitleCol,
          coverImageUrl: results[0].coverImageUrl,
          slug: results[0].slug,
          config: results[0].config,
          documents: [],
          prerequisites: [],
        };

        // weave the documents into the topic
        results.forEach((result) => {
          topic.documents.push({
            uri: result.documentUriCol,
            title: result.documentTitleCol,
            topicUri: results[0].topicUriCol,
          });
        });

        return topic;
      });

    const prerequisites = await this.knex
      .select(this.knex.raw("MAX(version) AS version"), "slug", "title")
      .from("topics")
      .whereIn("slug", topic.config.prerequisites)
      .orderBy("title")
      .groupBy("slug", "title")
      .then(
        (prerequisites: { version: number; slug: string; title: string }[]) => {
          topic.prerequisites = prerequisites.map((prereq) => {
            return { slug: prereq.slug, title: prereq.title };
          });
        }
      );

    return topic;
  }

  async publish(params: { topic: RawTopic }): Promise<ExpandedTopic> {
    const savedTopic = await this.#insertTopic({ topic: params.topic });
    await this.#updateAccessRules(savedTopic);

    const expandedDocuments = await this.documents.insertAll({
      documents: params.topic.documents,
    });
    return {
      ...savedTopic,
      documents: expandedDocuments,
    };
  }

  // TODO: Remove access rules from topic config field?
  // AWKWARD: How will draft access rules be set differently?
  // As it is now, a draft will impact the way the live topic behaves
  // if the draft is pushed with different access rules than the live topic
  async #updateAccessRules(topic: SavedTopic) {
    // delete all existing access rules for this topic slug
    return (
      this.knex("accessRules")
        .where({ topicSlug: topic.slug })
        .del()
        // create all configured rules for this topic slug
        .then(() => {
          let accessRulesToInsert: TopicAccessRule[] = [];
          // build configured access rules

          let al: keyof typeof topic.config.groupAccessLevels;
          for (al in topic.config.groupAccessLevels) {
            const groups = topic.config.groupAccessLevels[al];
            // @ts-ignore
            groups.forEach((groupName: string) => {
              accessRulesToInsert.push({
                accessLevel: al,
                groupName,
                topicSlug: topic.slug,
              });
            });
          }

          // build one-off access rules
          let allAccessLevels: TopicAccessLevel[] = [
            "available",
            "recommended",
            "assigned",
            "blocked",
            "reviewable",
            "facilitated",
            "owned",
          ];
          allAccessLevels.forEach((accessLevel) => {
            accessRulesToInsert.push({
              accessLevel,
              groupName: `${topic.slug}-${accessLevel}`,
              topicSlug: topic.slug,
            });
          });

          return this.knex("accessRules").insert(accessRulesToInsert);
        })
        .then(() => {
          return topic;
        })
    );
  }

  /**
   *  Insert a new topic row and version it appropriately.
   *  Does not create the documents or other subentities,
   *  but returns a topic object that can be passed
   *  to those creation functions.
   */
  async #insertTopic(params: { topic: RawTopic }): Promise<SavedTopic> {
    interface NewTopic extends Omit<RawTopic, "documents"> {}

    let topicToInsert: NewTopic = {
      uri: params.topic.uri,
      slug: params.topic.slug,
      title: params.topic.title,
      version: params.topic.version,
      coverImageUrl: params.topic.coverImageUrl,
      subtitle: params.topic.subtitle,
      config: params.topic.config,
    };

    // write the topic to disk and update its information,
    // then return the updated topic
    return this.knex("topics")
      .returning(["uri", "slug", "version"])
      .insert(topicToInsert)
      .then(
        (insertedTopics: { uri: string; slug: string; version: string }[]) => {
          const insertedTopic: SavedTopic = {
            ...params.topic,
            uri: insertedTopics[0].uri,
            version: insertedTopics[0].version,
          };
          return insertedTopic;
        }
      );
  }
}
