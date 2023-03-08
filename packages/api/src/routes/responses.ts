import express, { Request, NextFunction, Response } from "express";

const router = express.Router();

router.post(
  "/responses.create",
  function (req: Request, res: Response, next: NextFunction) {
    const { fragmentUri, enrollmentId, value, status } = req.body;
    req.db.events.queueCreate({
      name: "responseSubmitted",
      data: {
        enrollments: [enrollmentId],
        fragments: [fragmentUri],
        users: [req.session.currentUserId],
      },
    });
    return req.db.responses
      .insert({ fragmentUri, enrollmentId, value, status })
      .then((response) => {
        res.send(response);
      })
      .catch((e: any) => {
        console.error(e);
      });
  }
);

module.exports = router;
