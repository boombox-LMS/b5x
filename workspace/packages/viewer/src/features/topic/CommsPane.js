import React from "react";

export const CommsPane = ({ view }) => {
  let content;

  if (view === "messages") {
    content = <div>Messages will go here</div>;
  } else if (view === "highlights") {
    content = <div>Highlights will go here</div>;
  } else if (view === "announcements") {
    content = <div>Announcements will go here</div>;
  } else if (!view) {
    content = null;
  }

  return <div>{content}</div>;
};
