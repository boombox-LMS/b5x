import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { api } from "../api/apiSlice";
import { selectEnv } from "../../envSlice";
import { Document } from "../document/Document";
import { TableOfContents } from "./TableOfContents";
import { TopicDevTools } from "./TopicDevTools";
import { TopicDetails } from "./TopicDetails";
import { setHeaderProps } from "../layout/header/headerSlice";

export const TopicContents = () => {
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

  /*
  const handleScroll = (e) => {
    if (e.target.scrollTop > 100 && !headerIsMinimized) {
      setHeaderIsMinimized(true)
    } else if (e.target.scrollTop < 100 && headerIsMinimized) {
      setHeaderIsMinimized(false)
    }
  }
  */

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
      <div className="document">
        <TopicDetails topic={topic} />
      </div>
    );
  } else {
    documentContent = <Document documentUri={documentUri} />;
  }

  return (
    <>
      {env === "dev" && <TopicDevTools topicId={topic.id} />}
      <div className="header-spacer" />
      <div className="topic__grid">
        <div></div>
        <div className="topic__toc">
          <TableOfContents
            topic={topic}
            selectedDocumentUri={documentUri}
            documentStatus={enrollment.documentStatus}
            progressPercentage={enrollment.progressPercentage}
          />
        </div>
        <div className="topic__active-document">{documentContent}</div>
        <div></div>
      </div>
    </>
  );
};
