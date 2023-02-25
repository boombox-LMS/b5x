import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import { FiveStarInput } from "./partials/FiveStarInput";

export const FiveStarRating = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  let responseValue;
  if (!response || !response.value) {
    responseValue = 0;
  } else {
    responseValue = response.value;
  }

  const [localResponse, setLocalResponse] = useState(responseValue);

  const handleRatingChange = (value) => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value,
      status: "completed",
    });
    setLocalResponse(value);
  };

  return (
    <div>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      <FiveStarInput
        value={localResponse}
        onChangeCallback={handleRatingChange}
      />
    </div>
  );
};
