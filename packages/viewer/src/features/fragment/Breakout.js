import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const Breakout = ({ fragment }) => {
  return (
    <div className={`breakout-box`}>
      <div className={`breakout-box__header`}>{fragment.data.title}</div>
      <div className={`breakout-box__contents`}>
        {fragment.children.map((childFragment) => {
          return <FragmentWrapper fragment={childFragment} />;
        })}
      </div>
    </div>
  );
};
