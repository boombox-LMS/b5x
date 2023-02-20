import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { api } from "../api/apiSlice";
import { selectEnv } from "../../envSlice";
import { Document } from "../document/Document";
import { TopicDetails } from "./TopicDetails";
import { setHeaderProps } from "../layout/header/headerSlice";
import styled from "styled-components/macro";

export const CurrentTopicPage = () => {
  const dispatch = useDispatch();

  // grab + convert params from URL
  let { topicUri, documentUri } = useParams();

  const env = useSelector(selectEnv);

  // fetch the enrollment for this topic
  const {
    data: enrollment,
    isLoading: enrollmentIsLoading,
    isSuccess: enrollmentLoadedSuccessfully,
    isError: enrollmentHasError,
    error: enrollmentError,
  } = api.endpoints.getEnrollment.useQuery(topicUri);

  // fetch topic
  const {
    data: topic,
    isLoading: topicIsLoading,
    isSuccess: topicLoadedSuccessfully,
    isError: topicHasError,
    error: topicError,
  } = api.endpoints.getTopicContents.useQuery(topicUri);

  useEffect(() => {
    let props = {
      isHidden: true,
    };
    if (topic) {
      props = {
        isHidden: false,
        isMinimized: false,
        title: topic.title,
      };
    }
    dispatch(setHeaderProps(props));
  }, [topic]);

  // TODO: update enrollment bookmark if the active document has changed

  // wait for everything above to finish loading
  if (topicIsLoading || enrollmentIsLoading) {
    return null;
    // handle any errors
  } else if (topicHasError || enrollmentHasError) {
    return (
      <div>
        <p>Topic Load Error: {JSON.stringify(topicError)}</p>
        <p>Enrollment Load Error: {JSON.stringify(enrollmentError)}</p>
      </div>
    );
  }

  let documentContent;

  if (documentUri === "about") {
    documentContent = (
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: center;
        `}
      >
        <div
          css={`
            padding-top: 30px;
            max-width: 900px;
          `}
        >
          <TopicDetails topic={topic} />
        </div>
      </div>
    );
  } else {
    documentContent = <Document documentUri={documentUri} />;
  }

  return (
    <div
      css={`
        width: 100%;
      `}
    >
      {documentContent}
    </div>
  );
};
