import React from "react";
import GeoPattern from "geopattern";
import tinycolor from "tinycolor2";
import styled from "styled-components/macro";

const combineTwoShortestLines = (lines) => {
  let indexToCombineWithNextSibling = 0;
  let combinedLine = lines[0] + " " + lines[1];
  for (let i = 0; i < lines.length - 1; i++) {
    const thisCombinedLine = lines[i] + " " + lines[i + 1];
    if (thisCombinedLine.length < combinedLine.length) {
      combinedLine = thisCombinedLine;
      indexToCombineWithNextSibling = i;
    }
  }
  lines[indexToCombineWithNextSibling] = combinedLine;
  lines.splice(indexToCombineWithNextSibling + 1, 1);
  return lines;
};

const splitIntoThreeLines = (str) => {
  // split into words
  let lines = str.split(" ");
  while (lines.length > 3) {
    lines = combineTwoShortestLines(lines);
  }
  return lines;
};

const GeneratedTopicImage = ({ topic }) => {
  let title = topic.title;
  const geopattern = GeoPattern.generate(title);
  const titleColor = tinycolor(geopattern.color).lighten(30).toString();

  // get the max line length when the title is split into 3 lines
  const lines = splitIntoThreeLines(title);
  let maxLineLength;
  if (lines.length === 1) {
    maxLineLength = lines[0].length;
  } else {
    maxLineLength = lines.reduce((a, b) => {
      return a.length > b.length ? a.length : b.length;
    });
  }

  // the minimum font size
  let fontSize = 24;

  // don't attempt to display the title at all if it's too long
  if (maxLineLength > 11) {
    title = "";
    // otherwise, bump up the font size by max line length
  } else {
    fontSize = fontSize + 3.6 * (11 - maxLineLength);
  }

  // cap the font size for 3-line titles to ensure vertical fit
  if (lines.length === 3) {
    if (fontSize > 36) {
      fontSize = 36;
    }
  }

  const style = {
    height: "179.5px",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
    whiteSpace: "no-wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    borderRadius: "5px 5px 0px 0px",
    textAlign: "center",
    width: "100%",
    backgroundImage: geopattern.toDataUrl(),
    fontFamily: "Bungee Shade",
    color: titleColor,
    fontSize: `${fontSize}px`,
    lineHeight: "0.85em",
    padding: "10px",
    marginBottom: "8px",
  };

  return <div style={style}>{title}</div>;
};

const TopicCardThumbnailImage = styled.img`
  border-radius: 5px 5px 0px 0px;
`;

export const TopicThumbnail = ({ topic }) => {
  if (topic.coverImageUrl) {
    return <TopicCardThumbnailImage src={topic.coverImageUrl} />;
  } else {
    return <GeneratedTopicImage topic={topic} />;
  }
};
