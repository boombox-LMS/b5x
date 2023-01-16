import React from "react";

export const HelpGetter = () => {
  // throwaway styles for demo, this content will eventually come from the author
  // and will not necessarily include an ordered list

  const liStyle = {
    marginBottom: "10px",
  };

  const olStyle = {
    paddingLeft: "17px",
  };

  return (
    <div>
      <p>Please follow these steps:</p>
      <ol style={olStyle}>
        <li style={liStyle}>
          Search the Slack channel{" "}
          <a href="https://www.google.com">#tech-onboarding</a> for your
          question to see whether it's already been answered.
        </li>
        <li style={liStyle}>
          If you can't find your question in the{" "}
          <a href="https://www.google.com">#tech-onboarding</a> channel, ask it
          there.
        </li>
        <li style={liStyle}>
          If no one in that channel is able to assist you, escalate by filing a
          ticket at{" "}
          <a href="https://www.google.com">go.cloudco.net/infrahelp</a>.
        </li>
      </ol>
    </div>
  );
};
