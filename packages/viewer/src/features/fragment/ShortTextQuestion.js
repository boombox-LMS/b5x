import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import styled from "styled-components/macro";
import { themeSettings } from "../../theme/active-theme";

const ShortTextQuestionInput = styled.input`
  border: 1px solid ${themeSettings.grayPalette.light};
  outline: none;
  width: 100%;
  line-height: 30px;
  padding: 5px 10px;
  font-size: 1rem;
  &:focus {
    border: 1px solid ${themeSettings.muiPalette.primary};
  }
`;

const ShortTextQuestionSubmitPrompt = styled.div`
  position: absolute;
  font-size: 0.8rem;
  color: ${themeSettings.muiPalette.primary};
  font-style: italic;
  margin-top: -3px;
  ${(props) => !props.isShown && `display: none;`}
`;

export const ShortTextQuestion = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  let responseValue;
  if (response && response.value) {
    responseValue = response.value;
  } else {
    responseValue = "";
  }

  // make local copy of the response to manipulate until the user submits
  const [localResponse, setLocalResponse] = useState(responseValue);

  // pressing Enter submits the answer
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && localResponse.length > 0) {
      responseUpdateCallback({
        fragmentUri: fragment.uri,
        value: localResponse,
        status: "completed",
      });
      event.target.blur();
    }
  };

  const handleChange = (event) => {
    setLocalResponse(event.target.value);
  };

  return (
    <div className="stq">
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      <ShortTextQuestionInput
        type="text"
        value={localResponse}
        onKeyPress={handleKeyPress}
        onChange={handleChange}
      />
      <ShortTextQuestionSubmitPrompt isShown={localResponse !== responseValue}>
        Press Enter to submit
      </ShortTextQuestionSubmitPrompt>
    </div>
  );
};
