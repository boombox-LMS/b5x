import React from "react";

export const Tag = ({ tag, light, dark }) => {
  const tagStyle = {
    border: `1.5px solid ${dark}`,
    color: dark,
    backgroundColor: light,
    display: "inline-block",
    borderRadius: "3px",
    padding: "1px 6px",
    marginRight: "4px",
    marginBottom: "4px",
    fontSize: "0.9em",
    fontWeight: "500",
  };

  return <div style={tagStyle}>{tag}</div>;
};
