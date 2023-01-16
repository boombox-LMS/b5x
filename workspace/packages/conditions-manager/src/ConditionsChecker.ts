import {
  Condition,
  ConditionsList,
  ConditionConjunction,
  UserResponse,
} from "@b5x/types";

import { RawDraftContentState } from "draft-js";

/**
 *  The ConditionsChecker is responsible for determining
 *  whether the responses of a given user have met
 *  a given set of conditions. This is generally used to determine
 *  whether a user should be allowed to view a given piece of content,
 *  whether the user has completed a given document, etc.
 *
 *  @example
 *  import { ConditionsChecker } from '@b5x/conditions-manager';
 *
 *  const responsesByFragmentUri = { 'user-name': 'Jen' };
 *  const conditionsChecker = new ConditionsChecker({ responsesByFragmentUri });
 *  const conditionsAreMet = conditionsChecker.conditionsAreMet({
 *    type: 'condition',
 *    data: {
 *      uri: 'user-name',
 *      operator: 'is',
 *      targetValue: 'Jen'
 *    }
 *  })
 *  // => true
 */
export class ConditionsChecker {
  // TODO: It's awkward/confusing that these are actually just response VALUES by fragment uri.
  // Not sure if the CC should be adjusted, or the arg should be renamed?
  responsesByFragmentUri: Record<string, UserResponse>;

  constructor(params: {
    responsesByFragmentUri: Record<string, UserResponse>;
  }) {
    this.responsesByFragmentUri = params.responsesByFragmentUri;
  }

  conditionsAreMet(params: { conditionsData: ConditionsList }): boolean {
    const { conditionsData } = params;

    // BASE CASE 1: conditions are empty
    if (Array.isArray(conditionsData) && conditionsData.length === 0) {
      return true;
    }

    // BASE CASE 2: is a single condition object
    if (!Array.isArray(conditionsData)) {
      return this.#singleConditionIsMet({ conditionsData });
    }

    let bools: boolean[] = [];
    // TODO: Replace hardcoded conjunctions with a type
    let conjunction: "and" | "or" | null = null;

    // RECURSIVE CASE 1: is an array of a single (possibly complex) condition
    if (Array.isArray(conditionsData) && conditionsData.length === 1) {
      // @ts-ignore, TODO: Make the conditions types less blurry so TS is happy
      return this.conditionsAreMet({ conditionsData: conditionsData[0] });
    }
    // RECURSIVE CASE 2: is a complex condition of 'ands' -- ALL bools must be true
    else if (
      // @ts-ignore
      conditionsData.map((item) => item.data).includes("and")
    ) {
      conjunction = "and";
    }
    // RECURSIVE CASE 3: is a complex condition of 'ors' -- only ONE bool must be true
    else if (
      // @ts-ignore
      conditionsData.map((item) => item.data).includes("or")
    ) {
      conjunction = "or";
    } else {
      throw (
        "Unrecognized conjunction in condition " +
        JSON.stringify(conditionsData)
      );
    }

    for (let i = 0; i < conditionsData.length; i++) {
      const conditionComponent = conditionsData[i];
      // skip the conjunction, we already know what it is
      if (
        "type" in conditionComponent &&
        conditionComponent.type === "conjunction"
      ) {
        continue;
      }
      // @ts-ignore
      bools.push(this.conditionsAreMet({ conditionsData: conditionComponent }));
    }

    if (conjunction === "and") {
      // if even one false appears, conditions have not been met
      return !bools.includes(false);
    } else if (conjunction === "or") {
      // only one true needed in 'or' conditions
      return bools.includes(true);
    }

    throw "Conditions checker could not determine a result.";
  }

  #convertRawContentStateToText(rawContentState: RawDraftContentState) {
    const blocks = rawContentState.blocks;
    const mappedBlocks = blocks.map(
      (block) => (!block.text.trim() && "\n") || block.text
    );
    let textContents = "";
    for (let i = 0; i < mappedBlocks.length; i++) {
      const block = mappedBlocks[i];

      // handle last block
      if (i === mappedBlocks.length - 1) {
        textContents += block;
      } else {
        // otherwise we join with \n, except if the block is already a \n
        if (block === "\n") textContents += block;
        else textContents += block + "\n";
      }
    }
    return textContents;
  }

  /**
   *  Determines when a single condition is met by
   *  comparing the condition's target value
   *  with the user-inputted value.
   */
  #singleConditionIsMet(params: { conditionsData: Condition }) {
    const { uri, operator, targetValue } = params.conditionsData.data;
    let response = this.responsesByFragmentUri[uri];

    if (!response) {
      return false;
    }

    let value = response.value;
    let status = response.status;

    // parse RTF to plain text
    if (typeof value === "object" && "rawContentState" in value) {
      value = this.#convertRawContentStateToText(value.rawContentState);
    }

    switch (operator) {
      // choice value match for selects
      case "is":
        return value === targetValue;
      case "is-not":
        return value !== targetValue;
      // string match for text fields
      case "status-is":
        return status === targetValue;
      case "selections-include":
        return value[targetValue] === true;
      case "selections-do-not-include":
        return value[targetValue] === false;
      case "matches":
        if (typeof targetValue === "string") {
          const regex = this.#buildRegex(targetValue);
          const matchResult = value.match(regex);
          return !!matchResult; // false if no match, true if match
        } else {
          throw `Invalid targetValue provided to the 'matches' operator: ${targetValue}`;
        }
      default:
        throw (
          "Unrecognized operator in condition " +
          JSON.stringify(params.conditionsData)
        );
    }
  }

  /**
   *  Converts the string representation of a regex
   *  (which is how target regexes are stored on disk)
   *  to an actual JavaScript regex.
   *
   *  @example
   *  #buildRegex('/dog/g')
   */
  #buildRegex(userRegex: string) {
    // TODO: regex will likely need to get better,
    // but this will cover most use cases
    const regexForRegexes = new RegExp("/(.*)/([gmiyus]*)");

    const match = userRegex.match(regexForRegexes);

    if (!match) {
      return new RegExp(userRegex);
    }

    const body = match[1];
    const flags = match[2];

    // TODO: Validate flags?
    return new RegExp(body, flags);
  }
}
