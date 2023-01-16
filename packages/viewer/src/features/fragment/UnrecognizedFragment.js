import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

export const UnrecognizedFragment = ({ fragment }) => {
  return (
    <div style={{ border: "1px solid red", padding: "5px 10px" }}>
      <p>Unrecognized fragment: {fragment.contentType}</p>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
    </div>
  );
};
