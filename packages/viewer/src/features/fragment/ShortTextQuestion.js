import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";

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
      <input
        type="text"
        value={localResponse}
        onKeyPress={handleKeyPress}
        onChange={handleChange}
      />
      {localResponse !== responseValue && (
        <div className="short-text-question__enter-prompt short-text-question__enter-prompt--visible">
          Press Enter to submit
        </div>
      )}
      {localResponse === responseValue && (
        <div className="short-text-question__enter-prompt short-text-question__enter-prompt--hidden"></div>
      )}
    </div>
  );
};
