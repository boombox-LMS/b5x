describe("A haunting backlog for API tests that should exist but don't yet (from the coverage report + smoke testing)", () => {
  test.todo(
    "topics.contents should return 403 if the user does not have access to the topic"
  );

  test.todo(
    "topics.enrollment should return 422 if the query data schema is invalid"
  );

  test.todo(
    "topics.verifyCompletion should return 422 if the query data schema is invalid"
  );

  test.todo(
    "topics.verifyCompletion should return false if the topic does not pass the completion check"
  );

  test.todo(
    "User tag removal should throw an error if a value is given without a key"
  );

  test.todo(
    "User tag removal should throw an error if no key is provided and the confirmRemoveAll flag is not set to true"
  );

  test.todo(
    "Seeding the database without users should still complete successfully"
  );

  // This functionality will be deprecated, but we should test it until we remove it
  test.todo(
    "When a user's enrollment in a topic cannot be found, a new enrollment is created"
  );

  test.todo(
    "The enrollment for a documentation-mode topic has the correct data schema"
  );

  test.todo(
    "The enrollment for an in-progress topic has the correct data schema"
  );

  test.todo("Topic NPS is calculated correctly for 25 responses");

  // https://boombox-lms.github.io/b5x/coverage/api/dist/db/manager/subwrappers/TagsDbWrapper.js.html#L244
  test.todo(
    "An existing mono tagging cannot be assigned a new value using add()"
  );

  // https://boombox-lms.github.io/b5x/coverage/api/dist/db/manager/subwrappers/TopicsDbWrapper.js.html#L152
  test.todo(
    "When one topic-access rule is stronger than the other, it overrides the weaker one"
  );

  test.todo(
    "If any of a user's access level rules for a topic includes a block rule, that one will override all other rules"
  );

  test.todo(
    "topics.getCatalog returns the correct data schema for a mix of not started, in progress, and completed topics"
  );

  test.todo(
    "topics.getCatalog lists prerequisites correctly when they are present"
  );

  test.todo("modifyGroups can remove users from groups");

  test.todo(
    "The user's profile data includes any badges that have been earned"
  );

  // TODO: Test status updates for fragments after the new fragment model is implemented
});
