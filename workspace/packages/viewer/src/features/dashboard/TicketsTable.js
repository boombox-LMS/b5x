import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { EditorState, Editor, convertFromRaw } from "draft-js";
import { LoadingOutlined } from "@ant-design/icons";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import {
  useSetTicketStatusMutation,
  useSetTicketAssigneeMutation,
  useGetUserEmailsQuery,
} from "../api/apiSlice";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const RichTextDescription = ({ jsonDescription }) => {
  const contentState = convertFromRaw(jsonDescription);
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(contentState)
  );
  return (
    <>
      <Editor editorState={editorState} readOnly={true} />
    </>
  );
};

// TODO: Ticket assignment and ticket priority changes are both forcing a reload of all ticket data,
// instead of just the data for that specific ticket -- need to update the server endpoints / RTKQ caching
// in order to support individual ticket reloads by ticketId
const TicketAssignmentCell = ({
  ticketId,
  currentAssigneeEmail,
  contributorEmails,
}) => {
  // TODO: Figure out how to pull the potential assignees for each ticket
  // without having every row hit the server. We don't have topic user groups yet,
  // but once we do, the list of potential assignees can be pulled from the contributors etc.
  // In the short term, we could also just use a tech-learning-team group.
  const [value, setValue] = useState(currentAssigneeEmail || null);
  const [inputValue, setInputValue] = useState(currentAssigneeEmail || "");
  const [updateTicketAssignee, result] = useSetTicketAssigneeMutation();

  return (
    <>
      <Autocomplete
        size="small"
        disablePortal
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          updateTicketAssignee({ ticketId, assigneeEmail: newValue });
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id={`ticket-assignment-${ticketId}`}
        options={contributorEmails}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField size="small" {...params} />}
      />
    </>
  );
};

const TicketStatusCell = ({ ticketId, status }) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [updateTicketStatus, result] = useSetTicketStatusMutation();

  // TODO: Right now anyone can update the ticket status,
  // but really only the assignee should be able to do this
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    updateTicketStatus({ ticketId, status: e.target.value });
  };

  const availableStatuses = ["not started", "in progress", "resolved"];

  return (
    <>
      <FormControl fullWidth size="small">
        <Select
          MenuProps={{
            style: { zIndex: 2001 },
          }}
          id="ticket-status-select"
          value={currentStatus}
          onChange={handleStatusChange}
        >
          {availableStatuses.map((status) => {
            return (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </>
  );
};

export const TicketsTable = ({ tickets }) => {
  // This email fetch is a temporary solution just for mockup (see TODO inside TicketAssignmentCell)
  const {
    data: contributorEmails,
    isLoading: contributorEmailsAreLoading,
    isSuccess: contributorEmailsLoadedSuccessfully,
    isError,
    error,
  } = useGetUserEmailsQuery();

  if (contributorEmailsAreLoading) {
    return <LoadingOutlined />;
  } else if (isError) {
    return (
      <div>
        <p>Contributor emails load error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 90,
      valueGetter: (params) => {
        const issue = params.row;
        const createdAtDate = new Date(issue.createdAt);
        var dd = String(createdAtDate.getDate());
        var mm = String(createdAtDate.getMonth() + 1);
        var yyyy = createdAtDate.getFullYear();
        return mm + "/" + dd + "/" + yyyy;
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 180,
    },
    {
      field: "priorityLevel",
      headerName: "P level",
      width: 100,
    },
    {
      field: "description",
      headerName: "Description",
      width: 350,
      renderCell: (params) => {
        return <RichTextDescription jsonDescription={params.row.description} />;
      },
    },
    {
      field: "reporterUrl",
      headerName: "Reported from",
      width: 200,
      renderCell: (params) => {
        const ticket = params.row;
        return (
          <div style={{ overflowWrap: "break-word", maxWidth: "180px" }}>
            <a href={ticket.reporterUrl}>{ticket.reporterUrl}</a>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 155,
      renderCell: (params) => {
        const ticket = params.row;
        return <TicketStatusCell ticketId={ticket.id} status={ticket.status} />;
      },
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 240,
      renderCell: (params) => {
        const ticket = params.row;
        return (
          <TicketAssignmentCell
            ticketId={ticket.id}
            contributorEmails={contributorEmails}
            currentAssigneeEmail={ticket.assigneeEmail}
          />
        );
      },
    },
  ];

  return (
    <div style={{ height: 610 }}>
      <DataGrid
        rows={tickets}
        columns={columns}
        pageSize={7}
        getRowHeight={() => 71.5}
        rowsPerPageOptions={[7]}
        disableSelectionOnClick
      />
    </div>
  );
};
