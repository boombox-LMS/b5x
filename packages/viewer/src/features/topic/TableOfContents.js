import React from "react";
import { DocumentNavTile } from "./DocumentNavTile";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { completedDark, lightGray } from "../../app/colors";

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

export const TableOfContents = ({
  topic,
  selectedDocumentUri,
  documentStatus,
  progressPercentage,
}) => {
  return (
    <div className="table-of-contents">
      <CircularProgressBar progressPercentage={progressPercentage} />
      <DocumentNavTile
        document={{ title: "About this topic", uri: "about" }}
        topicContentMode={topic.config.contentMode}
        isSelected={"about" == selectedDocumentUri}
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
            isSelected={document.uri == selectedDocumentUri}
            isLocked={documentStatus[document.uri].isLocked}
            isVisible={documentStatus[document.uri].isVisible}
            isCompleted={documentStatus[document.uri].isCompleted}
          />
        );
      })}
    </div>
  );
};
