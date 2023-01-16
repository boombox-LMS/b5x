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

// TODO: Refactor, as this is very similar to the IssueReporter
// and some components can be pulled out/shared
export const FeedbackSubmitter = ({ formSubmitCallback }) => {
  const [priorityLevel, setPriorityLevel] = useState("");
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
      priorityLevel,
      title: issueTitle,
      reporterUrl: window.location.href,
    }).then(() => {
      setEditorState(() => {
        EditorState.createEmpty();
      });
      formSubmitCallback({
        resultStatus: "success",
        resultMessage: "Feedback submitted. Thank you!",
      });
    });
  };

  const handlePriorityLevelChange = (e) => {
    setPriorityLevel(e.target.value);
  };

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <TextField
          fullWidth
          label="Feedback title"
          size="small"
          placeholder="e.g., 'Idea for new topic'"
          value={issueTitle}
          onChange={(e) => {
            setIssueTitle(e.target.value);
          }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-label">Type</InputLabel>
          <Select
            MenuProps={{
              style: { zIndex: 2001 },
            }}
            labelId="feedback-priority-level"
            id="feedback-priority-level"
            value={priorityLevel}
            label="Type"
            onChange={handlePriorityLevelChange}
          >
            <MenuItem value={3}>
              Constructive: The experience should be improved.
            </MenuItem>
            <MenuItem value={4}>
              Idea: A topic idea, feature idea, etc.
            </MenuItem>
            <MenuItem value={5}>Kudos: Offering praise or thanks.</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div>
        <Editor
          editorState={editorState}
          editorStyle={{ height: "175px", paddingBottom: "10px" }}
          placeholder="Comments"
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
