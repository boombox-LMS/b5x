import express, { Request, NextFunction, Response } from "express";
const router = express.Router();

// AWKWARD: Maybe it's too awkward to split up issues and feedback,
// rather than having just one tickets dashboard? It makes the routes funky,
// though maybe this could be fixed with an extra "type" param or something.
router.get(
  "/tickets/issues.list",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.tickets.getIssues().then((issues) => {
      res.send(issues);
    });
  }
);

router.get(
  "/tickets/feedback.list",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.tickets.getFeedback().then((tickets) => {
      res.send(tickets);
    });
  }
);

router.post(
  "/tickets.create",
  function (req: Request, res: Response, next: NextFunction) {
    const { description, title, priorityLevel, reporterUrl } = req.body;

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

router.post(
  "/tickets.setAssignee",
  function (req: Request, res: Response, next: NextFunction) {
    const { ticketId, assigneeEmail } = req.body;

    req.db.tickets.setAssignee(ticketId, assigneeEmail).then((ticket) => {
      res.send(ticket);
    });
  }
);

router.post(
  "/tickets.setStatus",
  function (req: Request, res: Response, next: NextFunction) {
    const { ticketId, status } = req.body;

    req.db.tickets.setStatus(ticketId, status).then((ticket) => {
      res.send(ticket);
    });
  }
);

module.exports = router;
