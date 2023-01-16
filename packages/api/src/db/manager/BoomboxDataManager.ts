const _ = require("lodash");

// helper classes containing db queries
import { TopicsDbWrapper } from "./subwrappers/TopicsDbWrapper";
import { UsersDbWrapper } from "./subwrappers/UsersDbWrapper";
import { DocumentsDbWrapper } from "./subwrappers/DocumentsDbWrapper";
import { EnrollmentsDbWrapper } from "./subwrappers/EnrollmentsDbWrapper";
import { FragmentsDbWrapper } from "./subwrappers/FragmentsDbWrapper";
import { ResponsesDbWrapper } from "./subwrappers/ResponsesDbWrapper";
import { StatsDbWrapper } from "./subwrappers/StatsDbWrapper";
import { TagsDbWrapper } from "./subwrappers/TagsDbWrapper";
import { EventsDbWrapper } from "./subwrappers/EventsDbWrapper";
import { TicketsDbWrapper } from "./subwrappers/TicketsDbWrapper";
import { BoomboxSeeder } from "./subwrappers/seeder/BoomboxSeeder";

/**
 * The interface for persistent Boombox data, including caching and session storage.
 * The BoomboxDataManager is essentially just a collection of more specific database wrappers
 * (e.g., the wrapper for the topics resource).
 *
 * Responsibilities:
 *   - initialize and reuse the same DB and cache connections
 *   - provide one unified interface for various types of queries (e.g., stats queries, topic queries)
 *   - seed the database for development and testing
 *   - cache DB queries where applicable for faster performance
 *   - abstract away some aspects of the database schema
 *      (such as fragments being split into their reusable content and their unique properties)
 *
 * BoomboxDataManager's entity attributes (tickets, users, enrollments, topics, etc.) essentially
 * act as models for those tables.
 *
 * @example
 * const knex = new DatabaseConnectionBuilder("test").createDatabaseConnection()
 * const db = new BoomboxDataManager(knex)
 * const topicContents = db.topics.contents({ uri: my-topic-uri })
 */
export class BoomboxDataManager {
  topics: TopicsDbWrapper;
  tickets: TicketsDbWrapper;
  users: UsersDbWrapper;
  documents: DocumentsDbWrapper;
  enrollments: EnrollmentsDbWrapper;
  fragments: FragmentsDbWrapper;
  responses: ResponsesDbWrapper;
  stats: StatsDbWrapper;
  tags: TagsDbWrapper;
  events: EventsDbWrapper;
  seeder: BoomboxSeeder;
  knex: any;

  constructor(knex: any) {
    this.knex = knex;
    this.topics = new TopicsDbWrapper(knex);
    this.tickets = new TicketsDbWrapper(knex);
    this.users = new UsersDbWrapper(knex);
    this.documents = new DocumentsDbWrapper(knex);
    this.enrollments = new EnrollmentsDbWrapper(knex);
    this.fragments = new FragmentsDbWrapper(knex);
    this.responses = new ResponsesDbWrapper(knex);
    this.stats = new StatsDbWrapper(knex);
    this.tags = new TagsDbWrapper(knex);
    this.events = new EventsDbWrapper(knex);
    this.seeder = new BoomboxSeeder({ knex });
  }

  /**
   *  Clear the cache, delete any queued tasks, and close all connections.
   */
  async destroy() {
    let destroyPromises: Promise<any>[] = [];
    const dbWrappers = [
      this.topics,
      this.documents,
      this.enrollments,
      this.fragments,
      this.stats,
      this.tags,
      this.events,
      this.tickets,
    ];

    dbWrappers.forEach((dbWrapper) => {
      destroyPromises.push(dbWrapper.destroy());
    });

    await Promise.all(destroyPromises);

    return this.knex
      .destroy()
      .then(() => {
        return this.knex.client.redis.flushAll();
      })
      .then(() => {
        return this.knex.client.redis.quit();
      })
      .then(() => {
        return true;
      })
      .catch((e: any) => {
        console.error((e: any) => {
          console.error("Error encountered in destroy():", e);
        });
      });
  }
}

module.exports = { BoomboxDataManager };
