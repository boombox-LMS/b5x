import { DbWrapper } from "./DbWrapper";
import { UserResponse } from "@b5x/types";
import { NewUserResponse } from "@b5x/types";

export class ResponsesDbWrapper extends DbWrapper {
  knex: any;

  constructor(knex: any) {
    super(knex, "responses");
    this.knex = knex;
  }

  insert(response: NewUserResponse): Promise<UserResponse> {
    const { enrollmentId, fragmentUri, value, status } = response;

    return this.knex("responses")
      .returning("id")
      .insert({
        enrollmentId,
        fragmentRefUri: fragmentUri,
        value: JSON.stringify(value),
        status,
      })
      .then((rows: { id: number }[]) => {
        const responseId = rows[0].id;
        return this.knex
          .select(
            "responses.value",
            "responses.status",
            "responses.fragmentRefUri AS fragmentUri"
          )
          .from("responses")
          .leftJoin(
            "fragmentRefs",
            "responses.fragmentRefUri",
            "fragmentRefs.uri"
          )
          .where("responses.id", "=", responseId);
      })
      .then((rows: UserResponse[]) => {
        return rows[0];
      });
  }

  getDocumentResponses(
    documentUri: string,
    userId: number
  ): Promise<UserResponse[]> {
    let externalDependencyUris: string[];

    interface DocumentDependenciesQueryResult {
      topicUri: string;
      externalDependencyUris: string[];
    }

    // get the topic ID and dependencies of the document
    return (
      this.knex
        .select("topicUri", "externalDependencyUris")
        .from("documents")
        .where({ uri: documentUri })
        // find the enrollment
        .then((rows: DocumentDependenciesQueryResult[]) => {
          const topicUri = rows[0].topicUri;
          externalDependencyUris = rows[0].externalDependencyUris;
          return this.knex
            .select("id")
            .from("enrollments")
            .where({ userId, topicUri });
        })
        // retrieve all relevant responses
        .then((rows: { id: number }[]) => {
          // TODO: also retrieve external-to-the-document dependency aliases,
          // and include testing for that scenario
          const enrollmentId = rows[0].id;
          return this.knex
            .select(
              "responses.value",
              "responses.status",
              "responses.fragmentRefUri AS fragmentUri"
            )
            .from("responses")
            .where({ enrollmentId })
            .leftJoin(
              "fragmentRefs",
              "fragmentRefs.uri",
              "responses.fragmentRefUri"
            )
            .leftJoin("documents", "documents.uri", "fragmentRefs.documentUri")
            .where({ documentUri })
            .orWhere("fragmentRefs.uri", "in", externalDependencyUris)
            .orderBy("responses.createdAt", "desc");
        })
        .then((rows: UserResponse[]) => {
          let responsesByFragmentUri: Map<string, UserResponse> = new Map(); // TODO: Make a ResponseSet type?
          // keep only the most recent response for a given fragment ref
          // AWKWARD: could do this in SQL, but it makes the SQL query much more complicated
          rows.forEach((response: UserResponse) => {
            if (!responsesByFragmentUri.get(response.fragmentUri)) {
              responsesByFragmentUri.set(response.fragmentUri, response);
            }
          });
          // return an array of the kept responses
          return Array.from(responsesByFragmentUri.values());
        })
    );
  }
}
