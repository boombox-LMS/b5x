import express, { Request, NextFunction, Response } from "express";
import { PublicCatalog } from "@b5x/types";

const router = express.Router();

/**
 *  Get the catalog of topics available to the current user.
 *
 *  TODO:
 *  - Cache route?
 */
router.get(
  "/topics.catalog",
  function (req: Request, res: Response, next: NextFunction) {
    const userId = req.session.currentUserId;
    if (!req.session.filters) {
      req.session.filters = {
        priorityLevel: {
          available: false,
          recommended: true,
          assigned: true,
        },
        completionStatus: {
          "not started": true,
          "in progress": true,
          completed: false,
        },
      };
    }
    req.db.topics
      .getCatalog({ userId })
      .then((catalog) => {
        const publicCatalog: PublicCatalog = {
          ...catalog,
          filters: req.session.filters,
        };
        res.send(publicCatalog);
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

/**
 *  Not in use yet, but will be used to make catalog filters persistent
 */
router.post(
  "/topics.updateCatalogFilters",
  function (req: Request, res: Response, next: NextFunction) {
    const filters = req.body.filters;
    // TODO: Validate filter structure before accepting it
    req.session.filters = filters;
    res.send(filters);
  }
);

/**
 *  Get the details of one specific topic.
 *
 *  TODO: Split into "info" and "contents"
 *  to avoid having to do so much in one call,
 *  since this endpoint is currently used for both
 *  the topic details page and the topic contents.
 */
router.get(
  "/topics.info",
  function (req: Request, res: Response, next: NextFunction) {
    const { uri, slug } = req.query; // only one of these should actually be present
    // TODO: Write a general library for verifying these sorts of things (one and only one is present)
    // TODO: Throw server errors instead of generic errors, so you can provide a status code
    return req.db.users
      .getTopicAccessStatus({
        // @ts-ignore
        topicUri: uri,
        // @ts-ignore, not sure why it's still upset about the slug based on the
        // type verification above, but these verifications will be rewritten anyway
        topicSlug: slug,
        userId: req.session.currentUserId,
      })
      .then((accessStatus) => {
        if (!accessStatus.topicIsBlocked) {
          // @ts-ignore
          req.db.topics.info({ uri, slug }).then((topic) => {
            // add user-specific information to the topic
            res.send({
              ...topic,
              unmetPrerequisites: accessStatus.unmetPrerequisites,
              enrollmentData: accessStatus.enrollmentData,
            });
          });
        } else {
          // TODO: Throw access error
          res
            .status(403)
            .send("You do not have permission to view this topic.");
        }
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

/**
 *  Get the contents of one specific topic.
 *
 *  TODO: Write smoke test for endpoint.
 */
router.get(
  "/topics.contents",
  function (req: Request, res: Response, next: NextFunction) {
    const { uri } = req.query;
    if (typeof uri !== "string") {
      // TODO: Figure out how to throw server error with status code,
      // there is a ServerError in Express but I was having trouble finding it
      throw new Error("Query param 'uri' has to be of type string");
    }
    return req.db.users
      .getTopicAccessStatus({
        topicUri: uri,
        userId: req.session.currentUserId,
      })
      .then((accessStatus) => {
        // block access if the user is blocked or has not met prereqs
        if (
          !accessStatus.topicIsBlocked &&
          accessStatus.unmetPrerequisites.length === 0
        ) {
          req.db.topics
            .contents({ uri }) // TODO: change to topics.contents?
            .then((topic) => {
              res.send(topic);
            });
        } else {
          // TODO: Throw access error
          res
            .status(403)
            .send("You do not have permission to view this topic.");
        }
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

/**
 *  Calculate the visibility, completion, and locked/unlocked
 *  status of each document in the topic.
 */
router.get(
  "/topics.enrollment",
  function (req: Request, res: Response, next: NextFunction) {
    let topicUri = req.query.uri || req.params.uri;
    const userId = req.session.currentUserId;
    // TODO: This returns a saved enrollment, but we don't want database IDs out there in public,
    // so this should go through the data manager instead, like everything else.
    req.db.enrollments
      // @ts-ignore
      .find(userId, topicUri)
      .then((enrollment) => res.send(enrollment))
      .catch((e: any) => {
        throw e;
      });
  }
);

/**
 *  Save a new topic.
 *
 *  Currently used by the v0 prototype,
 *  which will be replaced by the v1 CLI.
 *
 *  TODO:
 *  - Implement permissions
 */ //
router.post(
  "/topics.publish",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.topics
      .publish({ topic: req.body.topic })
      .then(() => res.status(200).send())
      .catch((e: any) => {
        throw e;
      });
  }
);

router.post(
  "/topics.verifyCompletion",
  function (req: Request, res: Response, next: NextFunction) {
    const topicUri = req.body.topicUri || req.params.topicUri;
    const userId = req.session.currentUserId;
    req.db.enrollments
      .find(userId, topicUri)
      .then((enrollment) => {
        const incompleteDocuments = Object.values(
          enrollment.documentStatus
        ).filter((document) => {
          return document.isVisible && !document.isCompleted;
        });

        if (incompleteDocuments.length === 0) {
          req.db.topics
            .markAsComplete({ topicUri, userId })
            .then(() => {
              res.send({ topicUri, topicIsCompleted: true });
            })
            .catch((e: any) => {
              throw e;
            });
        } else {
          res.send({ topicUri, topicIsCompleted: false });
        }
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

// TODO: Write tests
router.post(
  "/topics.register",
  function (req: Request, res: Response, next: NextFunction) {
    const slug = req.body.slug;
    req.db.topics
      .register({ slug })
      .then(() => {
        res.send({ succeeded: true });
      })
      .catch((error) => {
        res.send({ succeeded: false, error });
      });
  }
);

module.exports = router;
