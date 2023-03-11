import { TagsDbWrapper } from "./TagsDbWrapper";
import { DbWrapper } from "./DbWrapper";
import { FragmentsDbWrapper } from "./FragmentsDbWrapper";
import { DocumentContents, ExpandedDocument, RawDocument } from "@b5x/types";
import {
  DraftPublicFragment,
  RawFragment,
  PublicFragment,
  SavedFragment,
} from "@b5x/types";

export class DocumentsDbWrapper extends DbWrapper {
  tags: TagsDbWrapper;
  fragments: FragmentsDbWrapper;

  constructor(knex: any) {
    super(knex, "documents");
    this.knex = knex;
    this.tags = new TagsDbWrapper(knex);
    this.fragments = new FragmentsDbWrapper(knex);
  }

  getCompletionConditions(params: { documentUri: string }) {
    return this.knex
      .select("completionConditions")
      .from("documents")
      .where({ uri: params.documentUri })
      .cache()
      .then((rows: { completionConditions: any[] }[]) => {
        return rows[0].completionConditions;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  /**
   *  Creates a row in document_completions for the given document ID
   *  if a document_completion does not already exist for this enrollment.
   */
  async markAsComplete(params: { documentUri: string; userId: number }) {
    return this.tags.add({
      userId: params.userId,
      key: "completed-document-uri",
      value: params.documentUri,
    });
  }

  /**
   *  Using a document ID, gather all content for a document
   *  by assembling its associated fragments and excerpts
   *  into a unified, renderable result.
   *
   *  // TODO: Refactor into multiple parallel DB calls.
   */
  getContents(params: { documentUri: string }): Promise<DocumentContents> {
    interface DocumentContentQueryResult {
      topicUri: string;
      title: string;
      documentChildUrisCol: string[];
      displayConditions: any[];
      dependencyUris: string[];
      isRequired: boolean;
      contentType: string; // TODO: Narrow to available types? There are quite a few.
      isStateful: boolean;
      contents: string;
      contentMode: string;
      data: Object;
      fragmentExcerptIdCol: number;
      documentUriCol: string;
      fragmentRefUriCol: string;
      fragmentRefChildUrisCol: string[];
    }

    return this.knex
      .select(
        "documents.topicUri",
        "documents.title",
        "documents.childUris AS documentChildUrisCol",
        "documents.contentMode",
        "fragmentRefs.displayConditions",
        "fragmentRefs.dependencyUris",
        "fragmentRefs.isRequired",
        "fragmentRefs.childUris AS fragmentRefChildUrisCol",
        "fragmentExcerpts.contentType",
        "fragmentExcerpts.isStateful",
        "fragmentExcerpts.contents",
        "fragmentExcerpts.data",
        // alias identically-named columns to avoid crashes,
        // alias convention is always EntitynameColnameCol, e.g. topicIdCol
        "fragmentExcerpts.id AS fragmentExcerptIdCol",
        "documents.uri AS documentUriCol",
        "fragmentRefs.uri AS fragmentRefUriCol"
      )
      .from("documents")
      .where("documents.uri", "=", params.documentUri)
      .rightJoin("fragmentRefs", "fragmentRefs.documentUri", "documents.uri")
      .rightJoin(
        "fragmentExcerpts",
        "fragmentExcerpts.id",
        "fragmentRefs.fragmentExcerptId"
      )
      .cache()
      .then((results: DocumentContentQueryResult[]) => {
        /**
         *  Build the document object.
         *  We can pull document attributes from any of the SQL results,
         *  since they all share the same document data.
         */
        let document: DocumentContents = {
          uri: results[0].documentUriCol,
          topicUri: results[0].topicUri,
          contentMode: results[0].contentMode,
          fragments: [],
        };

        const documentChildUris = results[0].documentChildUrisCol;

        /**
         *  Populate the document's fragments by
         *  - Collecting fragment data by uri
         *  - Making a new content map that includes all referenced fragments/content
         */
        let fragmentsByUri: { [key: string]: DraftPublicFragment } = {};
        results.forEach((result) => {
          fragmentsByUri[result.fragmentRefUriCol] = {
            uri: result.fragmentRefUriCol,
            contentType: result.contentType,
            contents: result.contents,
            data: result.data,
            documentUri: result.documentUriCol,
            displayConditions: result.displayConditions,
            dependencyUris: result.dependencyUris,
            isStateful: result.isStateful,
            isRequired: result.isRequired,
            childUris: result.fragmentRefChildUrisCol,
          };
        });

        document.fragments = this.#populatePublicFragmentTree(
          documentChildUris,
          fragmentsByUri
        );
        return document;
      })
      .catch((e: any) => {
        throw e;
      });
  }

  #populatePublicFragmentTree(
    fragmentUris: string[],
    fragmentsByUri: { [key: string]: DraftPublicFragment }
  ) {
    let fragmentTree: PublicFragment[] = [];
    fragmentUris.forEach((fragmentUri) => {
      const { childUris, ...publicFragment } = fragmentsByUri[fragmentUri];
      let fragment: PublicFragment = {
        ...publicFragment,
        children: this.#populatePublicFragmentTree(childUris, fragmentsByUri),
      };
      fragmentTree.push(fragment);
    });
    return fragmentTree;
  }

  async insertAll(params: {
    documents: RawDocument[];
  }): Promise<ExpandedDocument[]> {
    interface NewDocument
      extends Omit<
        RawDocument,
        | "childUris"
        | "displayConditions"
        | "completionConditions"
        | "dependencyUris"
        | "externalDependencyUris"
        | "fragmentsByUri"
      > {
      topicUri: string;
      completionConditions: string; // JSON
      dependencyUris: string; // JSON
      displayConditions: string; // JSON
      externalDependencyUris: string; // JSON
      childUris: string; // JSON
    }

    const newDocumentsToInsert: NewDocument[] = [];
    let rawFragmentsToInsert: RawFragment[] = [];

    params.documents.forEach((rawDocument) => {
      const { fragmentsByUri, ...newDocument } = rawDocument;
      // collect new documents for insertion
      newDocumentsToInsert.push({
        ...newDocument,
        completionConditions: JSON.stringify(rawDocument.completionConditions),
        dependencyUris: JSON.stringify(rawDocument.dependencyUris),
        displayConditions: JSON.stringify(rawDocument.displayConditions),
        externalDependencyUris: JSON.stringify(
          rawDocument.externalDependencyUris
        ),
        childUris: JSON.stringify(rawDocument.childUris),
      });
      // collect new fragments for insertion
      rawFragmentsToInsert = rawFragmentsToInsert.concat(
        Object.values(rawDocument.fragmentsByUri)
      );
    });

    let expandedDocumentsByUri: Record<string, ExpandedDocument> = {};

    interface SavedDocument extends Omit<RawDocument, "fragmentsByUri"> {}

    // write the documents to the database
    await this.knex("documents")
      .returning([
        "id",
        "uri",
        "title",
        "order",
        "completionConditions",
        "config",
        "contentMode",
        "dependencyUris",
        "displayConditions",
        "externalDependencyUris",
        "childUris",
        "topicUri",
      ])
      .insert(newDocumentsToInsert)
      .then((rows: SavedDocument[]) => {
        rows.forEach((savedDocument) => {
          expandedDocumentsByUri[savedDocument.uri] = {
            ...savedDocument,
            fragmentsByUri: {},
          };
        });
      });

    // write the fragments to the database
    await this.fragments
      .insertAll(rawFragmentsToInsert)
      .then((rows: SavedFragment[]) => {
        // build the expanded documents
        rows.forEach((savedFragment) => {
          expandedDocumentsByUri[savedFragment.documentUri].fragmentsByUri[
            savedFragment.uri
          ] = savedFragment;
        });
      })
      .catch((e: any) => {
        throw e;
      });

    // return the expanded documents
    return Object.values(expandedDocumentsByUri);
  }
}
