import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "../api/apiSlice";
import { CsvUploader } from "./CsvUploader";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { setHeaderProps } from "../header/headerSlice";

const UserModificationPreview = ({ rows }) => {
  const columns = [
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "addToGroups",
      headerName: "add to groups",
      width: 250,
      renderCell: (params) => {
        const user = params.row;
        return (
          <ul style={{ listStylePosition: "inside", paddingLeft: "0px" }}>
            {user.addToGroups.map((groupName) => {
              return <li key={groupName}>{groupName}</li>;
            })}
          </ul>
        );
      },
    },
    {
      field: "removeFromGroups",
      headerName: "remove from groups",
      width: 250,
      renderCell: (params) => {
        const user = params.row;
        return (
          <ul style={{ listStylePosition: "inside", paddingLeft: "0px" }}>
            {user.removeFromGroups.map((groupName) => {
              return <li key={groupName}>{groupName}</li>;
            })}
          </ul>
        );
      },
    },
  ];

  return (
    <div style={{ height: 680 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={7}
        getRowHeight={() => "auto"}
        rowsPerPageOptions={[7]}
        disableSelectionOnClick
      />
    </div>
  );
};

export const ControlPanel = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "Admin control panel",
        currentPage: "Control panel",
      })
    );
  }, []);

  const [csvUploadResult, setCsvUploadResult] = React.useState(null);
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");

  const [modifyUserGroupsTrigger, modifyUserGroupsResult] =
    api.endpoints.modifyUserGroups.useMutation();

  const modifyUserGroups = () => {
    modifyUserGroupsTrigger({
      users: csvUploadResult,
    }).then((res) => {
      setCsvUploadResult(null);
      setSnackbarSeverity("success");
      setSnackbarMessage("User groups modified successfully");
      setShowSnackbar(true);
    });
  };

  const resetSnackbar = () => {
    setShowSnackbar(false);
    setSnackbarMessage("");
    setSnackbarSeverity("success");
  };

  const handleCsvUpload = (rows) => {
    rows.forEach((row, i) => {
      row.id = i; // AWKWARD: just for DataGrid purposes -- should maybe use getRowID within DataGrid instead?
      if (!row.addToGroups || row.addToGroups === "") {
        row.addToGroups = [];
      } else {
        row.addToGroups = row.addToGroups.replace(/\s/g, "").split(",");
      }
      if (!row.removeFromGroups || row.removeFromGroups === "") {
        row.removeFromGroups = [];
      } else {
        row.removeFromGroups = row.removeFromGroups
          .replace(/\s/g, "")
          .split(",");
      }
    });
    setCsvUploadResult(rows);
  };

  return (
    <div style={{ padding: "25px 40px" }}>
      <h1>Batch-modify user groups</h1>
      <p>Your CSV must have the following columns: </p>
      <ul>
        <li>
          <code>email</code>
        </li>
        <li>
          <code>add to groups</code> and/or <code>remove from groups</code>,
          containing a comma-separated list of groups (e.g., "tech-managers,
          data-org-members, tech-employees")
        </li>
      </ul>
      <p>
        Only the above three columns will be processed. Additional columns are
        allowed but will be ignored.
      </p>
      {!csvUploadResult && (
        <CsvUploader
          handleUpload={(rows) => {
            handleCsvUpload(rows);
          }}
        />
      )}
      {csvUploadResult && (
        <div>
          <Button
            variant="contained"
            sx={{ width: "49%" }}
            onClick={modifyUserGroups}
          >
            Submit changes below
          </Button>
          <div style={{ display: "inline-block", width: "2%" }}></div>
          <Button
            variant="outlined"
            sx={{ width: "49%" }}
            onClick={() => {
              setCsvUploadResult(null);
            }}
          >
            Cancel changes below
          </Button>

          <div style={{ marginTop: "15px", marginBottom: "15px" }}>
            <UserModificationPreview rows={csvUploadResult} />
          </div>

          <Button
            variant="contained"
            sx={{ width: "49%" }}
            onClick={modifyUserGroups}
          >
            Submit changes above
          </Button>
          <div style={{ display: "inline-block", width: "2%" }}></div>
          <Button
            variant="outlined"
            sx={{ width: "49%" }}
            onClick={() => {
              setCsvUploadResult(null);
            }}
          >
            Cancel changes above
          </Button>
        </div>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={resetSnackbar}
        message={snackbarMessage}
        sx={{ width: "50%" }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          elevation={3}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};
