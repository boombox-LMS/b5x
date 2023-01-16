import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import {
  InboxOutlined,
  HistoryOutlined,
  StarOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import GeoPattern from "geopattern";
import tinycolor from "tinycolor2";

const combineTwoShortestLines = (lines) => {
  let indexToCombineWithNextSibling = 0;
  let combinedLine = lines[0] + " " + lines[1];
  for (let i = 0; i < lines.length - 1; i++) {
    const thisCombinedLine = lines[i] + " " + lines[i + 1];
    if (thisCombinedLine.length < combinedLine.length) {
      combinedLine = thisCombinedLine;
      indexToCombineWithNextSibling = i;
    }
  }
  lines[indexToCombineWithNextSibling] = combinedLine;
  lines.splice(indexToCombineWithNextSibling + 1, 1);
  return lines;
};

const splitIntoThreeLines = (str) => {
  // split into words
  let lines = str.split(" ");
  while (lines.length > 3) {
    lines = combineTwoShortestLines(lines);
  }
  return lines;
};

const GeneratedTopicImage = ({ topic }) => {
  let title = topic.title;
  const geopattern = GeoPattern.generate(title);
  const titleColor = tinycolor(geopattern.color).lighten(30).toString();

  // get the max line length when the title is split into 3 lines
  const lines = splitIntoThreeLines(title);
  let maxLineLength;
  if (lines.length === 1) {
    maxLineLength = lines[0].length;
  } else {
    maxLineLength = lines.reduce((a, b) => {
      return a.length > b.length ? a.length : b.length;
    });
  }

  // the minimum font size
  let fontSize = 24;

  // don't attempt to display the title at all if it's too long
  if (maxLineLength > 11) {
    title = "";
    // otherwise, bump up the font size by max line length
  } else {
    fontSize = fontSize + 3.6 * (11 - maxLineLength);
  }

  // cap the font size for 3-line titles to ensure vertical fit
  if (lines.length === 3) {
    if (fontSize > 36) {
      fontSize = 36;
    }
  }

  const style = {
    height: "125px",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
    whiteSpace: "no-wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderRadius: "5px 5px 0px 0px",
    textAlign: "center",
    width: "250px",
    backgroundImage: geopattern.toDataUrl(),
    fontFamily: "Bungee Shade",
    color: titleColor,
    fontSize: `${fontSize}px`,
    lineHeight: "0.85em",
    padding: "10px",
  };

  return <div style={style}>{title}</div>;
};

export const TopicCard = ({ topic }) => {
  const navigate = useNavigate();

  const sendToTopicPage = () => {
    let topicUrl;
    // if documentation, route to first page regardless of user's history
    if (topic.contentMode === "documentation") {
      topicUrl = `/topics/${topic.uri}/documents/${topic.firstDocumentUri}`;
      // otherwise, check to see if the user has already started the topic,
      // and either drop them off at the last place they visited in their version of the topic,
      // or show them the topic home page so they can enroll
    } else if (topic.unmetPrerequisites.length > 0) {
      topicUrl = `/topics/${topic.slug}`;
    } else if (topic.currentDocumentUri) {
      topicUrl = `/topics/${topic.uri}/documents/${topic.currentDocumentUri}`;
    } else {
      topicUrl = `/topics/${topic.slug}`;
    }

    navigate(topicUrl);
  };

  // AWKWARD: This same data is also in the FilterButtonSet in Filter.js
  const icons = {
    priorityLevel: {
      recommended: StarOutlined,
      assigned: InboxOutlined,
    },
    completionStatus: {
      "in progress": HistoryOutlined,
      completed: CheckCircleOutlined,
    },
    // not actually in use yet
    contentType: {
      activity: BuildOutlined,
      document: FileTextOutlined,
    },
  };

  const CompletionStatusIcon = icons.completionStatus[topic.completionStatus];
  const PriorityLevelIcon = icons.priorityLevel[topic.priorityLevel];

  let indicatorBackgroundWidth = "double";
  if (!PriorityLevelIcon || !CompletionStatusIcon) {
    indicatorBackgroundWidth = "single";
  }

  return (
    <div className="topic-card" onClick={sendToTopicPage}>
      {(PriorityLevelIcon || CompletionStatusIcon) && (
        <>
          <div
            className={`topic-card__indicators-background topic-card__indicators-background--${indicatorBackgroundWidth}`}
          ></div>
          <div className="topic-card__indicators">
            {topic.priorityLevel !== "available" && (
              <div className="topic-card__priority-level-indicator">
                <Tooltip title={topic.priorityLevel} arrow placement="top">
                  <PriorityLevelIcon />
                </Tooltip>
              </div>
            )}

            {topic.completionStatus !== "not started" && (
              <div className="topic-card__completion-status-indicator">
                <Tooltip title={topic.completionStatus} arrow placement="top">
                  <CompletionStatusIcon />
                </Tooltip>
              </div>
            )}
          </div>
        </>
      )}
      {topic.coverImageUrl !== "" && (
        <img className="topic-card__cover-image" src={topic.coverImageUrl} />
      )}
      {topic.coverImageUrl === "" && <GeneratedTopicImage topic={topic} />}
      <div className="topic-card__info">
        <div className="topic-card__title">
          {topic.unmetPrerequisites.length > 0 && (
            <>
              <Tooltip title="Prerequisites not met" arrow placement="top">
                <span>
                  <FontAwesomeIcon icon={faLock} size="1x" />
                </span>
              </Tooltip>
              &nbsp;
            </>
          )}
          <strong>{topic.title}</strong>
        </div>
        <div className="topic-card__subtitle">{topic.subtitle}</div>
      </div>
    </div>
  );
};
