import React from "react";
import { Tag } from "./Tag";

export const TagCloud = ({ tags }) => {
  const colorScheme = [
    // pale blue
    { light: "#e8f7ff", dark: "#015078" },
    // teal-ish blue
    { light: "#e3fcfc", dark: "#007073" },
    // pale green
    { light: "#dcfcef", dark: "#048551" },
    // lavender
    { light: "#f8edff", dark: "#47006e" },
    // pink
    { light: "#ffebf4", dark: "#9c0249" },
  ];
  return (
    <>
      {tags.map((tag, i) => {
        const colorIndex = Math.abs(i % colorScheme.length);
        const light = colorScheme[colorIndex].light;
        const dark = colorScheme[colorIndex].dark;
        return <Tag key={tag} tag={tag} light={light} dark={dark}></Tag>;
      })}
    </>
  );
};
