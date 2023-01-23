import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const ContinueButton = ({
  fragment,
  fragmentRef,
  response,
  responseUpdateCallback,
}) => {
  const handleClick = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: true,
      status: "completed",
    });
  };

  let classStr = "continue-button";

  if (response && response.value) {
    classStr += " continue-button--active";
  }

  return (
    <div ref={fragmentRef} className={classStr} onClick={handleClick}>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
    </div>
  );
};
