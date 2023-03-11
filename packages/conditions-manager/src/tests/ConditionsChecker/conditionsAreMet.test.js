const { ConditionsChecker } = require("../../../dist/ConditionsChecker");

describe("conditionsAreMet working as expected", () => {
  const mockUserResponses = {
    // short text question
    "favorite-animal": { value: "dog" },
    // single-select question
    "favorite-color": { value: "pink", status: "completed" },
    // multi-select question
    "places-to-visit": {
      value: {
        france: true,
        antarctica: false,
        japan: true,
        "death-valley": false,
      },
    },
    // user reply
    "challenge-confirmation": {
      value: "t",
    },
  };

  const checker = new ConditionsChecker({
    responsesByFragmentUri: mockUserResponses,
  });

  // empty-conditions ---------------------------------------------------------

  test("Conditions are empty returns a true result", () => {
    const conditionsData = [];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });
});
