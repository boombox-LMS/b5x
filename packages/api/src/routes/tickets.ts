import express, { Request, NextFunction, Response } from "express";
const router = express.Router();
import { z } from "zod";
import { TicketPriorityLevelSchema } from "@b5x/types";

// AWKWARD: Maybe it's too awkward to split up issues and feedback,
// rather than having just one tickets dashboard? It makes the routes funky,
// though maybe this could be fixed with an extra "type" param or something.
router.get(
  "/tickets/issues.list",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.tickets
      .getIssues()
      .then((issues) => {
        res.send(issues);
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

router.get(
  "/tickets/feedback.list",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.tickets
      .getFeedback()
      .then((tickets) => {
        res.send(tickets);
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

const ticketsCreateBodySchema = z
  .object({
    description: z.any(), // This should be the object created by the RTF editor, but that's not in the types package yet
    title: z.string(),
    priorityLevel: TicketPriorityLevelSchema,
    reporterUrl: z.string(),
  })
  .strict();

router.post(
  "/tickets.create",
  function (req: Request, res: Response, next: NextFunction) {
    const body = ticketsCreateBodySchema.parse(req.body);
    const { description, title, priorityLevel, reporterUrl } = body;

    req.db.tickets.queueCreate({
      reporterId: req.session.currentUserId,
      reporterUrl,
      description,
      title,
      priorityLevel,
    });

    res.sendStatus(200);
  }
);

const ticketsSetAssigneeBodySchema = z
  .object({
    ticketId: z.number(),
    assigneeEmail: z.string(),
  })
  .strict();

router.post(
  "/tickets.setAssignee",
  function (req: Request, res: Response, next: NextFunction) {
    const { ticketId, assigneeEmail } = ticketsSetAssigneeBodySchema.parse(
      req.body
    );

    req.db.tickets
      .setAssignee(ticketId, assigneeEmail)
      .then((ticket) => {
        res.send(ticket);
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

const ticketsSetStatusBodySchema = z
  .object({
    ticketId: z.number(),
    status: z.string(),
  })
  .strict();

router.post(
  "/tickets.setStatus",
  function (req: Request, res: Response, next: NextFunction) {
    const { ticketId, status } = ticketsSetStatusBodySchema.parse(req.body);

    req.db.tickets
      .setStatus(ticketId, status)
      .then((ticket) => {
        res.send(ticket);
      })
      .catch((e: any) => {
        throw e;
      });
  }
);

module.exports = router;
