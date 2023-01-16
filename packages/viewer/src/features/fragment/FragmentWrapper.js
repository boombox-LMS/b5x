import React, { useRef, useEffect, useLayoutEffect } from "react";
import { ConditionsChecker } from "@b5x/conditions-manager";
import { api } from "../api/apiSlice";

// import wrapper for stateful fragment types
import { StatefulFragment } from "./StatefulFragment";
import { contentComponents } from "./ContentComponentManifest";
import { UnrecognizedFragment } from "./UnrecognizedFragment";

export const FragmentWrapper = ({ fragment }) => {
  // AWKWARD: same logic also used in templated html content
  let { dependencyResponsesByUri } = api.endpoints.getResponses.useQuery(
    fragment.documentUri,
    {
      selectFromResult: ({ data }) => {
        const responses = data;

        if (!responses) {
          return {
            dependencyResponsesByUri: undefined,
          };
        }

        let dependencyResponsesByUri = {};
        fragment.dependencyUris.forEach((fragmentUri) => {
          if (responses[fragmentUri]) {
            dependencyResponsesByUri[fragmentUri] = responses[fragmentUri];
          }
        });
        return {
          dependencyResponsesByUri,
        };
      },
    }
  );

  if (!dependencyResponsesByUri) {
    return null;
  }

  // check conditions for fragment visibility
  const conditionsChecker = new ConditionsChecker({
    responsesByFragmentUri: dependencyResponsesByUri,
  });
  const showFragment = conditionsChecker.conditionsAreMet({
    conditionsData: fragment.displayConditions,
  });

  // if fragment should not be visible, return nothing
  if (!showFragment) {
    return null;
  }

  // pass stateful fragments to their own wrapper
  if (fragment.isStateful) {
    return <StatefulFragment fragment={fragment} />;
  }

  // otherwise, render the fragment
  const ComponentName = contentComponents[fragment.contentType];
  let content;

  if (ComponentName) {
    content = <ComponentName fragment={fragment} />;
  } else {
    content = <UnrecognizedFragment fragment={fragment} />;
  }

  return <>{content}</>;
};
