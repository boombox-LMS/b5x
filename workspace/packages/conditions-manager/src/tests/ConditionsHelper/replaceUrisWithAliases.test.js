const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.replaceAliasesWithUris is working as expected", () => {
  test("replaceAliasesWithUris replaces aliases with the correct URIs", () => {
    const urisByAlias = {
      "reader-mood": "reader_mood_URI",
      "reader-location": "reader_location_URI",
      "reader-role": "reader_role_URI",
    };
    const conditions = [
      [
        [
          {
            type: "condition",
            data: { alias: "reader-mood", operator: "is", targetValue: "good" },
          },
        ],
        { type: "conjunction", data: "and" },
        [
          {
            type: "condition",
            data: {
              alias: "reader-location",
              operator: "is",
              targetValue: "Seattle",
            },
          },
        ],
      ],
      { type: "conjunction", data: "or" },
      [
        {
          type: "condition",
          data: {
            alias: "reader-role",
            operator: "is_not",
            targetValue: "designer",
          },
        },
      ],
    ];
    const expectedResult = [
      [
        [
          {
            type: "condition",
            data: {
              uri: "reader_mood_URI",
              operator: "is",
              targetValue: "good",
            },
          },
        ],
        { type: "conjunction", data: "and" },
        [
          {
            type: "condition",
            data: {
              uri: "reader_location_URI",
              operator: "is",
              targetValue: "Seattle",
            },
          },
        ],
      ],
      { type: "conjunction", data: "or" },
      [
        {
          type: "condition",
          data: {
            uri: "reader_role_URI",
            operator: "is_not",
            targetValue: "designer",
          },
        },
      ],
    ];
    const result = ConditionsHelper.replaceAliasesWithUris(
      conditions,
      urisByAlias
    );

    expect(_.isEqual(result, expectedResult)).toBe(true);
  });
});
