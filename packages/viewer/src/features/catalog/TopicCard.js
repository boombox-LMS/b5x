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
import { TopicThumbnail } from "./TopicThumbnail";
import styled from "styled-components/macro";

const TopicCardWrapper = styled.div`
  border-radius: 5px;
  padding-bottom: 5px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
  position: relative;
  &:hover {
    transform: scale(1.03);
  }
`;

const TopicCardInfo = styled.div`
  padding: 12px;
  padding-top: 5px;
`;

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
    <TopicCardWrapper onClick={sendToTopicPage} className="topic-card">
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
      <TopicThumbnail topic={topic} />
      <TopicCardInfo>
        <div
          css={`
            margin-bottom: 4px;
          `}
        >
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
        <div>{topic.subtitle}</div>
      </TopicCardInfo>
    </TopicCardWrapper>
  );
};
