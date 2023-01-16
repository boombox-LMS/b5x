import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const BreakoutBox = ({ fragment, boxType }) => {
  const validBoxTypes = ["warning"];

  return (
    <div className={`breakout-box ${boxType}`}>
      {validBoxTypes.includes(boxType) && (
        <div className={`breakout-box__header ${boxType}`}>{boxType}</div>
      )}
      <div className={`breakout-box__contents ${boxType}`}>
        {fragment.children.map((childFragment) => {
          return <FragmentWrapper fragment={childFragment} />;
        })}
      </div>
    </div>
  );
};
