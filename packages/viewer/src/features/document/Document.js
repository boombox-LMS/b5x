import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectEnv } from "../../envSlice";
import { api } from "../api/apiSlice";
import { FragmentWrapper } from "../fragment/FragmentWrapper";
import { DocumentDevTools } from "./DocumentDevTools";
import { LoadingOutlined } from "@ant-design/icons";
import DocumentHighlighter from "./DocumentHighlighter";

export const Document = ({ documentUri }) => {
  const env = useSelector(selectEnv);
  const documentRef = useRef();
  const [currentTextSelection, setCurrentTextSelection] = useState(null);

  useEffect(() => {
    if (!documentRef.current) {
      return;
    }

    const handleHighlightHover = (highlight) => {
      console.log("Hovered on", highlight);
    };

    const handleHighlightClick = (highlight) => {
      console.log("Clicked on", highlight);
    };

    const highlightableSpans =
      window.document.getElementsByClassName("highlightable");

    const highlighter = new DocumentHighlighter({
      highlightableSpans,
      handleHighlightHover,
      handleHighlightClick,
    });

    // TODO: If you click to select a word, then click to unselect it,
    // this function will hang on to the old text selection.
    // Apparently this is a known issue with workarounds.
    documentRef.current.addEventListener("mouseup", function (event) {
      const selection = window.getSelection();

      if (!selection.toString() || selection.toString().length === 0) {
        setCurrentTextSelection(null);
        return;
      }

      setCurrentTextSelection(selection);

      const newHighlight = highlighter.buildHighlight(selection);

      /*
      highlighter.applyHighlights({
        highlights: [newHighlight]
      })
      */
    });
  });

  // fetch contents
  const {
    data: document,
    isLoading: documentIsLoading,
    isSuccess: documentLoadedSuccessfully,
    isError: documentHasError,
    error: documentError,
  } = api.endpoints.getDocumentContents.useQuery(documentUri);

  // fetch responses -- will be used by fragments,
  // but we want to prevent fragments from even trying to render
  // if responses have not yet been fetched,
  // so we're running the request in the parent
  const {
    data: responses,
    isLoading: responsesAreLoading,
    isSuccess: responsesLoadedSuccessfully,
    isError: responsesHaveError,
    error: responsesError,
  } = api.endpoints.getResponses.useQuery(documentUri);

  if (documentIsLoading || responsesAreLoading) {
    return null;
  } else if (documentHasError || responsesHaveError) {
    if (documentError.status === 403) {
      return (
        <div className="document">
          <h1>Locked Document</h1>
          <p>
            Hmm, looks like you don't have permission to view this document
            quite yet.
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <p>Document load error: {JSON.stringify(documentError)}</p>
          <p>Responses load error: {JSON.stringify(responsesError)}</p>
        </div>
      );
    }
  }

  return (
    <div ref={documentRef} className="document">
      {env === "dev" && <DocumentDevTools />}
      <div>
        {document.fragments.map((fragment) => {
          return <FragmentWrapper key={fragment.uri} fragment={fragment} />;
        })}
      </div>
    </div>
  );
};
