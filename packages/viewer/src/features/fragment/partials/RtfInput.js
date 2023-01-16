import React, { useState } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import Button from "@mui/material/Button";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import _ from "lodash";

/*
const contentState = convertFromRaw(jsonDescription)
const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState))
return <>
  <Editor
    editorState={editorState}
    readOnly={true}
  />
</>
*/

export const RtfInput = ({ rawContentState, submitCallback }) => {
  let initialEditorState;
  if (rawContentState) {
    initialEditorState = EditorState.createWithContent(
      convertFromRaw(rawContentState)
    );
  } else {
    initialEditorState = EditorState.createEmpty();
  }
  const [localEditorState, setLocalEditorState] = useState(initialEditorState);
  const [editorIsActive, setEditorIsActive] = useState(false);
  const [editorContentHasChanged, setEditorContentHasChanged] = useState(false);

  let toolbarStyle;
  if (editorIsActive) {
    toolbarStyle = {
      transition: "0.5s",
      height: "auto",
      marginBottom: "5px",
      opacity: "100%",
    };
  } else {
    toolbarStyle = {
      transition: "0s",
      height: "0px",
      opacity: "0%",
      marginBottom: "-5px",
    };
  }

  const handleSubmit = () => {
    const contentState = localEditorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    setEditorContentHasChanged(false);
    submitCallback(rawContentState);
  };

  const handleEditorStateChange = (newEditorState) => {
    const currentContent = localEditorState.getCurrentContent();
    const newContent = newEditorState.getCurrentContent();
    if (newContent !== currentContent) {
      setEditorContentHasChanged(true);
    }
    setLocalEditorState(newEditorState);
  };

  return (
    <>
      <div
        onFocus={() => {
          setEditorIsActive(true);
        }}
        onBlur={() => {
          setEditorIsActive(false);
        }}
      >
        <Editor
          editorState={localEditorState}
          onEditorStateChange={handleEditorStateChange}
          editorStyle={{ minHeight: "115px", paddingBottom: "10px" }}
          wrapperClassName="rtf-input__wrapper"
          editorClassName="rtf-input__editor"
          toolbarStyle={{ ...toolbarStyle, marginTop: "-12px" }}
          toolbar={{
            options: ["inline", "blockType", "link", "list"],
            inline: { options: ["bold", "italic", "underline", "monospace"] },
          }}
        />
      </div>
      <div style={{ marginTop: "5px" }}>
        {editorContentHasChanged && (
          <Button
            variant="contained"
            style={{ width: "100%", marginTop: "13px" }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        )}
      </div>
    </>
  );
};
