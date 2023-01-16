import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const NpsQuestion = ({ fragment, response, responseUpdateCallback }) => {
  let responseValue;
  if (!response) {
    responseValue = null;
  } else {
    responseValue = response.value;
  }

  const [localResponse, setLocalResponse] = useState(responseValue);

  const handleSelection = (value) => {
    setLocalResponse(value);
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value,
      status: "completed",
    });
  };

  const choices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      <div className="nps-question__selector">
        {choices.map((value) => (
          <div
            onClick={() => {
              handleSelection(value);
            }}
            key={value}
            className={`nps-question__option ${
              value === localResponse ? "nps-question__option--selected" : ""
            }`}
          >
            {value}
          </div>
        ))}
      </div>
      <div className="nps-question__legend">
        <div className="nps-question__legend--left">Not at all likely</div>
        <div className="nps-question__legend--right">Extremely likely</div>
      </div>
    </div>
  );
};
