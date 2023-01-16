import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const Slide = ({ fragment }) => {
  return (
    <div>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper
            key={childFragment.uri}
            fragment={childFragment}
          ></FragmentWrapper>
        );
      })}
    </div>
  );
};
