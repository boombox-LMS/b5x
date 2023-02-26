import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { completedLight, completedDark, lightGray } from "../../app/colors";

export const DocumentNavTile = ({
  topicContentMode,
  isSelected,
  isLocked,
  isVisible,
  isCompleted,
  document,
}) => {
  let { topicUri } = useParams();

  if (!isVisible) {
    return null;
  }

  let icon;
  let content = (
    <Link
      style={{ color: "black" }}
      to={`/topics/${topicUri}/documents/${document.uri}`}
    >
      <div style={{ width: "100%", height: "100%", display: "block" }}>
        {document.title}
      </div>
    </Link>
  );

  const iconStyle = {
    width: "20px",
    display: "inline-block",
    verticalAlign: "top",
    marginRight: "4px",
    paddingTop: "10px",
  };

  if (isLocked) {
    content = document.title;
    icon = <FontAwesomeIcon icon={faLock} size="1x" />;
  } else if (isCompleted) {
    icon = <FontAwesomeIcon icon={faCheck} size="1x" />;
    iconStyle.color = completedDark;
  }

  let wrapperStyle = {
    paddingLeft: "10px",
    paddingRight: "10px",
    cursor: "pointer",
  };

  let documentTitleStyle = {
    display: "inline-block",
    verticalAlign: "top",
    maxWidth: "240px",
    paddingTop: "10px",
    paddingBottom: "10px",
  };

  if (isSelected) {
    wrapperStyle.backgroundColor = lightGray;
    wrapperStyle.fontWeight = "bold";
  }

  if (isLocked) {
    wrapperStyle.cursor = "not-allowed";
  }

  return (
    <div style={wrapperStyle} className="document-nav-tile">
      {topicContentMode === "tutorial" && <div style={iconStyle}>{icon}</div>}
      <div style={documentTitleStyle}>{content}</div>
    </div>
  );
};
