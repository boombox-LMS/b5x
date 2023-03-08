const supertest = require("supertest");
const { sanitizeFields } = require("data-sanitizer");

describe("Tickets routes should match snapshots", () => {
  let app;
  let cookie;
  let testDocumentId;
  const apiPrefix = global.__SUPERTEST_API_PREFIX__;

  const compareResultToSnapshots = (responseBody) => {
    const sanitationResult = sanitizeFields({
      data: responseBody,
      fieldNames: ["id", "createdAt", "updatedAt", "key"],
    });
    expect(sanitationResult.data).toMatchSnapshot();
    expect(sanitationResult.removedValues.id.join(", ")).toMatchSnapshot();
  };

  beforeAll(async () => {
    // Add a seeded test database to the app, available as app.get('db')
    app = await global.buildAppWithSeededTestDatabase({
      users: [{ persona: "completed" }],
    });

    testDocumentId = await app
      .get("db")
      .knex.select("id")
      .from("documents")
      .where({ uri: "smoke-testing-vseed_setup" })
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
    await app.get("db").destroy();
  });

  // tickets/issues.list --------------------------------------------

  describe("tickets/issues.list matches the snapshot", () => {
    let responseBody;

    test("tickets/issues.list returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `tickets/issues.list`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets/issues.list matches the snapshot on file", () => {
      compareResultToSnapshots(responseBody);
    });
  });

  // tickets/feedback.list ------------------------------------------

  describe("tickets/feedback.list matches the snapshot", () => {
    let responseBody;

    test("tickets/feedback.list returns a response", async () => {
      await supertest(app)
        .get(apiPrefix + `tickets/feedback.list`)
        .set("Cookie", cookie)
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets/feedback.list matches the snapshot", () => {
      compareResultToSnapshots(responseBody);
    });
  });

  // tickets.setStatus ----------------------------------------------

  describe("tickets.setStatus matches the snapshot", () => {
    let responseBody;
    let testTicketId;

    test("tickets.setStatus returns a response", async () => {
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
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets.setStatus matches the snapshot", () => {
      compareResultToSnapshots(responseBody);
    });
  });

  // tickets.setAssignee --------------------------------------------

  describe("tickets.setAssignee matches expectations", () => {
    let responseBody;
    let testTicketId;
    let testAssigneeEmail;
    let testAssigneeId;

    test("tickets.setAssignee returns a response", async () => {
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
        .then((res) => {
          responseBody = res.body;
        })
        .catch((e) => {
          throw e;
        });
    });

    test("tickets.setAssignee matches the snapshot", () => {
      compareResultToSnapshots(responseBody);
    });
  });
});
