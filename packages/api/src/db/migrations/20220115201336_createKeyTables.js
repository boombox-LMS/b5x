exports.up = async function (knex) {
  await knex.schema
    .createTable("users", (table) => {
      /**
       *  Create users table
       */
      table.increments();
      table.string("first_name");
      table.string("last_name");
      table.string("api_key");
      table.string("username").index();
      table.unique("username");
      table.string("email").index();
      table.unique("email");
      table.timestamps(false, true);
    })
    /**
     *  Create topics table
     */
    .createTable("topics", (table) => {
      table.increments();
      table.string("uri").index();
      table.unique("uri");
      table.string("slug").index();
      table.string("title");
      table.string("subtitle");
      table.string("cover_image_url");
      table.string("version");
      table.json("config");
      table.timestamps(false, true);
      /**
       *  Create access rules table
       */
    })
    .createTable("access_rules", (table) => {
      table.increments();
      table.string("topic_slug").index();
      table.string("group_name");
      table.string("access_level");
      table.timestamps(false, true);
      /**
       *  Create documents table
       */
    })
    .createTable("documents", (table) => {
      table.increments();
      table.string("uri").index();
      table.unique("uri");
      table.string("title");
      table.string("slug"); // TODO: Does the slug serve a purpose in the api or can it be omitted?
      table.integer("order");
      // TODO: This is inconsistent with the topic, which stores the content mode in the config,
      // but I'm wanting to deprecate the config anyway
      table.string("content_mode");
      table.string("digest");
      table.json("config");
      table.json("child_uris");
      table.json("external_dependency_uris");
      table.json("dependency_uris");
      table.json("display_conditions");
      table.json("completion_conditions");
      table.string("topic_uri").index();
      table.foreign("topic_uri").references("topics.uri").onDelete("CASCADE");
      table.timestamps(false, true);
    })
    /**
     *  Snippets (part 1 of a fragment)
     */
    .createTable("fragment_excerpts", (table) => {
      table.increments();
      table.text("contents");
      table.json("data");
      table.string("content_type");
      table.boolean("is_stateful");
      table.string("digest").index();
      table.unique("digest");
      table.timestamps(false, true);
    })
    /**
     *  Snippet references (part 2 of a fragment)
     */
    .createTable("fragment_refs", (table) => {
      table.increments();
      table.string("uri").index();
      table.unique("uri");
      table.string("document_uri").index();
      table
        .foreign("document_uri")
        .references("documents.uri")
        .onDelete("CASCADE");
      table.integer("fragment_excerpt_id");
      table.foreign("fragment_excerpt_id").references("fragment_excerpts.id");
      table.json("display_conditions");
      table.json("dependency_uris");
      table.json("child_uris");
      table.boolean("is_required");
      table.timestamps(false, true);
    })
    /**
     *  Enrollments
     */
    .createTable("enrollments", (table) => {
      table.increments();
      table.string("current_document_uri");
      table.foreign("current_document_uri").references("documents.uri");
      table.integer("user_id").index();
      table.foreign("user_id").references("users.id");
      table.string("topic_uri");
      table.foreign("topic_uri").references("topics.uri");
      table.timestamps(false, true);
    })
    /**
     *  Responses
     */
    .createTable("responses", (table) => {
      table.increments();
      table.json("value");
      table.string("status");
      table.string("fragment_ref_uri");
      table.foreign("fragment_ref_uri").references("fragment_refs.uri");
      table.integer("enrollment_id").index();
      table.foreign("enrollment_id").references("enrollments.id");
      table.timestamps(false, true);
      /**
       *  Events:
       *  An event has many event_items --
       *  in other words, an event can be associated
       *  with any other entity in the database,
       *  such as a response or enrollment.
       */
    })
    .createTable("events", (table) => {
      table.increments();
      table.string("name");
      table.json("data");
      table.timestamps(false, true);
      /**
       *  KV tags:
       *  A set of key-value tags that can be used
       *  to append information to any other entity
       *  in the database.
       */
    })
    .createTable("tags", (table) => {
      table.increments();
      table.string("key").index();
      table.jsonb("value");
      table.unique(["key", "value"]);
      table.timestamps(false, true);
      /**
       *  Taggings:
       *  A join table that connects database entities
       *  with their kv tags.
       */
    })
    .createTable("taggings", (table) => {
      table.increments();
      table.string("taggable_table_name");
      table.integer("taggable_id").index();
      table.integer("tag_id").index();
      table.unique(["taggable_table_name", "taggable_id", "tag_id"]);
      table.string("mode");
      table.timestamps(false, true);
      /**
       *  Tickets:
       *  For any user-submitted feedback (positive or constructive).
       */
    })
    .createTable("tickets", (table) => {
      table.increments();
      table.integer("reporter_id");
      table.foreign("reporter_id").references("users.id");
      table.integer("assignee_id");
      table.foreign("assignee_id").references("users.id");
      table.integer("priority_level").index();
      table.string("status").index();
      table.string("title");
      table.string("reporter_url");
      table.json("description");
      table.timestamps(false, true);
      /**
       *  Ticketings:
       *  A join table that connects database entities
       *  with their associated tickets.
       */
    })
    .createTable("ticketings", (table) => {
      table.increments();
      table.string("ticketable_table_name");
      table.integer("ticketable_id").index();
      table.integer("ticket_id").index();
      table.unique(["ticketable_table_name", "ticketable_id", "ticket_id"]);
      table.timestamps(false, true);
    });

  /**
   *  Add automatic timestamp updates to tables
   */
  const tableNames = [
    "users",
    "topics",
    "access_rules",
    "documents",
    "fragment_excerpts",
    "fragment_refs",
    "enrollments",
    "responses",
    "events",
    "tags",
    "taggings",
    "tickets",
    "ticketings",
  ];

  for (let i = 0; i < tableNames.length; i++) {
    const tableName = tableNames[i];
    await knex.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE
      ON ${tableName}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);
  }
};

/**
 *  Drop all created tables on rollback
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("ticketings")
    .dropTableIfExists("tickets")
    .dropTableIfExists("taggings")
    .dropTableIfExists("tags")
    .dropTableIfExists("events")
    .dropTableIfExists("responses")
    .dropTableIfExists("fragment_refs")
    .dropTableIfExists("fragment_excerpts")
    .dropTableIfExists("enrollments")
    .dropTableIfExists("documents")
    .dropTableIfExists("users")
    .dropTableIfExists("access_rules")
    .dropTableIfExists("topics");
};
