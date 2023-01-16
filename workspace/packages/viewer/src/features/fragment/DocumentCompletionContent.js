import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/apiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { TopicCompletionContent } from "./TopicCompletionContent";

const NextButton = ({ topicUri, nextVisibleDocumentUri }) => {
  const buildNextButtonClassStr = ({ isHovered }) => {
    let classStr = "next-button__button";
    if (isHovered) {
      classStr += " next-button__button--active";
    }
    return classStr;
  };

  const [nextButtonClassStr, setNextButtonClassStr] = useState(
    buildNextButtonClassStr({ isHovered: false })
  );

  return (
    <Link to={`/topics/${topicUri}/documents/${nextVisibleDocumentUri}`}>
      <span
        className={nextButtonClassStr}
        onMouseEnter={() =>
          setNextButtonClassStr(buildNextButtonClassStr({ isHovered: true }))
        }
        onMouseLeave={() =>
          setNextButtonClassStr(buildNextButtonClassStr({ isHovered: false }))
        }
      >
        <FontAwesomeIcon icon={faArrowRight} size="1x" />
      </span>
    </Link>
  );
};

export const DocumentCompletionContent = () => {
  // if there is not already a completion for this document, submit one,
  // and reload the enrollment
  const { topicUri, documentUri } = useParams();

  const { nextVisibleDocumentUri, documentIsMarkedCompleted } =
    api.endpoints.getEnrollment.useQueryState(topicUri, {
      selectFromResult: ({ data }) => {
        const enrollment = data;
        return {
          nextVisibleDocumentUri:
            enrollment.documentStatus[documentUri].nextVisibleDocumentUri,
          documentIsMarkedCompleted:
            enrollment.documentStatus[documentUri].isCompleted,
        };
      },
    });

  const [verifyDocumentCompletionTrigger, documentCompletionMutationStatus] =
    api.endpoints.verifyDocumentCompletion.useMutation();

  const { ref: inViewRef, inView, entry } = useInView();

  // Since this is the last element in any document: if its bottom div is visible in the viewport,
  // and the document is not marked completed, it should be marked completed
  // unless someone is doing something weird and manipulative on the client side.
  // Just in case, verify with the server to ensure that all required responses (if any) are present,
  // then re-fetch the enrollment since the document status will have changed.

  useEffect(() => {
    if (inView && !documentIsMarkedCompleted) {
      verifyDocumentCompletionTrigger(documentUri);
    }
  }, [inView, documentIsMarkedCompleted]);

  let content;

  if (nextVisibleDocumentUri) {
    content = (
      <NextButton
        topicUri={topicUri}
        nextVisibleDocumentUri={nextVisibleDocumentUri}
      />
    );
  } else {
    content = <TopicCompletionContent topicUri={topicUri} />;
  }

  return (
    <div className="document-completion-content">
      {content}
      <div ref={inViewRef}></div>
    </div>
  );
};
