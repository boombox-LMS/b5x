import React from "react";
import { useSelector } from "react-redux";
import { api } from "../api/apiSlice";
import _ from "lodash";
import { selectEnv } from "../../envSlice";

export const HtmlContent = ({ fragment }) => {
  const env = useSelector(selectEnv);

  // AWKWARD: same logic used in fragment wrapper,
  // should maybe be passed into this component from there instead?
  let { dependencyResponseValuesByUri } =
    api.endpoints.getResponses.useQueryState(fragment.documentUri, {
      selectFromResult: ({ data }) => {
        const responses = data;
        if (!responses) {
          return {
            dependencyResponseValuesByUri: undefined,
          };
        }
        let dependencyResponseValuesByUri = {};
        fragment.dependencyUris.forEach((fragmentUri) => {
          if (responses[fragmentUri]) {
            dependencyResponseValuesByUri[fragmentUri] =
              responses[fragmentUri].value;
          }
        });
        return {
          dependencyResponseValuesByUri,
        };
      },
    });

  if (!fragment.data.isTemplated) {
    return <span dangerouslySetInnerHTML={{ __html: fragment.contents }} />;
  }

  // if the html has templated-value tags in it,
  // replace those with the actual values

  let contents = _.cloneDeep(fragment.contents);
  const valTagRegex = /<echo>(.*?)<\/echo>/g;

  if (!dependencyResponseValuesByUri) {
    return null;
  }

  let match;

  do {
    match = valTagRegex.exec(fragment.contents);
    if (match) {
      const fragmentAlias = match[1];
      const fragmentUri = fragment.data.fragmentUrisByAlias[fragmentAlias];
      const textToRemove = match[0];
      const response = dependencyResponseValuesByUri[fragmentUri];
      let value = textToRemove;
      if (response) {
        value = response;
      } else if (env === "dev") {
        value = fragmentUri;
      }
      if (env === "dev") {
        value = `<span class='dev-env-highlight'>${value}</span>`;
      }
      contents = contents.replace(textToRemove, value);
    }
  } while (match);

  return <span dangerouslySetInnerHTML={{ __html: contents }} />;
};
