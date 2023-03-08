import { ConditionsChecker } from "@b5x/conditions-manager";
import { TopicsDbWrapper } from "./TopicsDbWrapper";
import { TagsDbWrapper } from "./TagsDbWrapper";
import { DbWrapper } from "./DbWrapper";
import { DocumentStatus } from "@b5x/types";
import { SavedEnrollment, PublicEnrollment, ContentMode } from "@b5x/types";
import { UserResponse, UserResponseStatus } from "@b5x/types";
import { SavedTopic } from "@b5x/types";
import { TagWithTaggingId } from "@b5x/types";
import { ConditionsList } from "@b5x/types";
import Bull, { Queue, Job } from "bull";

type DocumentStatusByDocumentUri = Record<string, DocumentStatus>;

interface DocumentConditionsData {
  uri: string;
  completionConditions: ConditionsList;
  displayConditions: ConditionsList;
}

interface DocumentWithStatefulFragmentCount {
  statefulFragmentCount: number;
  uri: string;
  displayConditions: ConditionsList;
  completionConditions: ConditionsList;
}

interface RawEnrollmentData {
  savedEnrollment: SavedEnrollment;
  documentsWithStatefulFragmentCount: DocumentWithStatefulFragmentCount[];
  documentCompletionTags: TagWithTaggingId[];
  topicCompletionTags: TagWithTaggingId[];
  responsesByFragmentUri: Record<string, UserResponse>;
}

const savedEnrollmentAttributes = [
  "id",
  "userId",
  "topicUri",
  "currentDocumentUri",
  "createdAt",
  "updatedAt",
];

export class EnrollmentsDbWrapper extends DbWrapper {
  topics: TopicsDbWrapper;
  tags: TagsDbWrapper;
  knex: any;
  progressSaveQueue: Queue;

  constructor(knex: any) {
    super(knex, "enrollments");
    this.knex = knex;
    this.topics = new TopicsDbWrapper(knex);
    this.tags = new TagsDbWrapper(knex);
    const databaseName = this.knex.context.client.connectionSettings.database;
    this.progressSaveQueue = new Bull(
      `progress percentage syncing in database ${databaseName}`,
      "redis://127.0.0.1:6379"
    );
    this.progressSaveQueue.process((job: Job, done: any) => {
      const { id, progressPercentage } = job.data;
      this.updateProgressPercentage({ id, progressPercentage }).then(
        (updatedEnrollment) => {
          done(updatedEnrollment);
        }
      );
    });
  }

  async updateProgressPercentage({
    id,
    progressPercentage,
  }: {
    id: number;
    progressPercentage: number;
  }): Promise<SavedEnrollment> {
    return this.knex("enrollments")
      .where({ id })
      .returning(savedEnrollmentAttributes)
      .update({ progressPercentage })
      .then((rows: SavedEnrollment[]) => {
        return rows[0];
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  // TODO: Now that we're going to store progress data in the enrollment anyway
  // for use in the catalog and aggregated data,
  // it should be calculated when a response is submitted, not every time
  // the enrollment is pulled. There's no reason to recalculate it every time
  // when potentially nothing has changed.

  async getOrCreateEnrollment(
    userId: number,
    topicUri: string
  ): Promise<SavedEnrollment> {
    const defaultCurrentDocumentUri = await this.topics.getFirstDocumentUri({
      topicUri,
    });

    return this.knex("enrollments")
      .where({ userId, topicUri })
      .then((rows: SavedEnrollment[]) => {
        const enrollment = rows[0];
        if (enrollment) {
          const { id, userId, topicUri, currentDocumentUri } = enrollment;
          return { id, userId, topicUri, currentDocumentUri };
        } else {
          return this.knex("enrollments")
            .returning(savedEnrollmentAttributes)
            .insert({
              userId,
              topicUri,
              currentDocumentUri: defaultCurrentDocumentUri,
            })
            .then((rows: SavedEnrollment[]) => {
              return rows[0];
            })
            .catch((e: any) => {
              console.error(e);
            });
        }
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  /**
   *  Calculate the user's progress through the topic.
   *  This is only loosely accurate, as computing the true progress
   *  would be more expensive, and still fallible anyway
   *  since the content is still dynamic.
   *
   *  TODO:
   *  This approach is definitely faulty, as a given document
   *  designed for lots of different types of users
   *  could have many hidden stateful fragments that are falsely inflating
   *  the progress percentage. Only the visible fragments should be counted,
   *  but calculating that efficiently will be a little tricky.
   *
   *  Design a model for reporting progress more accurately
   *  without too much computational cost. React already has to know
   *  how many fragments in a document are visible in order to render
   *  the content correctly, so it may make more sense to piggyback
   *  on that logic and calculate progress on the client side instead.
   *  But that may run much more slowly than it does here, so some
   *  experimentation will be helpful.
   *
   *  If the calculation must happen on the server side already,
   *  it might make sense to calculate fragment visibility on the server side
   *  instead of on the client side, then send only the applicable keychain
   *  to the client, so that the fragment wrapper uses the keychain
   *  instead of the display conditions to decrypt + render fragments.
   *  This seems as though it would be more performant anyway, so ... win-win?
   *  When I'm writing encryption, that'll be a good opportunity to switch
   *  to this approach.
   */
  #calculateProgressPercentage(
    topicStatefulFragmentCount: number,
    documentStatusByDocumentUri: DocumentStatusByDocumentUri,
    statefulFragmentCountByDocumentUri: { [key: string]: number },
    responsesByFragmentUri: { [key: string]: UserResponse }
  ) {
    let totalVisibleStatefulFragmentCount = topicStatefulFragmentCount;

    // if the topic does not contain stateful fragments, base progress on document completion
    if (totalVisibleStatefulFragmentCount === 0) {
      let completedDocumentCount = 0;
      let visibleDocumentCount = 0;

      Object.keys(documentStatusByDocumentUri).forEach((documentUri) => {
        const document = documentStatusByDocumentUri[documentUri];
        if (document.isVisible) {
          visibleDocumentCount++;
        }
        if (document.isCompleted) {
          completedDocumentCount++;
        }
      });

      const progressPercentage = Math.floor(
        (completedDocumentCount * 100) / visibleDocumentCount
      );
      return progressPercentage;
    }

    // otherwise, base progress on total stateful fragments vs. user responses

    // omit hidden documents from the progress calculation
    Object.keys(documentStatusByDocumentUri).forEach((documentUri) => {
      const document = documentStatusByDocumentUri[documentUri];
      if (!document.isVisible) {
        const fragmentCountToRemove =
          statefulFragmentCountByDocumentUri[documentUri];
        totalVisibleStatefulFragmentCount -= fragmentCountToRemove;
      }
    });

    const userResponseCount = Object.keys(responsesByFragmentUri).length;
    const progressPercentage = Math.floor(
      (userResponseCount * 100) / totalVisibleStatefulFragmentCount
    );

    return progressPercentage;
  }

  #buildDocumentStatus(
    topicContentMode: ContentMode,
    documents: DocumentConditionsData[],
    completedDocumentUris: string[],
    responsesByFragmentUri: { [key: string]: UserResponse }
  ): DocumentStatusByDocumentUri {
    const documentStates: DocumentStatusByDocumentUri = {};

    // first document does not have a previous document,
    // so its (imaginary) previous document will be considered completed ...
    // eventually document completion can be baked into the next document's
    // display conditions, but we aren't quite there yet
    let statusOfPrevVisibleDocument: DocumentStatus = {
      isCompleted: true,
      isVisible: true,
      isLocked: false,
      nextVisibleDocumentUri: null,
    };

    let conditionsChecker = new ConditionsChecker({ responsesByFragmentUri });

    for (let i = 0; i < documents.length; i++) {
      let document = documents[i];

      // check visibility conditions
      const docIsVisible = conditionsChecker.conditionsAreMet({
        conditionsData: document.displayConditions,
      });
      const docIsCompleted =
        completedDocumentUris.includes(document.uri) &&
        conditionsChecker.conditionsAreMet({
          conditionsData: document.completionConditions,
        });

      let isLocked: boolean;
      if (topicContentMode === "documentation") {
        isLocked = false;
      } else {
        isLocked = !statusOfPrevVisibleDocument.isCompleted;
      }

      documentStates[document.uri] = {
        isVisible: docIsVisible,
        // lock if previous document is not completed
        isLocked,
        // check completion conditions
        isCompleted: docIsCompleted,
        nextVisibleDocumentUri: null,
      };

      // if the document is not visible,
      // don't set it as the next button target
      // or consider it in the processing of subsequent documents
      if (!docIsVisible) {
        continue;
      }

      // if this document is visible,
      // set this document as the next-button target
      // for the preceding visible document
      statusOfPrevVisibleDocument.nextVisibleDocumentUri = document.uri;

      // since this document is visible,
      // it becomes the previous document in the next iteration
      statusOfPrevVisibleDocument = documentStates[document.uri];

      // TODO: to block disallowed document loads,
      // store the document status in the session for quick lookup on document load ...
      // or cache it?
      // old Ruby code:
      // cookies[:document_status] = { value: JSON.generate(@enrollment_hash[:document_status]) }
    }

    return documentStates;
  }

  /**
   * Fetches all of the data needed to build a user's public enrollment object,
   * such as the progress bar.
   */
  async #getRawEnrollmentData(
    userId: number,
    topicUri: string
  ): Promise<RawEnrollmentData> {
    // Empty RawEnrollmentData keys, which will be populated
    // and then assembled into the result
    let savedEnrollment: SavedEnrollment;
    let documentsWithStatefulFragmentCount: DocumentWithStatefulFragmentCount[];
    let documentCompletionTags: TagWithTaggingId[];
    let topicCompletionTags: TagWithTaggingId[];
    let responsesByFragmentUri: Record<string, UserResponse>;

    // Populate the above keys via parallelized db queries

    const queryPromises: Promise<any>[] = [];

    // Get/create the enrollment
    queryPromises.push(
      this.getOrCreateEnrollment(userId, topicUri)
        .then((result) => {
          savedEnrollment = result;
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // Get documents and their stateful fragment counts
    interface DocumentsRawQueryResult {
      rows: {
        stateful_fragment_count: string;
        id: number;
        uri: string;
        display_conditions: ConditionsList;
        completion_conditions: ConditionsList;
      }[];
    }

    queryPromises.push(
      // TODO: figure out how to cache raw queries,
      // there's no reason to run this fresh over and over again
      this.knex
        .raw(
          `
        SELECT 
          COUNT(stateful_fragments.uri) AS stateful_fragment_count,
          documents.id AS id, 
          documents.uri AS uri, 
          documents.display_conditions,
          documents.completion_conditions
        FROM
          documents
        LEFT JOIN
          ( SELECT 
              fragment_refs.uri AS uri,
              fragment_refs.document_uri
            FROM 
              fragment_refs
            LEFT JOIN
              fragment_excerpts ON fragment_excerpts.id = fragment_refs.fragment_excerpt_id
            WHERE
              fragment_excerpts.is_stateful = true
          ) stateful_fragments
        ON stateful_fragments.document_uri = documents.uri
        WHERE documents.topic_uri = '${topicUri}'
        GROUP BY documents.id
        ORDER BY documents.order
      `
        )
        .then((result: DocumentsRawQueryResult) => {
          documentsWithStatefulFragmentCount = result.rows.map((row) => {
            return {
              statefulFragmentCount: parseInt(row.stateful_fragment_count),
              uri: row.uri,
              displayConditions: row.display_conditions,
              completionConditions: row.completion_conditions,
            };
          });
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // gather document completion tags
    queryPromises.push(
      this.tags
        .all({ userId, key: "completed-document-uri" })
        .then((result) => {
          documentCompletionTags = result;
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // check for topic completion tag
    queryPromises.push(
      this.tags
        .all({ userId, key: "completed-topic-uri", value: topicUri })
        .then((result) => {
          topicCompletionTags = result;
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    // gather responses by fragment uri
    queryPromises.push(
      this.#getCurrentTopicResponsesByFragmentUri({ userId, topicUri })
        .then((result) => {
          responsesByFragmentUri = result;
        })
        .catch((e: any) => {
          console.error(e);
        })
    );

    await Promise.all(queryPromises);

    return {
      // @ts-ignore - TS doesn't recognize that these vars have been populated above
      savedEnrollment,
      // @ts-ignore
      documentsWithStatefulFragmentCount,
      // @ts-ignore
      documentCompletionTags,
      // @ts-ignore
      topicCompletionTags,
      // @ts-ignore
      responsesByFragmentUri,
    };
  }

  async find(userId: number, topicUri: string): Promise<PublicEnrollment> {
    // retrieve the topic's ID and content mode
    const { topicContentMode } = await this.knex("topics")
      .where({ uri: topicUri })
      .cache()
      .then((rows: SavedTopic[]) => {
        const topic = rows[0];
        return {
          topicContentMode: topic.config.contentMode || "tutorial",
        };
      })
      .catch((e: any) => {
        console.error(e);
      });

    // gather all the needed data from the database
    let rawEnrollmentData = await this.#getRawEnrollmentData(userId, topicUri);

    // break raw data into entities that can be used to calculate
    // document status, progress percentage, etc.
    let documents: DocumentConditionsData[] = [];
    let statefulFragmentCountByDocumentUri: { [key: string]: number } = {};
    let topicStatefulFragmentCount = 0;

    rawEnrollmentData.documentsWithStatefulFragmentCount.forEach((document) => {
      documents.push({
        uri: document.uri,
        displayConditions: document.displayConditions,
        completionConditions: document.completionConditions,
      });
      statefulFragmentCountByDocumentUri[document.uri] =
        document.statefulFragmentCount;
      topicStatefulFragmentCount += document.statefulFragmentCount;
    });

    // get the list of completed document URIs from tags
    const completedDocumentUris = rawEnrollmentData.documentCompletionTags.map(
      (tag) => tag.value
    );

    // build the document status object that calculates whether a document is visible, locked, etc.
    let documentStatus = this.#buildDocumentStatus(
      topicContentMode,
      documents,
      completedDocumentUris,
      rawEnrollmentData.responsesByFragmentUri
    );

    let topicIsCompleted = rawEnrollmentData.topicCompletionTags.length > 0;

    // skip progress calculation if it's not desired
    if (topicContentMode === "documentation") {
      return {
        ...rawEnrollmentData.savedEnrollment,
        topicIsCompleted,
        documentStatus,
        progressPercentage: null,
      };
    }

    // calculate a (loose) progress percentage
    let progressPercentage: number;
    if (topicIsCompleted) {
      progressPercentage = 100;
    } else {
      progressPercentage = this.#calculateProgressPercentage(
        topicStatefulFragmentCount,
        documentStatus,
        statefulFragmentCountByDocumentUri,
        rawEnrollmentData.responsesByFragmentUri
      );
    }

    // if the progress percentage has changed, queue an update to the database
    if (
      progressPercentage !==
      rawEnrollmentData.savedEnrollment.progressPercentage
    ) {
      this.progressSaveQueue.add({
        id: rawEnrollmentData.savedEnrollment.id,
        progressPercentage,
      });
    }

    return {
      ...rawEnrollmentData.savedEnrollment,
      topicIsCompleted,
      documentStatus,
      progressPercentage,
    };
  }

  // TODO: This query pulls ALL the responses,
  // when really we just need the latest one for each fragmentRef ...
  // something along the lines of groupBy(responses.fragmentRefId) with a MAX(responses.createdAt)
  // should work to correct this
  #getCurrentTopicResponsesByFragmentUri(params: {
    userId: number;
    topicUri: string;
  }): Promise<Record<string, UserResponse>> {
    interface TopicResponseQueryResult {
      responseIdCol: number;
      value: any;
      createdAt: Date;
      enrollmentIdCol: number;
      topicUri: string;
      currentDocumentUri: string;
      fragmentRefUriCol: string;
      status: UserResponseStatus | undefined;
    }

    let responsesByFragmentUri: Record<string, UserResponse> = {};
    return this.knex
      .select(
        "responses.id AS responseIdCol",
        "responses.value",
        "responses.status",
        "responses.createdAt",
        "enrollments.id AS enrollmentIdCol",
        "enrollments.topicUri",
        "enrollments.currentDocumentUri",
        "fragmentRefs.uri AS fragmentRefUriCol"
      )
      .from("enrollments")
      .leftJoin("responses", "responses.enrollmentId", "enrollments.id")
      .leftJoin("fragmentRefs", "fragmentRefs.uri", "responses.fragmentRefUri")
      .leftJoin("documents", "documents.uri", "fragmentRefs.documentUri")
      .where("enrollments.userId", "=", params.userId)
      .andWhere("enrollments.topicUri", "=", params.topicUri)
      .orderBy([
        { column: "documents.order" },
        { column: "fragmentRefs.uri" },
        { column: "responses.createdAt", order: "desc" },
      ])
      .then((results: TopicResponseQueryResult[]) => {
        results.forEach((responseRow) => {
          // add a response for this fragment alias if one does not already exist
          // (since we only want to use the most recent response for any given alias
          // in calculating document status, and the query results are sorted with
          // the most recent response first)
          const fragmentUri = responseRow.fragmentRefUriCol;
          if (!responsesByFragmentUri[fragmentUri] && fragmentUri !== null) {
            responsesByFragmentUri[fragmentUri] = {
              fragmentUri,
              value: responseRow.value,
              status: responseRow.status,
            };
          }
        });
        return responsesByFragmentUri;
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  async destroy() {
    await this.progressSaveQueue.close();
    return true;
  }
}
