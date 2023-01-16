import React, { useState } from "react";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useCreateTicketMutation } from "../api/apiSlice";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

export const IssueReporter = ({ formSubmitCallback }) => {
  const [issueSeverity, setIssueSeverity] = useState("");
  const [issueTitle, setIssueTitle] = useState("");

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [editorIsActive, setEditorIsActive] = useState(false);

  const [submitIssue, result] = useCreateTicketMutation();

  // TODO: Handle submission failure,
  // right now we show the success message regardless
  const handleFormSubmit = () => {
    const contentState = editorState.getCurrentContent();
    const description = convertToRaw(contentState);
    submitIssue({
      description,
      priorityLevel: issueSeverity,
      title: issueTitle,
      reporterUrl: window.location.href,
    }).then(() => {
      setEditorState(() => {
        EditorState.createEmpty();
      });
      formSubmitCallback({
        resultStatus: "success",
        resultMessage: "Issue submitted. Thank you!",
      });
    });
  };

  const handleSeverityChange = (e) => {
    setIssueSeverity(e.target.value);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <TextField
          fullWidth
          label="Issue title"
          size="small"
          placeholder="e.g., 'Broken link'"
          value={issueTitle}
          onChange={(e) => {
            setIssueTitle(e.target.value);
          }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <FormControl fullWidth size="small">
          <InputLabel id="issue-severity-select-label">Severity</InputLabel>
          <Select
            MenuProps={{
              style: { zIndex: 2001 },
            }}
            labelId="issue-severity-select-label"
            id="issue-severity-select"
            value={issueSeverity}
            label="Severity"
            onChange={handleSeverityChange}
          >
            <MenuItem value={0}>Blocker: Progress is impossible.</MenuItem>
            <MenuItem value={1}>Major: Progress is slowed.</MenuItem>
            <MenuItem value={2}>
              Minor: There's a typo or other small flaw.
            </MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <Editor
          editorState={editorState}
          editorStyle={{ height: "175px", paddingBottom: "10px" }}
          placeholder="Detailed description"
          onEditorStateChange={setEditorState}
          wrapperClassName="rtf-input__wrapper"
          editorClassName="rtf-input__editor"
          toolbarOnFocus={false}
          toolbarStyle={{}}
          toolbar={{
            options: ["blockType", "link", "inline", "list"],
            inline: { options: ["bold", "italic", "underline", "monospace"] },
            list: { inDropdown: true },
          }}
        />
      </div>

      <div style={{ marginTop: "15px" }}>
        <Button
          variant="contained"
          style={{ width: "100%" }}
          onClick={handleFormSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};
