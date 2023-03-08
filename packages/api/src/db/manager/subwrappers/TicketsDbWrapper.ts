const Queue = require("bull");
import { DbWrapper } from "./DbWrapper";
import {
  FeedbackTicket,
  IssueTicket,
  NewTicket,
  SavedTicket,
} from "@b5x/types";
import { SavedUser } from "@b5x/types";

const savedTicketAttrs = [
  "id",
  "status",
  "description",
  "title",
  "reporterId",
  "reporterUrl",
  "assigneeId",
  "priorityLevel",
];

export class TicketsDbWrapper extends DbWrapper {
  creationQueue: any;

  constructor(knex: any) {
    super(knex, "tickets");
    this.knex = knex;
    const databaseName = this.knex.context.client.connectionSettings.database;
    this.creationQueue = new Queue(
      `ticket creation in database ${databaseName}`,
      "redis://127.0.0.1:6379"
    );
    this.creationQueue.process((job: any, done: any) => {
      this.create(job.data)
        .then((ticket: SavedTicket) => {
          done(ticket);
        })
        .catch((e: any) => {
          console.error(e);
        });
    });
  }

  queueCreate(ticket: NewTicket) {
    this.creationQueue.add(ticket);
  }

  // TODO: Handle bad input
  // TODO: Narrow status string to the acceptable values only
  // TODO: Go through all files and add return values as shown below
  setStatus(ticketId: number, status: string): Promise<SavedTicket> {
    return this.knex("tickets")
      .returning(savedTicketAttrs) // TODO: Replace with Zod schema usage
      .update({ status })
      .where({ id: ticketId })
      .then((rows: SavedTicket[]) => {
        return rows[0];
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  // TODO: Handle bad input
  async setAssignee(
    ticketId: number,
    assigneeEmail: string
  ): Promise<SavedTicket> {
    const assigneeId = await this.knex("users")
      .where({ email: assigneeEmail })
      .limit(1)
      .cache()
      .then((rows: SavedUser[]) => {
        return rows[0].id;
      })
      .catch((e: any) => {
        console.error(e);
      });

    return this.knex("tickets")
      .returning(savedTicketAttrs)
      .update({ assigneeId })
      .where({ id: ticketId })
      .then((rows: SavedTicket[]) => {
        return rows[0];
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  getIssues(): Promise<IssueTicket[]> {
    return this.knex
      .select("tickets.*", "users.email AS assigneeEmail")
      .from("tickets")
      .leftJoin("users", "tickets.assigneeId", "users.id")
      .whereIn("priorityLevel", [0, 1, 2])
      .orderBy("id");
  }

  getFeedback(): Promise<FeedbackTicket[]> {
    return this.knex
      .select("tickets.*", "users.email AS assigneeEmail")
      .from("tickets")
      .leftJoin("users", "tickets.assigneeId", "users.id")
      .whereIn("priorityLevel", [3, 4, 5])
      .orderBy("id");
  }

  // TODO: handle ticketings
  create(ticket: NewTicket): Promise<SavedTicket> {
    const { title, description, priorityLevel, reporterId, reporterUrl } =
      ticket;

    return this.knex("tickets")
      .returning(savedTicketAttrs)
      .insert({
        reporterId,
        reporterUrl,
        title,
        priorityLevel,
        status: "not started",
        description: JSON.stringify(description),
      })
      .then((rows: SavedTicket[]) => {
        const ticket = rows[0];
        return ticket;
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  async destroy() {
    await this.creationQueue.close();
    return true;
  }
}
