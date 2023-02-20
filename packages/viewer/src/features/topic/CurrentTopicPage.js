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

  // fetch topic
  const {
    data: topic,
    isLoading: topicIsLoading,
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
  if (topicIsLoading) {
    return null;
    // handle any errors
  } else if (topicHasError) {
    return (
      <div>
        <p>Topic Load Error: {JSON.stringify(topicError)}</p>
      </div>
    );
  }

  const DocumentWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
  `;

  const DocumentContent = styled.div`
    padding-top: 30px;
    max-width: 900px;
  `;

  let currentDocument;

  if (documentUri === "about") {
    currentDocument = <TopicDetails topic={topic} />;
  } else {
    currentDocument = <Document documentUri={documentUri} />;
  }

  return (
    <DocumentWrapper>
      <DocumentContent>{currentDocument}</DocumentContent>
    </DocumentWrapper>
  );
};
