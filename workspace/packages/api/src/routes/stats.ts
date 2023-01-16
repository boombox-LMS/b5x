import express, { Request, NextFunction, Response } from "express";
const router = express.Router();

router.get(
  "/stats.listUsers",
  function (req: Request, res: Response, next: NextFunction) {
    // TODO: verify permission to access this data
    req.db.stats.getUserList().then((result) => res.send(result));
  }
);

router.get(
  "/stats.listTopics",
  function (req: Request, res: Response, next: NextFunction) {
    // TODO: verify permission to access this data
    req.db.stats.getTopicsList().then((result) => res.send(result));
  }
);

module.exports = router;
