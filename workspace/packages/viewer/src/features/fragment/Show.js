import React from "react";
import { FragmentWrapper } from "./FragmentWrapper";

/*
A show component is a visibility wrapper -- 
if its conditions pass, it just renders its children.
Eventually we might keep this fragment from reaching the client
by "unpacking" its children on the parser side, duplicating
the wrapper's conditions.
*/
export const Show = ({ fragment }) => {
  return (
    <>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
    </>
  );
};
