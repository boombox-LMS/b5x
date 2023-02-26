import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import { RtfInput } from "./partials/RtfInput";

export const LongTextQuestion = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  let rawContentState;
  if (response && response.value && response.value.rawContentState) {
    rawContentState = response.value.rawContentState;
  }

  const handleSubmit = (rawContentState) => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: { rawContentState },
      status: "completed",
    });
  };

  return (
    <div>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      <RtfInput
        rawContentState={rawContentState}
        submitCallback={handleSubmit}
      />
    </div>
  );
};
