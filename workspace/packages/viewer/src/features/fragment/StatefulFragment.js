import React from "react";
import { api } from "../api/apiSlice";
import { useParams } from "react-router-dom";
import { contentComponents } from "./ContentComponentManifest";
import { UnrecognizedFragment } from "./UnrecognizedFragment";

export const StatefulFragment = ({ fragment }) => {
  const { topicUri } = useParams();

  const { enrollmentId } = api.endpoints.getEnrollment.useQuery(topicUri, {
    selectFromResult: ({ data }) => ({
      enrollmentId: data.id,
    }),
  });

  let { response } = api.endpoints.getResponses.useQuery(fragment.documentUri, {
    selectFromResult: ({ data }) => {
      const responses = data;
      if (!responses) {
        return {
          response: { value: null },
        };
      }
      return {
        response: responses[fragment.uri],
      };
    },
  });

  const [responseUpdateTrigger, responseUpdateResult] =
    api.endpoints.createResponse.useMutation();

  if (!response) {
    response = { value: null };
  }

  const responseUpdateCallback = ({ fragmentUri, value, status }) => {
    responseUpdateTrigger({
      enrollmentId,
      fragmentUri,
      value,
      status: status || null,
    });
  };

  const ComponentName = contentComponents[fragment.contentType];
  if (contentComponents[fragment.contentType]) {
    return (
      <ComponentName
        fragment={fragment}
        response={response}
        enrollmentId={enrollmentId}
        responseUpdateCallback={responseUpdateCallback}
      />
    );
  } else {
    return <UnrecognizedFragment fragment={fragment} />;
  }
};
