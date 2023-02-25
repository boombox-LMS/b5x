import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import styled from "styled-components/macro";

/*
.nps-question__selector {
  display: grid;
  margin-top: 12px;
  margin-bottom: 4px;
  grid-template-columns: repeat(11, 1fr);
}

.nps-question__option {
  border: 1.5px solid #e0e0e0;
  text-align: center;
  padding: 5px;
  margin-right: -1px;
}

.nps-question__option:last-of-type {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.nps-question__option:first-of-type {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.nps-question__option.nps-question__option--selected {
  background-color: var(--completed-light);
  border: 1.5px solid var(--completed-dark);
  color: var(--completed-dark);
  font-weight: bold;
  margin-right: 0px;
}

.nps-question__option--selected + .nps-question__option {
  margin-left: -1px;
  z-index: -1;
}
*/

const LegendLeftItem = styled.div`
  text-align: left;
`;

const LegendRightItem = styled.div`
  text-align: right;
`;

const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  font-size: 0.9em;
  font-style: italic;
`;

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
      <Legend>
        <LegendLeftItem>Not at all likely</LegendLeftItem>
        <LegendRightItem>Extremely likely</LegendRightItem>
      </Legend>
    </div>
  );
};
