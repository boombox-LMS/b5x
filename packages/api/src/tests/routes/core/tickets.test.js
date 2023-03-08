const supertest = require("supertest");
const { z } = require("zod");
const {
  FeedbackTicketSchema,
  IssueTicketSchema,
  SavedTicketSchema,
} = require("@b5x/types");

describe("Tickets routes should match expectations", () => {
  let app;
  let cookie;
  let testDocumentId;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });

    testDocumentId = await app
      .get("db")
      .knex.select("id")
      .from("documents")
      .where({ uri: global.FIRST_SMOKE_TEST_TOPIC_DOCUMENT_URI })
      .then((rows) => {
        return rows[0].id;
      })
      .catch((e) => {
        throw e;
      });

    // Log the user in
    await supertest(app)
      .post(apiPrefix + "users.logIn")
      .send({ email: "completed-1@test.com" })
      .then((res) => {
        // Save the cookie to send with later requests
        cookie = global.getCookie(res) || cookie;
      })
      .catch((e) => {
        throw e;
      });
  });

  // Close the database connection, which allows Jest to exit gracefully
  afterAll(async () => {
    await app
      .get("db")
      .destroy()
      .catch((e) => {
        throw e;
      });
  });

  // tickets/issues.list --------------------------------------------

  describe("tickets/issues.list matches expectations", () => {
    let responseBody;

    test("tickets/issues.list returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `tickets/issues.list`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets/issues.list returns the correct data type", () => {
      const ResponseBodySchema = z.array(IssueTicketSchema);
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // tickets/feedback.list ------------------------------------------

  describe("tickets/feedback.list matches expectations", () => {
    let responseBody;

    test("tickets/feedback.list returns a 200", async () => {
      await supertest(app)
        .get(apiPrefix + `tickets/feedback.list`)
        .set("Cookie", cookie)
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets/feedback.list returns the correct data type", () => {
      const ResponseBodySchema = z.array(FeedbackTicketSchema);
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // tickets.setStatus ----------------------------------------------

  describe("tickets.setStatus matches expectations", () => {
    let responseBody;
    let testTicketId;

    test("tickets.setStatus returns a 200", async () => {
      testTicketId = await app
        .get("db")
        .knex.select("id")
        .from("tickets")
        .limit(1)
        .then((rows) => {
          return rows[0].id;
        })
        .catch((e) => {
          throw e;
        });

      await supertest(app)
        .post(apiPrefix + `tickets.setStatus`)
        .set("Cookie", cookie)
        .send({
          ticketId: testTicketId,
          status: "in progress",
        })
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets.setStatus returns the correct data type", () => {
      const ResponseBodySchema = SavedTicketSchema.extend({
        id: z.literal(testTicketId),
        status: z.literal("in progress"),
      });
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // tickets.setAssignee --------------------------------------------

  describe("tickets.setAssignee matches expectations", () => {
    let responseBody;
    let testTicketId;
    let testAssigneeEmail;
    let testAssigneeId;

    test("tickets.setAssignee returns a 200", async () => {
      testTicketId = await app
        .get("db")
        .knex.select("id")
        .from("tickets")
        .limit(1)
        .then((rows) => {
          return rows[0].id;
        })
        .catch((e) => {
          throw e;
        });

      await app
        .get("db")
        .knex.select(["email", "id"])
        .from("users")
        .limit(1)
        .then((rows) => {
          testAssigneeEmail = rows[0].email;
          testAssigneeId = rows[0].id;
        })
        .catch((e) => {
          throw e;
        });

      await supertest(app)
        .post(apiPrefix + `tickets.setAssignee`)
        .set("Cookie", cookie)
        .send({
          ticketId: testTicketId,
          assigneeEmail: testAssigneeEmail,
        })
        .expect(200)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets.setAssignee returns the correct data type", () => {
      const ResponseBodySchema = SavedTicketSchema.extend({
        id: z.literal(testTicketId),
        assigneeId: z.literal(testAssigneeId),
      });
      const validator = () => {
        ResponseBodySchema.parse(responseBody);
      };

      expect(validator).not.toThrowError();
    });
  });

  // tickets.create -------------------------------------------------

  describe("tickets.create matches expectations", () => {
    test("tickets.create returns a 200", async () => {
      await supertest(app)
        .post(apiPrefix + `tickets.create`)
        .set("Cookie", cookie)
        .send({
          reporterUrl: "https://localhost:3000/",
          title: "Test issue",
          priorityLevel: 0,
          description: "Test issue description",
        })
        .expect(200);
    });
  });
});
