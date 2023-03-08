// const TagsDbWrapper = require('../../TagsDbWrapper')
import { TagsDbWrapper } from "../../TagsDbWrapper";
import { TopicsDbWrapper } from "../../TopicsDbWrapper";
import { DocumentsDbWrapper } from "../../DocumentsDbWrapper";
import {
  DocumentCompletionActivityItem,
  DocumentCompletionSeedData,
  EnrollmentActivityItem,
  EnrollmentInsertionData,
  EnrollmentSeedData,
  ResponseActivityItem,
  ResponseInsertionData,
  ResponseSeedData,
  TopicCompletionActivityItem,
  TopicCompletionSeedData,
  UserActivityCollection,
  UserActivityCollectionEntry,
  UserActivityEvent,
  UserActivityEventInsertionData,
} from "../../../../../types/seeder";
import { SavedSeedUser } from "../types/user";
import { ExpandedTopic } from "@b5x/types";
import { ExpandedDocument } from "@b5x/types";
import { SavedFragment } from "@b5x/types";
const { v4: uuidv4 } = require("uuid");

// TODO: Include new stateful fragments:
// - slideshow
// - checklist

export class UserActivitySeeder {
  tags: TagsDbWrapper;
  topics: TopicsDbWrapper;
  documents: DocumentsDbWrapper;
  retryResponseDepth: number;
  uuidToIdMappings: Record<string, number>;
  knex: any;

  constructor(knex: any) {
    this.knex = knex;
    this.tags = new TagsDbWrapper(knex);
    this.topics = new TopicsDbWrapper(knex);
    this.documents = new DocumentsDbWrapper(knex);
    this.retryResponseDepth = 1;
    this.uuidToIdMappings = {};
  }

  /**
   *  Build all activity in memory for each user,
   *  then batch-insert it all into the database.
   */
  async insertUserActivity(params: {
    users: SavedSeedUser[];
    insertedTopics: ExpandedTopic[];
  }) {
    // accumulators that gather data across all users
    let accEnrollments: EnrollmentSeedData[] = [];
    let accResponses: ResponseSeedData[] = [];
    let accDocumentCompletions: DocumentCompletionSeedData[] = [];
    let accTopicCompletions: TopicCompletionSeedData[] = [];
    let accEvents: UserActivityEvent[] = [];

    params.users.forEach((user) => {
      const {
        enrollments,
        responses,
        documentCompletions,
        topicCompletions,
        events,
      } = this.#buildUserActivity({
        user,
        insertedTopics: params.insertedTopics,
      });

      accEnrollments = [...accEnrollments, ...enrollments];
      accResponses = [...accResponses, ...responses];
      accDocumentCompletions = [
        ...accDocumentCompletions,
        ...documentCompletions,
      ];
      accTopicCompletions = [...accTopicCompletions, ...topicCompletions];
      accEvents = [...accEvents, ...events];
    });

    // These cannot be done in parallel,
    // as each one depends on UUID->ID mappings from the previous one
    if (accEnrollments.length > 0) {
      await this.#batchInsertEnrollments({ enrollments: accEnrollments }).catch(
        (e: any) => {
          throw e;
        }
      );
    }
    if (accResponses.length > 0) {
      await this.#batchInsertResponses({ responses: accResponses }).catch(
        (e: any) => {
          throw e;
        }
      );
    }
    if (accEvents.length > 0) {
      await this.#batchInsertEvents({ events: accEvents }).catch((e: any) => {
        throw e;
      });
    }

    // Insert document completions --
    // cannot be done in parallel, or seed data will not be consistent/verifiable
    for (let i = 0; i < accDocumentCompletions.length; i++) {
      const { insertionData } = accDocumentCompletions[i];
      const { userId, documentUri } = insertionData;
      await this.documents
        .markAsComplete({ userId, documentUri })
        .catch((e: any) => {
          throw e;
        });
    }

    // Insert topic completions --
    // cannot be done in parallel, or seed data will not be consistent/verifiable
    for (let i = 0; i < accTopicCompletions.length; i++) {
      const { insertionData } = accTopicCompletions[i];
      const { userId, topicUri, topicSlug } = insertionData;
      // these two tag adds mimic the behavior of topics.markAsComplete, which cannot be run here
      // because it parallelizes its operations, creating unpredictability in the seed data
      await this.tags
        .add({
          userId,
          key: "completed-topic-slug",
          value: topicSlug,
        })
        .catch((e: any) => {
          throw e;
        });

      await this.tags
        .add({
          userId,
          key: "completed-topic-uri",
          value: topicUri,
        })
        .catch((e: any) => {
          throw e;
        });
    }

    return true;
  }

  #getOrderedFragmentUris(
    fragmentUris: string[],
    fragmentsByUri: Record<string, SavedFragment>
  ) {
    let orderedUris: string[] = [];
    fragmentUris.forEach((fragmentUri) => {
      const fragment = fragmentsByUri[fragmentUri];
      orderedUris = orderedUris.concat([
        fragmentUri,
        ...this.#getOrderedFragmentUris(fragment.childUris, fragmentsByUri),
      ]);
    });
    return orderedUris;
  }

  /*
  #getOrderedFragmentAliases(params: { contentMap: ContentMapNode[] }) {
    let orderedFragmentAliases: string[] = [];
    params.contentMap.forEach(fragment => {
      orderedFragmentAliases.push(fragment.alias)
      orderedFragmentAliases = [...orderedFragmentAliases, ...this.#getOrderedFragmentAliases({ contentMap: fragment.children })]
    })
    return orderedFragmentAliases
  }
  */

  #buildUserActivity(params: {
    user: SavedSeedUser;
    insertedTopics: ExpandedTopic[];
  }): UserActivityCollection {
    let userActivity: UserActivityCollection = {
      enrollments: [],
      responses: [],
      documentCompletions: [],
      topicCompletions: [],
      events: [],
    };

    // handle blank user case:
    // do nothing
    if (params.user.persona === "blank") {
      return userActivity;
    }

    // get the digit from the username -- used to vary seed data in a consistent way
    const userConstant = this.#getUserConstant(params.user);

    // collect everything in a linear format first for easy timestamping
    let orderedActivityItems: UserActivityCollectionEntry[] = [];

    // determine breakpoints for variable-catalog users --
    // these are fairly arbitrary, just mixing it up enough
    // to generate some interesting topic funnels
    const oneThird = params.insertedTopics.length / 3;
    const twoThirds = oneThird * 2;
    let variableCatalogBreakpoint1: number;
    let variableCatalogBreakpoint2: number;
    if (userConstant > oneThird) {
      variableCatalogBreakpoint1 = oneThird;
      variableCatalogBreakpoint2 = twoThirds;
    } else {
      variableCatalogBreakpoint1 = userConstant;
      variableCatalogBreakpoint2 = userConstant * 2;
    }

    params.insertedTopics.forEach((topic, idx) => {
      let retryCount = 1;

      // skip the first third for the variable-catalog persona
      if (
        params.user.persona === "variable-catalog" &&
        idx < variableCatalogBreakpoint1
      ) {
        return;
      }

      // enroll the user in the topic
      // AWKWARD: This currently does not verify whether the user has access
      // to a given topic, so they may be enrolled in a topic they can't access.
      // This doesn't really hurt anything, it's just inaccurate.
      const enrollmentActivity = this.#buildEnrollmentActivity({
        user: params.user,
        topic,
      });
      const enrollment = enrollmentActivity.enrollment;
      orderedActivityItems = orderedActivityItems.concat([
        { category: "enrollments", obj: enrollment },
        { category: "events", obj: enrollmentActivity.event },
      ]);

      // leave the second third at the enrollment stage for the variable-catalog persona
      if (
        params.user.persona === "variable-catalog" &&
        idx < variableCatalogBreakpoint2
      ) {
        return;
      }

      // leave all 'enrolled' personas at the enrollment stage
      if (params.user.persona === "enrolled") {
        return;
      }

      let completedDocumentCount = 0;

      // generate activity for each topic document
      topic.documents.forEach((document, i) => {
        if (
          params.user.persona === "variable-catalog" &&
          i > variableCatalogBreakpoint1
        ) {
          return;
        }

        completedDocumentCount++;

        // create a response for each completable fragment in the document
        const orderedFragmentUris = this.#getOrderedFragmentUris(
          document.childUris,
          document.fragmentsByUri
        );
        orderedFragmentUris.forEach((fragmentUri) => {
          const fragment = document.fragmentsByUri[fragmentUri];

          // skip fragments that do not require a response
          if (!fragment.isRequired) {
            return;
          }

          let numResponses = 1;

          // if the question is retryable, choose a predictable number of retries
          if (
            [
              "ShortTextQuestion",
              "LongTextQuestion",
              "SingleSelectQuestion",
            ].includes(fragment.contentType)
          ) {
            if (retryCount > userConstant) {
              retryCount = 1;
              numResponses = retryCount;
            } else {
              retryCount++;
              numResponses = retryCount;
            }
          }

          for (let i = 0; i < numResponses; i++) {
            const responseActivity = this.#buildResponseActivity({
              user: params.user,
              enrollment,
              fragment,
            });
            orderedActivityItems = orderedActivityItems.concat([
              { category: "responses", obj: responseActivity.response },
              { category: "events", obj: responseActivity.event },
            ]);
          }
        });

        // mark the document as completed
        const documentCompletionActivity =
          this.#buildDocumentCompletionActivity({
            user: params.user,
            document,
          });
        orderedActivityItems = orderedActivityItems.concat([
          {
            category: "documentCompletions",
            obj: documentCompletionActivity.documentCompletion,
          },
          { category: "events", obj: documentCompletionActivity.event },
        ]);
      });

      // mark the topic as completed if all documents were completed
      if (completedDocumentCount === topic.documents.length) {
        const topicCompletionActivity = this.#buildTopicCompletionActivity({
          user: params.user,
          topic,
        });
        orderedActivityItems = orderedActivityItems.concat([
          {
            category: "topicCompletions",
            obj: topicCompletionActivity.topicCompletion,
          },
          { category: "events", obj: topicCompletionActivity.event },
        ]);
      }
    });

    // add timestamps to orderedActivityItems, and add them to the result
    const timestamps = this.#generateActivityTimestamps({
      numDays: 30,
      numTimestamps: orderedActivityItems.length,
    });
    orderedActivityItems.forEach((item, i) => {
      item.obj.insertionData.createdAt = new Date(timestamps[i]).toISOString();
      // @ts-ignore
      userActivity[item.category].push(item.obj);
    });

    return userActivity;
  }

  /**
   *  Enrollment building
   */

  #buildEnrollmentActivity(params: {
    user: SavedSeedUser;
    topic: ExpandedTopic;
  }): EnrollmentActivityItem {
    const enrollmentUuid = uuidv4();
    return {
      enrollment: {
        insertionData: {
          userId: params.user.id,
          topicUri: params.topic.uri,
          createdAt: null,
          currentDocumentUri: params.topic.documents[0].uri,
        },
        uuid: enrollmentUuid,
      },
      event: {
        insertionData: {
          name: "enrollmentCreated",
          createdAt: null,
          data: {
            enrollments: [], // enrollment ID will be added later, upon enrollment creation
            users: [params.user.id],
            topics: [params.topic.uri],
          },
        },
        foreignUuids: { enrollments: enrollmentUuid },
      },
    };
  }

  /**
   *  Enrollment insertion
   */
  async #batchInsertEnrollments(params: { enrollments: EnrollmentSeedData[] }) {
    let enrollmentsToInsert: EnrollmentInsertionData[] = [];
    let enrollmentUuids: string[] = [];

    // split the UUIDs from the insertable data
    params.enrollments.forEach((enrollment) => {
      enrollmentUuids.push(enrollment.uuid);
      enrollmentsToInsert.push(enrollment.insertionData);
    });

    // batch-insert the enrollments
    return this.knex("enrollments")
      .returning("id")
      .insert(enrollmentsToInsert)
      .then((enrollmentRows: { id: number }[]) => {
        // update the uuid -> id mappings,
        // so that existing events bearing the uuid
        // can be connected to these IDs
        enrollmentRows.forEach((row, i) => {
          const uuid = enrollmentUuids[i];
          this.uuidToIdMappings[uuid] = row.id;
        });
      })
      .then(() => {
        return true;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  /**
   *  Supplies an integer for a given user name. It's done in a silly way,
   *  but the constant itself doesn't really matter, it just needs to be consistent,
   *  vary from seeded user to seeded user, and work for any user email.
   */
  #getUserConstant(user: SavedSeedUser): number {
    let numString = "";
    // if it's a seed user (e.g., blank-1),
    // use the number in the email
    for (let i = 0; i < user.email.length; i++) {
      const char = user.email[i];
      if (!isNaN(parseInt(char))) {
        numString += char;
        break;
      }
    }
    if (numString.length > 0) {
      return parseInt(numString);
      // otherwise, just return 1    TODO: add variety to this, maybe with user.email.length % 10 or something?
    } else {
      return 1;
    }
  }

  #buildResponseActivity(params: {
    user: SavedSeedUser;
    enrollment: EnrollmentSeedData;
    fragment: SavedFragment;
  }): ResponseActivityItem {
    const userConstant = this.#getUserConstant(params.user);
    const responseValue = this.#getDefaultResponseValue({
      fragment: params.fragment,
      userConstant,
    });
    const responseUuid = uuidv4();

    return {
      response: {
        insertionData: {
          enrollmentId: null,
          fragmentRefUri: params.fragment.fragmentRefUri,
          value: responseValue,
          status: "completed",
          createdAt: null,
        },
        uuid: responseUuid,
        foreignUuids: { enrollment: params.enrollment.uuid },
      },
      event: {
        insertionData: {
          name: "responseSubmitted",
          createdAt: null,
          data: {
            fragments: [params.fragment.fragmentRefUri],
            documents: [params.fragment.documentUri],
            users: [params.user.id],
            topics: [params.enrollment.insertionData.topicUri],
            enrollments: [], // TODO: Add enrollment ID in later? It should be there for accuracy
            responses: [], // TODO: Will add response ID later, when response has actually been created
          },
        },
        foreignUuids: {
          responses: responseUuid,
          enrollments: params.enrollment.uuid,
        },
      },
    };
  }

  /**
   *  IMPORTANT: Enrollments must be batch-inserted before this runs.
   */
  async #batchInsertResponses(params: { responses: ResponseSeedData[] }) {
    let responsesToInsert: ResponseInsertionData[] = [];
    let responseUuids: string[] = [];

    // split the UUIDs from the insertable data
    params.responses.forEach((response) => {
      responseUuids.push(response.uuid);
      // insert the enrollment ID
      const enrollmentUuid = response.foreignUuids["enrollment"];
      response.insertionData.enrollmentId =
        this.uuidToIdMappings[enrollmentUuid];
      responsesToInsert.push(response.insertionData);
    });

    // batch-insert the responses
    return this.knex("responses")
      .returning("id")
      .insert(responsesToInsert)
      .then((responseRows: { id: number }[]) => {
        // update the uuid -> id mappings,
        // so that existing events bearing the uuid
        // can be connected to these IDs
        responseRows.forEach((row, i) => {
          const uuid = responseUuids[i];
          this.uuidToIdMappings[uuid] = row.id;
        });
      })
      .then(() => {
        return true;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  /**
   *  IMPORTANT: Enrollments and responses must be batch-inserted before this runs.
   */
  async #batchInsertEvents(params: { events: UserActivityEvent[] }) {
    let eventsToInsert: UserActivityEventInsertionData[] = [];

    // add foreign IDs using uuid mappings
    params.events.forEach((event) => {
      if ("foreignUuids" in event) {
        for (const [tableName, uuid] of Object.entries(event.foreignUuids)) {
          const rowId = this.uuidToIdMappings[uuid];
          // @ts-ignore
          event.insertionData.data[tableName].push(rowId);
        }
      }
      eventsToInsert.push(event.insertionData);
    });

    // batch-insert the events
    return this.knex("events")
      .insert(eventsToInsert)
      .then(() => {
        return true;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  #buildDocumentCompletionActivity(params: {
    user: SavedSeedUser;
    document: ExpandedDocument;
  }): DocumentCompletionActivityItem {
    return {
      documentCompletion: {
        insertionData: {
          userId: params.user.id,
          documentUri: params.document.uri,
          createdAt: null,
        },
      },
      event: {
        insertionData: {
          createdAt: null,
          name: "documentCompleted",
          data: {
            topics: [params.document.topicUri],
            documents: [params.document.uri],
            users: [params.user.id],
          },
        },
      },
    };
  }

  #buildTopicCompletionActivity(params: {
    user: SavedSeedUser;
    topic: ExpandedTopic;
  }): TopicCompletionActivityItem {
    return {
      topicCompletion: {
        insertionData: {
          userId: params.user.id,
          topicUri: params.topic.uri,
          topicSlug: params.topic.slug,
          topicVersion: params.topic.version,
          createdAt: null,
        },
      },
      event: {
        insertionData: {
          name: "topicCompleted",
          data: {
            topics: [params.topic.uri],
            users: [params.user.id],
          },
          createdAt: null,
        },
      },
    };
  }

  #getDefaultResponseValue(params: {
    fragment: SavedFragment;
    userConstant: number;
  }) {
    let longText =
      "Mollit in ipsum in ipsum ad. Quis Lorem dolor cillum. Mollit ea consequat irure incididunt do ad sint. Sunt sunt occaecat irure. Do nostrud irure amet nulla. Cillum ea cupidatat cillum labore enim do. ";
    let longTextResponse = "";
    for (let i = 0; i < params.userConstant; i++) {
      longTextResponse += longText;
    }

    let npsResponse;
    if (params.userConstant % 2 === 0) {
      npsResponse = 10;
    } else if (params.userConstant % 3 === 0) {
      npsResponse = 9;
    } else if (params.userConstant < 5) {
      npsResponse = 8;
    } else if (params.userConstant < 10) {
      npsResponse = params.userConstant + 1;
    } else {
      npsResponse = 10 % params.userConstant;
    }

    const defaultResponsesByContentType = {
      ContinueButton: "t",
      ShortTextQuestion: "short-text-answer",
      LongTextQuestion: longTextResponse,
      FiveStarRating: 5,
      NpsQuestion: npsResponse,
    };

    if (params.fragment.contentType === "SingleSelectQuestion") {
      return JSON.stringify(params.fragment.data.choices[0].value);
    } else if (params.fragment.contentType === "MultiSelectQuestion") {
      let response: Record<any, boolean> = {};
      // @ts-ignore
      params.fragment.data.choices.forEach((choice, i) => {
        if (i % 2 === 0) {
          response[choice.value] = true;
        } else {
          response[choice.value] = false;
        }
      });
      return JSON.stringify(response);
    } else if (params.fragment.contentType === "Rubric") {
      let response: Record<any, boolean> = {};
      // @ts-ignore
      params.fragment.data.answers.forEach((answer, i) => {
        if (i % 2 === 0) {
          response[answer.id] = true;
        } else {
          response[answer.id] = false;
        }
      });
      return JSON.stringify(response);
    } else {
      return JSON.stringify(
        // @ts-ignore
        `${defaultResponsesByContentType[params.fragment.contentType]}`
      );
    }
  }

  #generateRandomTimestamp(start: Date, end: Date): number {
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return randomDate.getTime();
  }

  /**
   *  Spread x timestamps across y days to simulate activity history
   */
  #generateActivityTimestamps(params: {
    numDays: number;
    numTimestamps: number;
  }) {
    const endDate = new Date(); // today
    // const end = endDate.getTime()
    const startDate = new Date(
      new Date().setDate(endDate.getDate() - params.numDays)
    );

    let timestamps: number[] = [];
    for (let t = 0; t < params.numTimestamps; t++) {
      const timestamp = this.#generateRandomTimestamp(startDate, endDate);
      timestamps.push(timestamp);
    }

    timestamps.sort();
    return timestamps;
  }
}
