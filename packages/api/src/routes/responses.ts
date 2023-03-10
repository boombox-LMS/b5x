import express, { Request, NextFunction, Response } from "express";
import { z } from "zod";
import { QueryStringValueSchema } from "../types/queryData";

const router = express.Router();

const ResponsesCreateBodySchema = z
  .object({
    fragmentUri: QueryStringValueSchema,
    enrollmentId: z.number(),
    value: z.any(),
    status: z.enum(["completed", "in progress"]),
  })
  .strict();

router.post(
  "/responses.create",
  function (req: Request, res: Response, next: NextFunction) {
    let body;
    try {
      body = ResponsesCreateBodySchema.parse(req.body);
    } catch {
      res.sendStatus(422);
      return;
    }

    const { fragmentUri, enrollmentId, value, status } = body;

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
        throw e;
      });
  }
);

module.exports = router;
