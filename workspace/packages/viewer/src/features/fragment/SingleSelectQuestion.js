import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

export const SingleSelectQuestion = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  let responseValue;
  if (!response) {
    responseValue = {};
    choices.forEach((choice) => {
      responseValue[choice.value] = false;
    });
  } else {
    responseValue = response.value;
  }

  const [localResponse, setLocalResponse] = useState(responseValue);
  const [isCollapsed, setIsCollapsed] = useState(responseValue ? true : false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSelection = (value) => {
    setLocalResponse(value);
    toggleCollapse();
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value,
      status: "completed",
    });

    // AWKWARD: May not need this if optimistic updating is used on dispatch instead
  };

  const choices = fragment.data.choices;

  return (
    <div
      className={`select-question ${
        isCollapsed ? "select-question--collapsed" : ""
      }`}
    >
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      {choices.map((choice) => {
        let classStr = "select-question__choice";
        if (localResponse === choice.value) {
          classStr += " select-question__choice--active";
        } else {
          classStr += " select-question__choice--inactive";
        }

        return (
          <div
            key={choice.value}
            className={classStr}
            onClick={() => {
              handleSelection(choice.value);
            }}
          >
            {choice.contents}
            {isCollapsed && localResponse == choice.value && (
              <div style={{ float: "right" }} onClick={toggleCollapse}>
                <PlusOutlined />
              </div>
            )}
            {!isCollapsed && localResponse == choice.value && (
              <div style={{ float: "right" }} onClick={toggleCollapse}>
                <MinusOutlined />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
