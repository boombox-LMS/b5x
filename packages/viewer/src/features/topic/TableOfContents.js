import React from "react";
import { DocumentNavTile } from "./DocumentNavTile";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { completedDark, lightGray } from "../../app/colors";
import styled from "styled-components/macro";
import { useParams } from "react-router-dom";
import { api } from "../api/apiSlice";

const CircularProgressBar = ({ progressPercentage }) => {
  if (progressPercentage === null) {
    return null;
  }

  let className;
  if (progressPercentage === 0) {
    className = "circular-progress-bar--zero";
  } else if (progressPercentage === 100) {
    className = "circular-progress-bar--one-hundred";
  }

  return (
    <div className={`circular-progress-bar ${className ? `${className}` : ""}`}>
      <CircularProgressbar
        value={progressPercentage}
        text={`${progressPercentage}%`}
        styles={buildStyles({
          // Rotation of path and trail, in number of turns (0-1)
          rotation: 0.25,

          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: "round",

          // Text size
          textSize: "28px",

          // How long animation takes to go from one percentage to another, in seconds
          pathTransitionDuration: 0.5,

          // Can specify path transition in more detail, or remove it entirely
          // pathTransition: 'none',

          // Colors
          pathColor: completedDark,
          textColor: "#222222",
          trailColor: lightGray,
          backgroundColor: "#3e98c7",
        })}
      />
    </div>
  );
};

export const TableOfContents = () => {
  // grab + convert params from URL
  let { topicUri, documentUri } = useParams();

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

  return (
    <div className="table-of-contents">
      <CircularProgressBar progressPercentage={enrollment.progressPercentage} />
      <DocumentNavTile
        document={{ title: "About this topic", uri: "about" }}
        topicContentMode={topic.config.contentMode}
        isSelected={"about" == documentUri}
        isLocked={false}
        isVisible={true}
        isCompleted={false}
      />
      {topic.documents.map((document) => {
        return (
          <DocumentNavTile
            key={document.uri}
            document={document}
            topicContentMode={topic.config.contentMode}
            isSelected={document.uri == documentUri}
            isLocked={enrollment.documentStatus[document.uri].isLocked}
            isVisible={enrollment.documentStatus[document.uri].isVisible}
            isCompleted={enrollment.documentStatus[document.uri].isCompleted}
          />
        );
      })}
    </div>
  );
};
