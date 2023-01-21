import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const Breakout = ({ fragment }) => {
  const style = {
    borderLeft: `3px solid ${fragment.data.color || "lightgray"}`,
  };
  return (
    <div className={`breakout-box`} style={style}>
      {fragment.data.icon && (
        <div className={`breakout-box__icon`}>
          <img src={fragment.data.icon} width="40px" height="auto" />
        </div>
      )}
      <div className={`breakout-box__header`}>{fragment.data.title}</div>
      <div className={`breakout-box__contents`}>
        {fragment.children.map((childFragment) => {
          return <FragmentWrapper fragment={childFragment} />;
        })}
      </div>
    </div>
  );
};
