import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CytoscapeComponent from "react-cytoscapejs";
import Paper from "@mui/material/Paper";

const defaultLayout = {
  name: "grid",
  condense: true,
  padding: 0,
  spacingFactor: 2.1,
  position: function (node) {
    return {
      row: node.data("row"),
      col: node.data("col"),
    };
  },
};

const defaultStylesheet = [
  {
    selector: "node",
    style: {
      shape: "rectangle",
      padding: "3px",
      label: function (ele) {
        return ele.data("label") || "";
      },
      backgroundColor: "white",
      textMarginY: "-3px",
      fontSize: "8px",
      fontWeight: 500,
      borderOpacity: "0",
    },
  },
  {
    selector: "edge",
    style: {
      label: function (ele) {
        return ele.data("label");
      },
      textOutlineColor: "white",
      textOutlineWidth: "3px",
      curveStyle: "straight",
      sourceDistanceFromNode: "0px",
      targetDistanceFromNode: "0px",
      fontSize: "7.5px",
      width: "1.5px",
    },
  },
  {
    selector: ".node--text-only",
    style: {
      width: "label",
      textHalign: "center",
      textValign: "center",
    },
  },
  {
    selector: ".edge--source-arrow",
    style: {
      sourceArrowShape: "triangle",
      arrowScale: 0.8,
    },
  },
  {
    selector: ".edge--target-arrow",
    style: {
      targetArrowShape: "triangle",
      arrowScale: 0.8,
    },
  },
  {
    selector: ".edge--horizontal",
    style: {
      textMarginY: "-8px",
      textOutlineWidth: "0px",
    },
  },
];

const IMAGE_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp|svg)$/i;

export const Diagram = ({ fragment }) => {
  const { topicUri } = useParams();

  let { elements, stylesheet, layout } = JSON.parse(
    JSON.stringify(fragment.data)
  );
  stylesheet = defaultStylesheet.concat(stylesheet);

  // TODO: This is temporary, assets will be in an s3 bucket eventually
  // and the urls will be correct in the database
  /*
  stylesheet.forEach(entry => {
    console.log(entry)
    if (!entry.style.backgroundImage) {
      return
    }

    if (IMAGE_REGEX.test(entry.style.backgroundImage) && !/iconify/.test(entry.style.backgroundImage)) {
      entry.style.backgroundImage = 'http://localhost:8080/topic-assets/' + topicUri + '/images/' + entry.style.backgroundImage
    }
  })
  */

  if (!layout) {
    layout = defaultLayout;
  }

  const cyRef = useRef(null);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.userZoomingEnabled(false);
      cy.on("click", "node", function (evt) {
        console.log("Node clicked");
      });
    }
  }, [cyRef]);

  return (
    <Paper variant="outlined">
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
        }}
        stylesheet={stylesheet}
        elements={elements}
        style={{ width: "840px", height: "510px", marginBottom: "20px" }}
        layout={layout}
      />
    </Paper>
  );
};
