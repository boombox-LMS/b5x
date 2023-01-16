const { ConditionsChecker } = require("../../../dist/ConditionsChecker");

describe("Supported operators are functional", () => {
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

  // is -------------------------------------------------------------

  test('Matched "is" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "is",
          targetValue: "pink",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "is" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "is",
          targetValue: "green",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });

  // is-not ---------------------------------------------------------

  test('Matched "is-not" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "is-not",
          targetValue: "green",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "is-not" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "is-not",
          targetValue: "pink",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });

  // matches --------------------------------------------------------

  test('Matched "matches" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-animal",
          operator: "matches",
          targetValue: "/dog/",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "matches" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-animal",
          operator: "matches",
          targetValue: "/cat/",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });

  // status-is ------------------------------------------------------

  test('Matched "status-is" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "status-is",
          targetValue: "completed",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "status-is" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "favorite-color",
          operator: "status-is",
          targetValue: "hidden",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });

  // selections-include -------------------------------------------

  test('Matched "selections-include" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "places-to-visit",
          operator: "selections-include",
          targetValue: "france",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "selections-include" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "places-to-visit",
          operator: "selections-include",
          targetValue: "antarctica",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });

  // selections-do-not-include --------------------------------------

  test('Matched "selections-do-not-include" returns a true result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "places-to-visit",
          operator: "selections-do-not-include",
          targetValue: "antarctica",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(true);
  });

  test('Unmatched "selections-do-not-include" returns a false result', () => {
    const conditionsData = [
      {
        type: "condition",
        data: {
          uri: "places-to-visit",
          operator: "selections-do-not-include",
          targetValue: "france",
        },
      },
    ];

    const result = checker.conditionsAreMet({ conditionsData });

    expect(result).toBe(false);
  });
});
