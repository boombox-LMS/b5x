require("dotenv").config();
const createError = require("http-errors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
import { NextFunction, Request, Response, Application } from "express";
import { BoomboxDataManager } from "./db/manager/BoomboxDataManager";

/**
 *  Initializes and configures an instance of the backend app.
 *  This module allows the backend app to use a variety of database configurations,
 *  which is useful for integration tests
 *  that run several temporary databases in parallel.
 */
export class AppBuilder {
  boomboxDataManager: BoomboxDataManager;
  knex: any;
  app: Application;

  /**
   *  @param knex - An instance of a Knex client that is connected to a Boombox content database. The Express application will use this Knex client to instantiate a BoomboxDataManager, then use the BoomboxDataManager to broker any data queries required to serve content or perform other tasks.
   */
  constructor(knex: any) {
    this.knex = knex;
    let app: Application = express();

    const logger = require("morgan");
    app.use(logger("dev"));

    // allow large payloads for topic publishing
    app.use(express.json({ limit: "500mb" }));

    // configure the data manager
    const dbConnectionConfig = {
      client: process.env.DB_CLIENT,
      connection: {
        database: process.env.DEV_DB_NAME,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASSWORD,
      },
    };
    this.boomboxDataManager = new BoomboxDataManager(knex);

    // make the data manager available on the app object for testing purposes
    const boomboxDataManager = this.boomboxDataManager;
    app.set("db", boomboxDataManager);

    // make the data manager available on every request
    const setDb = function (
      req: Request,
      res: Express.Response,
      next: NextFunction
    ) {
      req.db = boomboxDataManager;
      next();
    };

    app.use(setDb);

    app = this.#configureCors(app);

    app.use(express.static("public"));

    app = this.#setViewEngine(app);

    app.use(cookieParser(process.env.SECRET));

    app = this.#configureSessionStore(app);

    app = this.#configureRoutes(app);

    app = this.#configureErrorHandling(app);

    this.app = app;
  }

  /**
   *  @param app - An instance of an Express application.
   */
  #configureErrorHandling(app: Application) {
    // catch 404 and forward to error handler
    app.use(function (req: Request, res: Response, next: NextFunction) {
      next(createError(404));
    });

    return app;
  }

  /**
   *  Whitelists the @b5x/viewer app URL and
   *  preserves session data across requests from the viewer.
   *  @param app - The Express application instance to be configured.
   *  @returns An Express application instance with the correct CORS configuration.
   */
  #configureCors(app: Application) {
    const corsOptions = {
      origin: process.env.CLIENT_ORIGIN, // client app URL
      credentials: true, // avoid session data getting dropped
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    };

    app.use(cors(corsOptions));
    return app;
  }

  #setViewEngine(app: Application) {
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "pug");
    return app;
  }

  #configureSessionStore(app: Application) {
    const store = new KnexSessionStore({ knex: this.knex });

    app.use(
      session({
        store: store,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      })
    );

    return app;
  }

  /**
   *  Adds all Boombox API routes to an Express application instance.
   */
  #configureRoutes(app: Application) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, "public")));

    const topicsRouter = require("./routes/topics");
    const documentsRouter = require("./routes/documents");
    const usersRouter = require("./routes/users");
    const responsesRouter = require("./routes/responses");
    const statsRouter = require("./routes/stats");
    const ticketsRouter = require("./routes/tickets");

    app.use("/api/v1/", topicsRouter);
    app.use("/api/v1/", documentsRouter);
    app.use("/api/v1/", usersRouter);
    app.use("/api/v1/", responsesRouter);
    app.use("/api/v1/", statsRouter);
    app.use("/api/v1/", ticketsRouter);

    return app;
  }
}

// error handler
/*
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
