const { ConditionsHelper } = require("../../../dist/index");
const _ = require("lodash");

describe("ConditionsHelper.parseAuthoredConditions is working as expected", () => {
  test("parseAuthoredConditions returns an empty array when given a string with no content", () => {
    const rawConditions = "           ";
    const expectedResult = [];
    const result = ConditionsHelper.parseAuthoredConditions(rawConditions);
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });

  test("parseAuthoredConditions returns a one-item conditions list when given a single condition", () => {
    const rawConditions = "reader-mood is good";
    const expectedResult = [
      {
        type: "condition",
        data: { alias: "reader-mood", operator: "is", targetValue: "good" },
      },
    ];
    const result = ConditionsHelper.parseAuthoredConditions(rawConditions);
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });

  test("complex parseAuthoredConditions results match snapshots", () => {
    const inputs = [
      "reader-mood is good and favorite-color is blue and location is Seattle",
      "(reader-mood is good and favorite-color is blue) or location is Seattle",
      "(reader-mood is good) or ((favorite-color is blue) and (location is Seattle))",
    ];

    inputs.forEach((input) => {
      const result = ConditionsHelper.parseAuthoredConditions(input);
      expect(result).toMatchSnapshot();
    });
  });
});
