import {
  ConditionsList,
  DraftCondition,
  DraftConditionsList,
  ConditionOperatorSchema,
} from "@b5x/types";
import _ from "lodash";

/*
A set of functions that allows human-authored conditions to be converted 
into a machine-readable format, and for that machine-readable format 
to be amended with additional items as needed.
*/

/**
 *  Extract and return the URIs from a list of conditions.
 */
const collectDependencies = (params: {
  conditions: ConditionsList | DraftConditionsList;
}): string[] => {
  let dependencies = new Set<string>();
  params.conditions.forEach((item) => {
    // skip conjunctions
    if (!Array.isArray(item) && item.type === "conjunction") {
      return;
    }
    // process a nested dependency list recursively
    else if (Array.isArray(item)) {
      dependencies = new Set([
        ...dependencies,
        ...collectDependencies({ conditions: item }),
      ]);
    } else if (item.type === "condition") {
      if ("uri" in item.data) {
        dependencies.add(item.data.uri);
      }
    }
  });
  return Array.from(dependencies);
};

/**
 *  Parse the human-authored conditions string into a conditions array,
 *  clean up the resulting array, and return the array
 */
const buildConditions = (rawConditions: string) => {
  let conditions = parseAuthoredConditions(rawConditions);
  conditions = simplifyConditions(conditions);
  return conditions;
};

const hasStickyParens = (items: string[] | any[][]) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.length > 1 && item[0] === "(") {
      return true;
    } else if (item.length > 1 && item[item.length - 1] === ")") {
      return true;
    }
  }

  return false;
};

/*
  Clean up any 'sticky' parens that might show up in a condition being processed.

  Example input:
  ['(reader-mood', 'is', 'good)']

  Example output:
  ['(', 'reader-mood', 'is', 'good', ')']
  */
const detachLeadingTrailingParens = (items: string[]) => {
  let expandedList: string[] = [];

  items.forEach((item) => {
    if (item.length > 1 && item[0] === "(") {
      expandedList.push("(");
      expandedList.push(item.slice(1));
    } else if (item.length > 1 && item[item.length - 1] === ")") {
      expandedList.push(item.slice(0, -1));
      expandedList.push(")");
    } else {
      expandedList.push(item);
    }
  });

  return expandedList;
};

/**
 *  Recursively parse the human-authored conditions string
 *  into a conditions list.
 */
const parseAuthoredConditions = (
  rawConditions: string
): DraftConditionsList => {
  let formattedExpression = formatConditionalExpression(rawConditions);

  // BASE CASE 1: empty conditions
  if (formattedExpression === "") {
    return [];
  }

  let expressionComponents = formattedExpression.split(" ");

  // BASE CASE 2: single condition
  if (isSingleConditionStr({ formattedExpression })) {
    let operator = expressionComponents[1];
    try {
      operator = ConditionOperatorSchema.parse(operator);
    } catch (e) {
      throw new Error(
        `Unable to parse operator in condition string: ${formattedExpression}`
      );
    }
    const condition: DraftCondition = {
      type: "condition",
      data: {
        alias: expressionComponents[0],
        // @ts-ignore, validated above.
        // TODO: Figure out how to narrow the type of a string, since I keep running into this problem
        operator: expressionComponents[1],
        targetValue: expressionComponents[2].trim(),
      },
    };
    return [condition];
  }

  // RECURSIVE CASE: Multiple or nested conditions to break apart

  // detach any parens that are "stuck" to other items
  while (hasStickyParens(expressionComponents)) {
    expressionComponents = detachLeadingTrailingParens(expressionComponents);
  }

  let parsedResult: DraftConditionsList = [];

  // walk through the items until a parsable condition or conjunction is found,
  // then add that condition/conjunction to the result array

  let textBuffer = "";
  let parenStack = [];

  for (let i = 0; i < expressionComponents.length; i++) {
    const item = expressionComponents[i];
    // add item to buffer string in case it needs evaluation
    textBuffer += " ";
    textBuffer += item;

    // SUBEXPRESSION HANDLING
    // handle beginning of subexpression
    if (item === "(") {
      parenStack.push(item);
      continue;
    }

    // handle continuation of subexpression
    if (item === ")" && parenStack.length > 1) {
      parenStack.pop();
      continue;
    }

    // handle end of subexpression (stop and parse it)
    if (item === ")" && parenStack.length === 1) {
      parenStack.pop();
      // parse what's in the text buffer and reset it for the next items
      parsedResult.push(parseAuthoredConditions(textBuffer));
      textBuffer = "";
      continue;
    }

    // handle continuation of expression
    if (parenStack.length > 0) {
      continue;
    }

    // HANDLING EXPRESSIONS OUTSIDE OF PARENS
    // as in the case of two or more single expressions
    // joined by a conjunction
    if (
      isSingleConditionStr({
        formattedExpression: formatConditionalExpression(textBuffer),
      })
    ) {
      parsedResult.push(parseAuthoredConditions(textBuffer));
      textBuffer = "";
      continue;
    }

    // conjunction handling
    if (["and", "or"].includes(item)) {
      // @ts-ignore, validated above
      parsedResult.push({ type: "conjunction", data: item });
      textBuffer = "";
      continue;
    }
  }

  return parsedResult;
};

/**
 *  Verify that a string contains the correct balance of parantheses.
 *
 *  Balanced examples (would return true):
 *  - (xyz)
 *  - (x(y)z)
 *  - ((x)(y)(z))
 *
 *  Imbalanced examples (would return false):
 *  - (xyz
 *  - (x(yz)
 *  - (x)(y)(z))
 */
const parensAreBalanced = (exp: string) => {
  let parenStack: ("(" | ")")[] = [];
  for (let i = 0; i < exp.length; i++) {
    const char = exp[i];
    if (char === "(") {
      parenStack.push("(");
    } else if (char === ")") {
      if (!parenStack.pop()) {
        return false;
      }
    }
  }
  return parenStack.length === 0;
};

/**
 *  Clean up human-authored conditions string for reliable parsing.
 */
const formatConditionalExpression = (rawConditions: string) => {
  let formattedResult = rawConditions;

  // replace newlines with spaces
  formattedResult = formattedResult.replace("\n", " ");

  // remove double spaces
  while (formattedResult.includes("  ")) {
    formattedResult = formattedResult.replace("  ", " ");
  }

  // trim whitespace
  formattedResult = formattedResult.trim();

  // strip enclosing parens, provided the stripped result
  // will still have balanced parens (and continue
  // trimming any whitespace along the way)
  while (formattedResult[0] === "(" && formattedResult.slice(-1) === ")") {
    if (parensAreBalanced(formattedResult.slice(1, -1))) {
      formattedResult = formattedResult.slice(1, -1);
      formattedResult = formattedResult.trim();
    } else {
      break;
    }
  }

  return formattedResult;
};

/**
 *  Remove any redundant or unnecessary items from the conditions array.
 */
const simplifyConditions = (conditions: any) => {
  // Do nothing to 'and', 'or', or a single condition item
  if (!_.isArray(conditions)) {
    return conditions;
  }

  let simplifiedConditions: ConditionsList = [];

  // Pop off redundant closing arrays if present
  while (conditions.length === 1 && _.isArray(conditions[0])) {
    conditions = conditions[0];
  }

  // Simplify any sublists recursively
  // @ts-ignore
  conditions.forEach((item) => {
    // @ts-ignore
    simplifiedConditions.push(simplifyConditions(item));
  });

  return simplifiedConditions;
};

const isSingleConditionStr = (params: { formattedExpression: string }) => {
  /*
  TODO: This regex will likely have to get fancier,
  for now it assumes a LOT of good behavior from the user.
  A good regex for a single expression is a bit tricky,
  since the third item in a match condition is a regex, 
  and could contain any character.
  I'll likely need multiple passes with a few regexes
  to determine a valid single expression.
  But these are all solvable problems for tomorrow ...
  v1 is just about the happy path!
  */
  const conditionRegex = /^[^ ]* [^ ]* [^ ]*$/;
  const match = params.formattedExpression.match(conditionRegex);
  if (match && match.length === 1) {
    return true;
  } else {
    return false;
  }
};

const concatConditions = (
  oldConditions: ConditionsList,
  newConditions: ConditionsList
) => {
  if (oldConditions.length === 0) {
    return simplifyConditions(newConditions);
  } else if (newConditions.length === 0) {
    return simplifyConditions(oldConditions);
  } else {
    return simplifyConditions([
      oldConditions,
      { type: "conjunction", data: "and" },
      newConditions,
    ]);
  }
};

/**
 *  Author-assigned fragment IDs (e.g., favorite-color)
 *  are initially used to build conditions, but once the entire topic
 *  has been processed, these identifiers can be replaced
 *  with the more specific URI assigned to that fragment.
 */
const replaceAliasesWithUris = (
  conditions: DraftConditionsList,
  urisByAlias: Record<string, string>
) => {
  conditions.forEach((item) => {
    // skip conjunctions
    if (!Array.isArray(item) && item.type === "conjunction") {
      return;
    }
    // update single conditions
    if (!Array.isArray(item) && item.type === "condition") {
      if (
        !("uri" in item.data) &&
        "alias" in item.data &&
        item.data.alias !== undefined
      ) {
        const { targetValue, operator } = item.data;
        item.data = {
          uri: urisByAlias[item.data.alias],
          targetValue,
          operator,
        };
      }
    }
    // recursively update arrays
    else {
      replaceAliasesWithUris(item, urisByAlias);
    }
  });
  // There should no longer be any alias keys present in the conditions,
  // so we can safely move away from the draft state
  const processedConditions = conditions as ConditionsList;
  return processedConditions;
};

export const ConditionsHelper = {
  hasStickyParens,
  detachLeadingTrailingParens,
  parensAreBalanced,
  simplifyConditions,
  collectDependencies,
  formatConditionalExpression,
  isSingleConditionStr,
  concatConditions,
  parseAuthoredConditions,
  buildConditions,
  replaceAliasesWithUris,
};

// for Jest
module.exports = {
  ConditionsHelper,
};
