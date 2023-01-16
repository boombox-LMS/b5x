const Queue = require("bull");
import { DbWrapper } from "./DbWrapper";
import { NewEvent, SavedEvent } from "@b5x/types";

export class EventsDbWrapper extends DbWrapper {
  creationQueue: any;

  constructor(knex: any) {
    super(knex, "events");
    this.knex = knex;
    const databaseName = this.knex.context.client.connectionSettings.database;
    this.creationQueue = new Queue(
      `event creation in database ${databaseName}`,
      "redis://127.0.0.1:6379"
    );
    this.creationQueue.process((job: any, done: any) => {
      const { name, data } = job.data;
      this.create({ name, data }).then((createdEvent) => {
        done(createdEvent);
      });
    });
  }

  queueCreate(event: NewEvent) {
    this.creationQueue.add(event);
  }

  create(event: NewEvent): Promise<SavedEvent> {
    const { name, data } = event;

    return this.knex("events")
      .returning(["id", "name", "data"])
      .insert({
        name,
        data: JSON.stringify(data),
      })
      .then((rows: SavedEvent[]) => {
        const event = rows[0];
        return event;
      });
  }

  async destroy() {
    await this.creationQueue.close();
    return true;
  }
}
