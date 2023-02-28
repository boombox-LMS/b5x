import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { InboxOutlined, StarOutlined } from "@ant-design/icons";
import { TopicThumbnail } from "./TopicThumbnail";
import styled from "styled-components/macro";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { muiTheme } from "../../theme";

const PriorityLevelRibbon = styled.div`
  --f: 7px; /* control the folded part*/
  --r: 3px; /* control the ribbon shape */
  --t: 10px; /* the top offset */

  position: absolute;
  font-size: 1.3em;
  inset: var(--t) calc(-1 * var(--f)) auto auto;
  padding: 0 10px var(--f) calc(10px + var(--r));
  clip-path: polygon(
    0 0,
    100% 0,
    100% calc(100% - var(--f)),
    calc(100% - var(--f)) 100%,
    calc(100% - var(--f)) calc(100% - var(--f)),
    0 calc(100% - var(--f)),
    var(--r) calc(50% - var(--f) / 2)
  );
  background: ${muiTheme.palette.secondary.main};
  color: white;
  box-shadow: 0 calc(-1 * var(--f)) 0 inset #0005;
`;

const PriorityLevelIconWrapper = styled.div`
  padding-top: 2px;
  padding-bottom: 2px;
  margin-left: -2px;
`;

const TopicCardWrapper = styled.div`
  border-radius: 5px;
  isolation: isolate;
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

const EmptyProgressBar = styled.div`
  height: 7px;
  background-color: ${muiTheme.palette.gray.light};
  margin-top: -8px;
  z-index: 2;
  position: relative;
`;

const TopicProgressBar = ({ progressPercentage }) => {
  if (progressPercentage > 0) {
    return (
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          padding: "0px",
          marginTop: "-8px",
          height: "7px",
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: muiTheme.palette.gray.light,
          },
          [`& .${linearProgressClasses.bar}`]: {
            backgroundColor: muiTheme.palette.greenlit.medium,
          },
        }}
      />
    );
  } else if (progressPercentage === 0) {
    return <EmptyProgressBar />;
  }
};

const PriorityLevelIndicator = ({ priorityLevel }) => {
  // AWKWARD: This same data is also in the FilterButtonSet in Filter.js ...
  // move to the theme?
  const icons = {
    priorityLevel: {
      recommended: StarOutlined,
      assigned: InboxOutlined,
    },
  };

  const PriorityLevelIcon = icons.priorityLevel[priorityLevel];

  return (
    <Tooltip title={priorityLevel} arrow placement="top">
      <PriorityLevelRibbon>
        <PriorityLevelIconWrapper>
          <PriorityLevelIcon />
        </PriorityLevelIconWrapper>
      </PriorityLevelRibbon>
    </Tooltip>
  );
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

  return (
    <TopicCardWrapper onClick={sendToTopicPage} className="topic-card">
      {topic.priorityLevel !== "available" && (
        <PriorityLevelIndicator priorityLevel={topic.priorityLevel} />
      )}
      <TopicThumbnail topic={topic} />
      <TopicProgressBar progressPercentage={topic.progressPercentage} />
      <TopicCardInfo>
        <div
          css={`
            margin-bottom: 4px;
            margin-top: 6px;
          `}
        >
          {topic.unmetPrerequisites.length > 0 && (
            <>
              <Tooltip title="Prerequisites not met" arrow placement="top">
                <div style={{ display: "inline", marginRight: "4px" }}>
                  <FontAwesomeIcon icon={faLock} size="1x" />
                </div>
              </Tooltip>
              &nbsp;
            </>
          )}
          <strong>{topic.title}</strong>
        </div>
        <div
          css={`
            margin-top: -3px;
          `}
        >
          {topic.subtitle}
        </div>
      </TopicCardInfo>
    </TopicCardWrapper>
  );
};
