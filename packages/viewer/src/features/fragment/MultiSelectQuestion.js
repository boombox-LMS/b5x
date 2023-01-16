import React, { useState } from "react";
import _ from "lodash";
import { FragmentWrapper } from "./FragmentWrapper";
import Button from "@mui/material/Button";

export const MultiSelectQuestion = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  const choices = fragment.data.choices;

  // If the user has never answered this question,
  // mark all options as unselected
  let responseValue;
  // TODO: Not sure where these null response values are coming from ...
  if (!response || !response.value) {
    responseValue = {};
    choices.forEach((choice) => {
      responseValue[choice.value] = false;
    });
  } else {
    responseValue = response.value;
  }

  const [localResponse, setLocalResponse] = useState(responseValue);

  // const [isCollapsed, setIsCollapsed] = useState(responseValue ? true : false)
  const isCollapsed = false;

  const handleOptionClick = (value) => {
    let newLocalResponse = JSON.parse(JSON.stringify(localResponse));
    newLocalResponse[value] = !newLocalResponse[value];
    setLocalResponse(newLocalResponse);
  };

  const handleSubmit = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: localResponse,
      status: "completed",
    });
  };

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
        if (localResponse[choice.value]) {
          classStr += " select-question__choice--active";
        } else {
          classStr += " select-question__choice--inactive";
        }

        return (
          <div
            key={choice.value}
            className={classStr}
            onClick={() => {
              handleOptionClick(choice.value);
            }}
          >
            {choice.contents}
          </div>
        );
      })}
      {JSON.stringify(localResponse) !== JSON.stringify(responseValue) && (
        <Button
          variant="contained"
          style={{ width: "100%", marginTop: "13px" }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      )}
    </div>
  );
};
