import express, { Request, NextFunction, Response } from "express";

const router = express.Router();

/**
 *  Sketchy cheater route that can be accessed easily from the browser
 *  to fix the annoying "cookie purgatory" that happens
 *  when I reset the DB without remembering to log out first.
 */
router.get(
  "/users.logOut",
  function (req: Request, res: Response, next: NextFunction) {
    req.session.currentUserId = null;
    res.status(200).send({ response: "OK" });
  }
);

/**
 *  Log in or create a user.
 *
 *  DANGEROUS: This is just for dev purposes.
 */
router.post(
  "/users.logIn",
  function (req: Request, res: Response, next: NextFunction) {
    let session = req.session;
    const email = req.body.email;

    req.db.users.findOrCreateByEmail(email).then((user) => {
      session.currentUserId = user.id;
      req.db.events.queueCreate({
        name: "userLoggedIn",
        data: { users: [user.id] },
      });
      res.send(user);
    });
  }
);

/**
 *  Log the user out.
 */
router.post(
  "/users.logOut",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.events.queueCreate({
      name: "userLoggedOut",
      data: { users: [req.session.currentUserId] },
    });
    req.session.currentUserId = null;
    res.status(200).send({ response: "OK" });
  }
);

/**
 *  Get the currently authorized user, if there is one.
 *
 *  TODO:
 *  - Consider simply handling 'Not Authorized' errors on the client side instead.
 */
router.get(
  "/users.current",
  function (req: Request, res: Response, next: NextFunction) {
    const currentUserId = req.session.currentUserId;

    if (currentUserId) {
      req.db.users.findById(currentUserId).then((user) => res.send(user));
    } else {
      res.send({ email: null });
    }
  }
);

/**
 *  Mass-edit user attributes. Takes an array of user objects.
 *  Currently accepted keys:
 *  - email
 *  - first name
 *  - last name
 *  - add to groups
 *  - remove from groups
 */
router.post(
  "/users.modifyGroups",
  function (req: Request, res: Response, next: NextFunction) {
    /*
  [{"email":"front-end@test.com", "add to groups":["tech","software-engineers","frontend-engineers"],"remove from groups":""},{"email":"mobile@test.com","first name":"iOS","last name":"Engineer","add to groups":["tech","software-engineers","mobile-engineers","ios-engineers"],"remove from groups":""},{"email":"back-end@test.com","first name":"Backend","last name":"Engineer","add to groups":["tech","software-engineers","backend-engineers"],"remove from groups":""}]
  */
    const users = req.body.users;
    req.db.users.modifyGroups({ users }).then((result) => {
      res.send(result);
    });
  }
);

/**
 *  Temporary, for populating ticket assignment mockup
 *  since contributor permissions are not yet really a thing
 */
router.get(
  "/users.listEmails",
  function (req: Request, res: Response, next: NextFunction) {
    req.db.knex
      .select("email")
      .from("users")
      .orderBy("email")
      .then((rows: { email: string }[]) => {
        res.send(rows.map((row) => row.email));
      });
  }
);

router.get(
  "/users.profile",
  function (req: Request, res: Response, next: NextFunction) {
    const username = req.query.username;

    // @ts-ignore
    req.db.users.profile({ username }).then((profile) => {
      res.send(profile);
    });
  }
);

router.post(
  "/users.assignApiKey",
  function (req: Request, res: Response, next: NextFunction) {
    const username = req.body.username;
    req.db.users.assignApiKey({ username }).then((result) => {
      res.send(result);
    });
  }
);

module.exports = router;
