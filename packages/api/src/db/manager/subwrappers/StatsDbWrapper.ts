import {
  SavedEvent,
  ActivityMap,
  UserWithStats,
  TopicWithStats,
} from "@b5x/types";

import {
  DraftUserWithStats,
  DocumentWithStats,
  UserResponseWithContentContext,
} from "./types/stats";

export class StatsDbWrapper {
  knex: any;

  constructor(knex: any) {
    this.knex = knex;
  }

  async destroy() {
    return true;
  }

  #calculateNps(scores: number[]): number {
    let promoters: number = 0;
    let detractors: number = 0;

    for (let i = 0, l = scores.length; i < l; i++) {
      if (scores[i] >= 9) promoters++;
      if (scores[i] <= 6) detractors++;
    }

    return Math.round(
      (promoters / scores.length - detractors / scores.length) * 100
    );
  }

  #getTopicStats(): Promise<TopicWithStats[]> {
    interface TopicWithEnrollmentCountRawRow {
      uri: string;
      slug: string;
      title: string;
      version: string;
      createdAt: Date;
      enrollmentCount: string; // TODO: Is this actually a string now or has knex fixed that?
    }

    interface TopicWithEnrollmentCountRow
      extends Omit<TopicWithEnrollmentCountRawRow, "enrollmentCount"> {
      enrollmentCount: number;
    }

    let queryPromises: Promise<any>[] = [];
    let topicsWithEnrollmentCount: TopicWithEnrollmentCountRow[];
    let documents: DocumentWithStats[] = [];
    let documentsByUri: Record<string, DocumentWithStats> = {};
    let documentCompletionTags: DocumentCompletionTagRow[];
    let topicCompletionTags: TopicCompletionTagRow[];
    const npsDataByTopicUri: Record<
      string,
      { calculatedNps: number; scores: number[] }
    > = {};

    // get topics and their enrollment count
    queryPromises.push(
      this.knex
        .select(
          "topics.uri",
          "topics.slug",
          "topics.title",
          "topics.version",
          "topics.createdAt",
          this.knex.raw(`COUNT(enrollments.id) AS enrollment_count`)
        )
        .from("topics")
        .leftJoin("enrollments", "enrollments.topicUri", "topics.uri")
        .groupBy("topics.id")
        .then((rows: TopicWithEnrollmentCountRawRow[]) => {
          topicsWithEnrollmentCount = rows.map((r) => {
            return { ...r, enrollmentCount: parseInt(r.enrollmentCount) };
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // get documents
    queryPromises.push(
      this.knex
        .select("uri", "topicUri", "title")
        .from("documents")
        .orderBy("order")
        .then((rows: { uri: string; topicUri: string; title: string }[]) => {
          // normalize documents by ID for easy lookup
          rows.forEach((row) => {
            let statsDocument: DocumentWithStats = {
              ...row,
              completionCount: 0,
            };
            documents.push(statsDocument); // do we even need this anymore?
            documentsByUri[row.uri] = statsDocument;
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // get topic nps
    queryPromises.push(
      this.knex
        .select("responses.value", "enrollments.topicUri")
        .from("responses")
        .leftJoin("enrollments", "enrollments.id", "responses.enrollmentId")
        .where("responses.fragmentRefUri", "like", "%b5x-topic-nps")
        .then((rows: { value: string; topicUri: string }[]) => {
          // collect the NPS scores by topic Uri
          const npsValuesByTopicUri: Record<string, number[]> = {};
          rows.forEach((row) => {
            if (!npsValuesByTopicUri[row.topicUri]) {
              npsValuesByTopicUri[row.topicUri] = [];
            }
            npsValuesByTopicUri[row.topicUri].push(parseInt(row.value));
          });
          // calculate the NPS for each topic
          Object.keys(npsValuesByTopicUri).forEach((topicUri) => {
            npsDataByTopicUri[topicUri] = {
              calculatedNps: this.#calculateNps(npsValuesByTopicUri[topicUri]),
              scores: npsValuesByTopicUri[topicUri],
            };
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    interface DocumentCompletionTagRow {
      key: string;
      value: number; // document ID
      count: number;
    }

    // get document completion tags/taggings
    queryPromises.push(
      this.knex
        .select("tags.key", "tags.value", this.knex.raw(`COUNT(taggings.id)`))
        .from("tags")
        .leftJoin("taggings", "tags.id", "taggings.tagId")
        .where("taggings.taggableTableName", "=", "users")
        .andWhere("tags.key", "=", "completed-document-uri")
        .groupBy("tags.value", "tags.key")
        .then((rows: { key: string; value: number; count: string }[]) => {
          documentCompletionTags = rows.map((r) => {
            return { ...r, count: parseInt(r.count) };
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    interface TopicCompletionTagRow {
      key: string;
      value: string; // topic URI
      count: number;
    }

    // get topic completion tags/taggings
    queryPromises.push(
      this.knex
        .select("tags.key", "tags.value", this.knex.raw(`COUNT(taggings.id)`))
        .from("tags")
        .leftJoin("taggings", "tags.id", "taggings.tagId")
        .where("taggings.taggableTableName", "=", "users")
        .andWhere("tags.key", "=", "completed-topic-uri")
        .groupBy("tags.value", "tags.key")
        .then((rows: { key: string; value: any; count: string }[]) => {
          topicCompletionTags = rows.map((r) => {
            return { ...r, count: parseInt(r.count) };
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    return Promise.all(queryPromises).then(() => {
      let topicsById: Record<number, TopicWithStats> = {};
      let topicsByUri: Record<string, TopicWithStats> = {};
      // normalize topics by ID for easy updating
      topicsWithEnrollmentCount.forEach((topic) => {
        const topicWithStats: TopicWithStats = {
          ...topic,
          funnel: [],
          completionCount: 0,
          completionRate: 0,
          npsData: npsDataByTopicUri[topic.uri] || {
            calculatedNps: "N/A",
            scores: [],
          },
        };
        // AWKWARD: We currently have to track topics by both ID and URI
        // because topic completions use the URI but documents/document completions don't
        topicsByUri[topicWithStats.uri] = topicWithStats;
      });

      // apply topic completion tags
      topicCompletionTags.forEach((aggregatedTag) => {
        const topicUri = aggregatedTag.value;
        let topic = topicsByUri[topicUri];

        const completionCount = aggregatedTag.count;
        topic.completionCount = completionCount;
        topic.completionRate = Math.floor(
          (100 * completionCount) / topic.enrollmentCount
        );
      });

      // build funnel for each topic out of documents and completion tags

      // apply document completion tags
      documentCompletionTags.forEach((aggregatedTag) => {
        const documentUri = aggregatedTag.value;
        let document = documentsByUri[documentUri];
        document.completionCount = aggregatedTag.count;
      });

      // push documents into topic funnels
      Object.values(documentsByUri).forEach((document) => {
        let topic = topicsByUri[document.topicUri];
        topic.funnel.push({
          documentUri: document.uri,
          completionCount: document.completionCount,
        });
      });

      return Object.values(topicsByUri);
    });
  }

  #getDateString(date: Date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  // TODO: Remove dependency on events older than 30 days for analysis,
  // switching to a cron job that updates user analytics every 15 minutes or so,
  // with the option to force-refresh analytics
  #buildActivityMap(user: DraftUserWithStats) {
    let activityMap: ActivityMap = {};

    // add the last 30 days to the activity map (including today)
    const today = new Date();
    const start = 29;
    let date = new Date(new Date().setDate(today.getDate() - start));
    for (let i = 1; i <= 30; i++) {
      activityMap[this.#getDateString(date)] = 0;
      date = new Date(new Date().setDate(today.getDate() - (start - i)));
    }

    // build the activity map
    user.events.forEach((event: SavedEvent) => {
      const eventDate = new Date(event.createdAt);
      const dateKey = this.#getDateString(eventDate);
      if (activityMap[dateKey] >= 0) {
        activityMap[dateKey]++;
      }
    });

    return activityMap;
  }

  async getStatsData(): Promise<{
    users: { id: number; email: string; createdAt: Date }[];
    events: SavedEvent[]; // TODO: Narrow event name? Data?
    responses: UserResponseWithContentContext[];
    tags: {
      id: number;
      key: string;
      value: any;
      taggingId: number;
      userId: number;
    }[];
  }> {
    let queryPromises: Promise<any>[] = [];

    // retrieve users
    queryPromises.push(
      this.knex.select("id", "email", "createdAt").from("users")
    );

    // retrieve events
    const eventNamesToInclude = ["responseSubmitted", "documentCompleted"];
    queryPromises.push(
      this.knex
        .select("id", "name", "createdAt", "updatedAt", "data")
        .from("events")
        .whereIn("name", eventNamesToInclude)
        .orderBy("createdAt", "desc")
    );

    // retrieve responses with user IDs and content types attached
    queryPromises.push(
      this.knex
        .select(
          "responses.*",
          "enrollments.userId",
          "fragmentExcerpts.contentType"
        )
        .from("responses")
        .leftJoin("enrollments", "responses.enrollmentId", "enrollments.id")
        .leftJoin(
          "fragmentRefs",
          "fragmentRefs.uri",
          "responses.fragmentRefUri"
        )
        .leftJoin(
          "fragmentExcerpts",
          "fragmentExcerpts.id",
          "fragmentRefs.fragmentExcerptId"
        )
        .orderBy("responses.createdAt", "desc")
    );

    // retrieve user tags / taggings
    queryPromises.push(
      this.knex
        .select(
          "tags.id",
          "tags.key",
          "tags.value AS value",
          "taggings.id AS tagging_id",
          "taggings.taggable_id AS user_id"
        )
        .from("tags")
        .leftJoin("taggings", "taggings.tag_id", "tags.id")
        .whereIn("tags.key", ["completed-document-uri", "completed-topic-uri"])
        .andWhere("taggings.taggable_table_name", "=", "users")
    );

    // TODO: Does this need a catch block as well?
    return Promise.all(queryPromises).then(
      ([users, events, responses, tags]) => {
        return {
          users,
          events,
          responses,
          tags,
        };
      }
    );
  }

  getTopicsList(): Promise<TopicWithStats[]> {
    return this.#getTopicStats();
  }

  async getUserList() {
    const { users, events, responses, tags } = await this.getStatsData();

    // collect users by id for easy data accumulation
    let usersById: Record<number, DraftUserWithStats> = {};
    users.forEach((user) => {
      usersById[user.id] = {
        ...user,
        completedDocumentUris: [],
        completedTopicUris: [],
        finalResponsesByFragmentRefUri: {},
        textResponseCount: 0,
        responseCount: 0,
        responseRetryCount: 0,
        totalTextResponseLength: 0,
        events: [],
      };
    });

    // apply tags
    tags.forEach((tag) => {
      if (tag.key === "completed-document-uri") {
        usersById[tag.userId].completedDocumentUris.push(tag.value);
      } else if (tag.key === "completed-topic-uri") {
        usersById[tag.userId].completedTopicUris.push(tag.value);
      }
    });

    // apply responses for analysis
    responses.forEach((response) => {
      const userId = response.userId;
      const fragmentRefUri = response.fragmentRefUri;
      usersById[userId].responseCount++;
      // log a retry when a duplicate response is found, otherwise discard
      if (usersById[userId].finalResponsesByFragmentRefUri[fragmentRefUri]) {
        usersById[userId].responseRetryCount++;
        // if this is the final response (the first one encountered, since responses
        // are in descending chronological order), log its properties for later analysis
      } else {
        usersById[userId].finalResponsesByFragmentRefUri[fragmentRefUri] =
          response.value;
        if (
          ["ShortTextQuestion", "LongTextQuestion"].includes(
            response.contentType
          )
        ) {
          usersById[userId].textResponseCount++;
          usersById[userId].totalTextResponseLength += response.value.length;
        }
      }
    });

    // apply events
    events.forEach((event) => {
      let eventUserIds: number[] = event.data.users;
      eventUserIds.forEach((userId) => {
        usersById[userId].events.push(event);
      });
    });

    // build final list of analyzed users
    let analyzedUsers: UserWithStats[] = [];

    Object.values(usersById).forEach((user) => {
      let lastSeen: Date;
      // base "last seen" value on most recent event if it exists,
      // or the user's creation if it doesn't
      if (user.events.length > 0) {
        lastSeen = user.events[0].createdAt;
      } else {
        lastSeen = user.createdAt;
      }

      let averageResponseLength: number;

      // calculate the average response length
      if (user.textResponseCount > 0) {
        // TODO: Is this actually correct or do I need to multiply by 100?
        averageResponseLength = Math.floor(
          user.totalTextResponseLength / user.textResponseCount
        );
      } else {
        averageResponseLength = 0;
      }

      let analyzedUser: UserWithStats = {
        id: user.id,
        email: user.email,
        lastSeen,
        averageResponseLength,
        responseRetryPercentage:
          Math.round((100 * user.responseRetryCount) / user.responseCount) || 0,
        activityMap: this.#buildActivityMap(user),
        createdAt: user.createdAt,
        responseCount: user.responseCount,
        // AWKWARD: Would be more efficient to sort in SQL by casting the tag value to an int
        completedDocumentUris: user.completedDocumentUris.sort(),
        completedTopicUris: user.completedTopicUris.sort(), // AWKWARD: This used to be topic IDs, not sure if there will be impact
      };

      analyzedUsers.push(analyzedUser);
    });

    return analyzedUsers;
  }
}
