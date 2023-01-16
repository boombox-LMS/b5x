import { RawFragment, ConditionsList } from "@b5x/types";

export interface NewFragmentExcerpt
  extends Omit<
    RawFragment,
    | "uri"
    | "documentUri"
    | "childUris"
    | "isRequired"
    | "dependencyUris"
    | "displayConditions"
  > {
  digest: string;
}

export interface SavedFragmentExcerpt extends NewFragmentExcerpt {
  id: number;
}

export interface NewFragmentRef
  extends Omit<
    RawFragment,
    | "childUris"
    | "digest"
    | "contents"
    | "data"
    | "contentType"
    | "isStateful"
    | "dependencyUris"
    | "displayConditions"
  > {
  documentUri: string;
  fragmentExcerptId: number;
  dependencyUris: string; // Stringified JSON for proper db storage via Knex
  displayConditions: string; // Stringified JSON for proper db storage via Knex
  childUris: string; // Stringified JSON for proper db storage via Knex
}
