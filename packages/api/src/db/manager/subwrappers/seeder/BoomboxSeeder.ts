const fs = require("fs");
const path = require("path");
import { TopicsDbWrapper } from "../TopicsDbWrapper";
import { TagsDbWrapper } from "../TagsDbWrapper";
import { UserActivitySeeder } from "./private/UserActivitySeeder";
import { ExpandedTopic, RawTopic } from "@b5x/types";
import { SavedSeedUser, NewSeedUser, RawSeedUser } from "./types/user";
import { NewTicket } from "@b5x/types";
const { ContentState, EditorState, convertToRaw } = require("draft-js");
const { v4: uuidv4 } = require("uuid");

export class BoomboxSeeder {
  topicFilesDirectory: string | undefined;
  topics: TopicsDbWrapper;
  tags: TagsDbWrapper;
  knex: any;
  tableNames: string[];
  activityBeginDate: Date;
  rawTopicsData: RawTopic[];
  users: SavedSeedUser[];

  constructor(params: { knex: any; topicFilesDirectory?: string }) {
    this.knex = params.knex;
    this.rawTopicsData = [];
    this.topicFilesDirectory =
      params.topicFilesDirectory ||
      path.join(__dirname, ".", "defaultTopicFiles");
    this.users = [];
    this.topics = new TopicsDbWrapper(this.knex);
    this.tags = new TagsDbWrapper(this.knex);
    this.tableNames = [
      "ticketings",
      "tickets",
      "taggings",
      "tags",
      "events",
      "responses",
      "fragment_refs",
      "fragment_excerpts",
      "enrollments",
      "documents",
      "access_rules",
      "topics",
      "users",
    ];

    // because the seeder will populate 30 days of activity,
    // new users, enrollments, etc. should be backdated 31 days
    const today = new Date();
    const thirtyOneDaysAgo = new Date(new Date().setDate(today.getDate() - 31));
    this.activityBeginDate = thirtyOneDaysAgo;
  }

  async seed(
    params: {
      users?: "default" | RawSeedUser[];
      skipFillerTopics?: boolean;
    } = {}
  ) {
    let users: RawSeedUser[];
    let skipFillerTopics = params.skipFillerTopics || false;

    if (params.users === "default") {
      users = [];
      // 3 blank users and 3 enrolled users
      for (let i = 0; i < 3; i++) {
        users.push({ persona: "blank" });
        users.push({ persona: "enrolled" });
      }
      // 2 completed users
      for (let i = 0; i < 2; i++) {
        users.push({ persona: "completed" });
      }
      // 11 variable-catalog users
      for (let i = 0; i < 11; i++) {
        users.push({ persona: "variable-catalog" });
      }
    } else if (params.users === undefined) {
      users = [];
    } else {
      users = params.users;
    }

    // load data from topic files
    return (
      this.#mockCliDataFromTopicFiles()
        // delete everything currently in the database
        .then((mockCliData) => {
          this.rawTopicsData = mockCliData;
          return this.deleteTableData();
        })
        // flush the cache, as it will have old IDs in it
        .then(() => {
          return this.knex.client.redis.flushAll();
        })
        // reset all primary keys back to 1
        // to ensure consistent IDs from seed to seed
        // and avoid long IDs that are hard to debug with
        .then(() => {
          return this.resetAllPrimaryKeys();
        })
        // create users
        .then(() => {
          return this.#insertUsers(users);
        })
        // create topics
        .then((insertedUsers) => {
          this.users = insertedUsers;
          // TODO: The seeder does not currently allow for an empty raw topics array
          return this.#insertTopics(this.rawTopicsData, { skipFillerTopics });
        })
        // populate user activity
        .then(async (insertedTopics) => {
          if (this.users.length > 0) {
            const userActivitySeeder = new UserActivitySeeder(this.knex);
            return userActivitySeeder.insertUserActivity({
              users: this.users,
              insertedTopics,
            });
          } else {
            return true;
          }
        })
        .then(() => {
          return this.#insertTickets();
        })
        .catch((e) => {
          console.error("Error encountered while seeding:", e);
        })
    );
  }

  #mockCliDataFromTopicFiles(): Promise<RawTopic[]> {
    const topicFilesDirectory = this.topicFilesDirectory;
    return new Promise((resolve) => {
      fs.readdir(
        topicFilesDirectory,
        function (err: Error, filenames: string[]) {
          let topicsData: RawTopic[] = [];
          filenames.forEach((filename) => {
            const fileContents = fs.readFileSync(
              `${topicFilesDirectory}/${filename}`
            );
            const cliData: RawTopic = JSON.parse(fileContents).topic;
            topicsData.push(cliData);
          });
          resolve(topicsData);
        }
      );
    });
  }

  async resetAllPrimaryKeys() {
    return new Promise((resolve) => {
      let sequenceResetPromises: any[] = [];

      this.tableNames.forEach((tableName) => {
        sequenceResetPromises.push(
          this.knex.raw(
            `SELECT pg_catalog.setval(pg_get_serial_sequence('${tableName}', 'id'), 1)`
          )
        );
      });

      Promise.all(sequenceResetPromises)
        .then(() => {
          resolve(true);
        })
        .catch((e: any) => {
          console.error(e);
        });
    });
  }

  async deleteTableData() {
    for (let i = 0; i < this.tableNames.length; i++) {
      const tableName = this.tableNames[i];
      await this.knex(tableName).del();
    }

    return true;
  }

  /**
   *  Insert the requested array of users.
   */
  async #insertUsers(users: RawSeedUser[]): Promise<SavedSeedUser[]> {
    if (users.length === 0) {
      return [];
    }

    let personaCount: Record<string, number> = {};
    let usersToInsert: NewSeedUser[] = [];
    users.forEach((user) => {
      // assign a default persona of blank if persona is not present
      user.persona = user.persona || "blank";

      if (user.email === undefined) {
        if (personaCount[user.persona]) {
          personaCount[user.persona]++;
        } else {
          personaCount[user.persona] = 1;
        }
        user.username = `${user.persona}-${personaCount[user.persona]}`;
        user.email = `${user.username}@test.com`;
      }

      usersToInsert.push({
        email: user.email,
        firstName: user.persona.charAt(0).toUpperCase() + user.persona.slice(1),
        lastName: "User",
        username: user.username || uuidv4(),
        createdAt: this.activityBeginDate.toISOString(),
      });
    });

    // Add Jen's personal test user
    // TODO: Allow all test user data to be passed as config
    // to seeding function instead of hardcoding it here
    usersToInsert.push({
      email: "jen@test.com",
      firstName: "Jen",
      lastName: "Gilbert",
      username: "jen",
      createdAt: this.activityBeginDate.toISOString(),
    });

    users.push({
      persona: "blank",
      email: "jen@test.com",
      username: "jen",
    });

    // insert users into the database
    const insertedUsers = await this.knex("users")
      .returning(["id", "email"])
      .insert(usersToInsert)
      // attach personas / groups to DB data for easy reference
      .then((rows: { id: number; email: string }[]) => {
        const insertedUsers: SavedSeedUser[] = [];
        rows.forEach((row, i) => {
          const insertedUser: SavedSeedUser = {
            ...row,
            persona: users[i].persona,
            groups: users[i].groups || [],
          };
          insertedUsers.push(insertedUser);
        });
        return insertedUsers;
      })
      .catch((e: any) => {
        console.error(e);
      });

    // add users to their configured access groups

    for (let i = 0; i < insertedUsers.length; i++) {
      const user = insertedUsers[i];
      for (let n = 0; n < user.groups.length; n++) {
        const groupName = user.groups[n];
        await this.tags.add({
          userId: user.id,
          key: "user-group",
          value: groupName,
        });
      }
    }

    return insertedUsers;
  }

  // TODO: Make a separate TicketFactory class
  async #insertTickets() {
    const nouns = [
      "document",
      "topic",
      "input",
      "button",
      "link",
      "page",
      "sentence",
      "image",
      "explanation",
      "example",
      "paragraph",
    ];
    const exclamations = [
      "Holy moly",
      "Oh my sweet mustard",
      "Yowza",
      "Geez Louise",
      "Holy cannoli",
      "Ay caramba",
      "Zoinks",
      "Zut alors",
      "Oh Mylanta",
      "Well I never",
      "Jeepers",
      "Ahem",
      "Golly",
      "Good grief",
      "Gah",
    ];
    const issueAdjectives = [
      "incomplete",
      "broken",
      "offensive",
      "unfortunate",
      "unattractive",
      "misaligned",
      "goofy",
    ];
    const feedbackAdjectives = [
      "helpful",
      "relevant",
      "ideal",
      "enjoyable",
      "engaging",
      "fun",
      "humorous",
    ];
    const ticketActions = [
      "I ran across",
      "I was looking at",
      "I glanced at",
      "I noticed",
      "I couldn't stop staring at",
      "I was mesmerized by",
      "I stopped in my tracks when I saw",
      "I was taken aback by",
      "I am astonished by",
      "I am in disbelief about",
    ];
    const issueComments = [
      "Can you please do something about this?",
      "Is this something you can fix?",
      "This is just not acceptable!",
      "I'm really disappointed by this.",
      "Please help!",
      "Ouch.",
      "I'd appreciate a response about this.",
    ];
    const feedbackComments = [
      "Great work, team!",
      "I have never been so impressed in my entire life.",
      "Wow. Wow. WOW.",
      "This is incredible. Thank you!",
      "Amazing.",
      "#GOAT",
      "I love it.",
      "Keep up the good work.",
      "I also shared this feedback with your manager.",
      "I just wanted to say thank you!",
    ];
    const issuePriorityLevels = [0, 1, 2];
    const feedbackPriorityLevels = [3, 4, 5];
    const conjunctions = ["...", "and", "--", "&"];

    const numTickets = 100;
    let ticketsToInsert: NewTicket[] = [];
    for (let i = 0; i < numTickets; i++) {
      let priorityLevel, adjective, comment, reporterUrl;

      // build an issue ticket
      if (i % 2 === 0) {
        priorityLevel = issuePriorityLevels[i % issuePriorityLevels.length];
        adjective = issueAdjectives[i % issueAdjectives.length];
        comment = issueComments[i % issueComments.length];
        // build a feedback ticket
      } else {
        priorityLevel =
          feedbackPriorityLevels[i % feedbackPriorityLevels.length];
        adjective = feedbackAdjectives[i % feedbackAdjectives.length];
        comment = feedbackComments[i % feedbackComments.length];
      }

      reporterUrl = "https://localhost:3000/";

      const noun = nouns[i % nouns.length];
      const action = ticketActions[i % ticketActions.length];
      const conjunction = conjunctions[i % conjunctions.length];
      const title = `${noun} is ${adjective}`;
      const description = `${
        exclamations[i % exclamations.length]
      }, ${action} this ${noun} ${conjunction} it is just so ${adjective}! ${comment}`;
      const jsonifiedRtfDescription = convertToRaw(
        ContentState.createFromText(description)
      );

      const ticket = {
        priorityLevel,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: jsonifiedRtfDescription,
        reporterId: this.users[i % this.users.length].id, // TODO: This breaks if someone tries to seed with no users, have a dedicated user for this instead
        reporterUrl,
        status: "not started",
      };

      ticketsToInsert.push(ticket);
    }

    return this.knex("tickets").insert(ticketsToInsert);
  }

  async #insertTopic(topic: RawTopic) {
    return this.topics.publish({ topic });
  }

  /**
   *  Insert any topics in the topicFiles directory.
   *  Done in linear order to ensure consistent
   *  topic, document, and fragment IDs for a given fileset,
   *  which makes snapshot testing possible.
   */
  async #insertTopics(
    rawTopicsData: RawTopic[],
    options: { skipFillerTopics?: boolean }
  ) {
    let insertedTopics: ExpandedTopic[] = [];
    for (let i = 0; i < rawTopicsData.length; i++) {
      const topic: RawTopic = rawTopicsData[i];
      if (options.skipFillerTopics && new RegExp(/filler/).test(topic.slug)) {
        continue;
      }
      const insertedTopic = await this.#insertTopic(topic);
      insertedTopics.push(insertedTopic);
    }
    return insertedTopics;
  }
}
