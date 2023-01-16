const { ConditionsHelper } = require("../../../dist/index");

describe("ConditionsHelper.hasStickyParens is working as expected", () => {
  test("hasStickyParens detects an open paren at the start of an array", () => {
    const items = [
      ["(", "x", "y"],
      ["a", "b", "c"],
    ];

    const result = ConditionsHelper.hasStickyParens(items);

    expect(result).toBe(true);
  });

  test("hasStickyParens detects a closing paren at the end of an array", () => {
    const items = [
      ["x", "y", "z"],
      ["a", "b", "c"],
      ["d", "e", ")"],
    ];

    const result = ConditionsHelper.hasStickyParens(items);

    expect(result).toBe(true);
  });

  test("hasStickyParens returns false in all other cases", () => {
    const items = [
      [")", "y", "z"],
      ["a", "b", "("],
      ["d", "e", "f"],
      ["g", "(", "i"],
      ["a", ")", "c"],
    ];

    const result = ConditionsHelper.hasStickyParens(items);

    expect(result).toBe(false);
  });
});
