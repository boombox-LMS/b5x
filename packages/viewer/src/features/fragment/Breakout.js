import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const Breakout = ({ fragment }) => {
  let style = {};
  if (fragment.data.color) {
    style = { borderLeft: `3px solid ${fragment.data.color}` };
  }

  const iconSizes = {
    small: "40px",
    medium: "52px",
    large: "65px",
  };

  return (
    <div className={`breakout-box`} style={style}>
      {fragment.data.icon && (
        <div className={`breakout-box__icon`}>
          <img
            src={fragment.data.icon}
            width={iconSizes[fragment.data.iconSize]}
            height="auto"
          />
        </div>
      )}
      <div className={`breakout-box__header`}>{fragment.data.title}</div>
      <div className={`breakout-box__contents`}>
        {fragment.children.map((childFragment) => {
          return (
            <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
          );
        })}
      </div>
    </div>
  );
};
