import React, { useEffect } from "react";
import mermaid from "mermaid";
import { muiTheme } from "../../theme/active-theme";

const DEFAULT_CONFIG = {
  startOnLoad: true,
  theme: "default",
  themeVariables: {
    nodeBorder: muiTheme.palette.primary.main,
    mainBkg: "#f5f5f5",
    nodeTextColor: "black",
    fontFamily: "Arial",
    fontSize: "16px",
  },
  logLevel: "fatal",
  securityLevel: "strict",
  arrowMarkerAbsolute: false,
  flowchart: {
    htmlLabels: true,
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: true,
    rightAngles: false,
    showSequenceNumbers: false,
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    fontFamily: '"Open-Sans", "sans-serif"',
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
  },
};

export const MermaidDiagram = ({ fragment }) => {
  mermaid.initialize({ ...DEFAULT_CONFIG, ...fragment.data.config });

  useEffect(() => {
    mermaid.contentLoaded();
  }, [fragment.data.config]);

  if (!fragment.contents) return null;
  return <div className="mermaid">{fragment.contents}</div>;
};
