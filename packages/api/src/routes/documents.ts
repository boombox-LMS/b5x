import express, { Request, NextFunction, Response } from "express";
import { UserResponse } from "@b5x/types";
import { ConditionsChecker } from "@b5x/conditions-manager";
import { QueryStringValueSchema } from "../types/queryData";
import { z } from "zod";

const router = express.Router();

// documents.contents ===============================================

const DocumentsContentsQuerySchema = z
  .object({
    // TODO: Use a more specific schema throughout when the document identifiers are more settled
    documentUri: QueryStringValueSchema,
  })
  .strict();

router.get(
  "/documents.contents",
  function (req: Request, res: Response, next: NextFunction) {
    let query;
    try {
      query = DocumentsContentsQuerySchema.parse(req.query);
    } catch {
      res.sendStatus(422);
      return;
    }
    const { documentUri } = query;

    req.db.events.queueCreate({
      name: "documentRetrieved",
      data: { documents: [documentUri], users: [req.session.currentUserId] },
    });
    req.db.documents.getContents({ documentUri }).then((document) => {
      res.send(document);
    });
  }
);

// documents.responses ===============================================

const DocumentsResponsesQuerySchema = z
  .object({
    documentUri: QueryStringValueSchema,
  })
  .strict();

router.get(
  "/documents.responses",
  function (req: Request, res: Response, next: NextFunction) {
    let query;
    try {
      query = DocumentsResponsesQuerySchema.parse(req.query);
    } catch {
      res.sendStatus(422);
      // TODO: Return seems to be considered acceptable practice, but should it be next() instead?
      return;
    }

    const { documentUri } = query;

    const userId = req.session.currentUserId;
    req.db.responses
      .getDocumentResponses(documentUri, userId)
      .then((responses: UserResponse[]) => {
        // normalize by fragment uri
        let responsesByFragmentUri: Map<string, UserResponse> = new Map();
        responses.forEach((response) => {
          responsesByFragmentUri.set(response.fragmentUri, response);
        });
        res.send(Object.fromEntries(responsesByFragmentUri));
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

// documents.verifyCompletion =======================================

const DocumentsVerifyCompletionBodySchema = z
  .object({
    documentUri: QueryStringValueSchema,
  })
  .strict();

/**
 *  Verify that the document's completion requirements are met,
 *  and create a document completion if one does not already exist.
 */
router.post(
  "/documents.verifyCompletion",
  async function (req: Request, res: Response, next: NextFunction) {
    let body;
    try {
      body = DocumentsVerifyCompletionBodySchema.parse(req.body);
    } catch {
      res.sendStatus(422);
      return;
    }

    const { documentUri } = body;
    const userId = req.session.currentUserId;

    // retrieve the document's completion conditions
    const documentCompletionConditions = await req.db.documents
      .getCompletionConditions({ documentUri })
      .catch((e: any) => {
        throw e;
      });

    // retrieve the user's responses to the document
    req.db.responses
      .getDocumentResponses(documentUri, userId)
      .then((responses) => {
        // normalize the responses by fragment alias
        let responsesByFragmentUri: Map<string, UserResponse> = new Map();
        responses.forEach((response: UserResponse) => {
          responsesByFragmentUri.set(response.fragmentUri, response);
        });

        // verify that the completion conditions are met
        const conditionsChecker = new ConditionsChecker({
          responsesByFragmentUri: Object.fromEntries(responsesByFragmentUri),
        });
        const completionConditionsAreMet = conditionsChecker.conditionsAreMet({
          conditionsData: documentCompletionConditions,
        });

        return new Promise(async (resolve) => {
          // if the completion conditions are not met, do nothing
          if (!completionConditionsAreMet) {
            resolve(false);
            // if the completion conditions are met, insert the completion
            // unless one already exists
          } else {
            return req.db.documents
              .markAsComplete({ documentUri, userId })
              .then(() => {
                req.db.events.queueCreate({
                  name: "documentCompleted",
                  data: { documents: [documentUri], users: [userId] },
                });
                resolve(true);
              })
              .catch((e: any) => {
                throw e;
              });
          }
        });
      })
      .then((result) => {
        res.send({ documentUri, documentIsCompleted: result });
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

module.exports = router;
