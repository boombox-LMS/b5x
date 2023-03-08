import express, { Request, NextFunction, Response } from "express";
import { UserResponse } from "@b5x/types";
import { ConditionsChecker } from "@b5x/conditions-manager";

const router = express.Router();

router.get(
  "/documents.contents",
  function (req: Request, res: Response, next: NextFunction) {
    const documentUri = req.query.documentUri || req.params.documentUri;
    if (typeof documentUri !== "string") {
      // TODO: How to throw a ServerError that allows a status code?
      throw new Error("Query param 'documentUri' has to be of type string");
    }
    req.db.events.queueCreate({
      name: "documentRetrieved",
      data: { documents: [documentUri], users: [req.session.currentUserId] },
    });
    req.db.documents.getContents({ documentUri }).then((document) => {
      res.send(document);
    });
  }
);

router.get(
  "/documents.responses",
  function (req: Request, res: Response, next: NextFunction) {
    const documentUri = req.params.documentUri || req.query.documentUri;
    if (typeof documentUri !== "string") {
      // TODO: How to throw a ServerError that allows a status code?
      throw new Error("Query param 'documentUri' has to be of type string");
    }

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
        console.error(e);
      });
  }
);

/**
 *  Verify that the document's completion requirements are met,
 *  and create a document completion if one does not already exist.
 */
router.post(
  "/documents.verifyCompletion",
  async function (req: Request, res: Response, next: NextFunction) {
    const documentUri = req.body.documentUri || req.params.documentUri;
    const userId = req.session.currentUserId;

    // retrieve the document's completion conditions
    const documentCompletionConditions =
      await req.db.documents.getCompletionConditions({ documentUri });

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
                console.error(e);
              });
          }
        });
      })
      .then((result) => {
        res.send({ documentUri, documentIsCompleted: result });
      })
      .catch((e: any) => {
        console.error(e);
      });
  }
);

module.exports = router;
