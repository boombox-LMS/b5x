import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import styled from "styled-components/macro";
import { muiTheme } from "../../theme/active-theme";

const Selector = styled.div`
  display: grid;
  margin-top: 12px;
  margin-bottom: 4px;
  grid-template-columns: repeat(11, 1fr);
`;

const Option = styled.div`
  position: relative;
  border: 1.5px solid ${muiTheme.palette.gray.light};
  text-align: center;
  padding: 5px;
  margin-right: -1px;
  ${(props) =>
    props.isSelected &&
    `background-color: ${muiTheme.palette.greenlit.light}; 
     border: 1.5px solid ${muiTheme.palette.greenlit.main}; 
     font-weight: bold;`}
  ${(props) => (props.isSelected ? `z-index: 1;` : `z-index: 0;`)}
  &:last-of-type {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  &:first-of-type {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
`;

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
      <Selector>
        {choices.map((value) => (
          <Option
            onClick={() => {
              handleSelection(value);
            }}
            key={value}
            isSelected={localResponse === value}
          >
            {value}
          </Option>
        ))}
      </Selector>
      <Legend>
        <LegendLeftItem>Not at all likely</LegendLeftItem>
        <LegendRightItem>Extremely likely</LegendRightItem>
      </Legend>
    </div>
  );
};
