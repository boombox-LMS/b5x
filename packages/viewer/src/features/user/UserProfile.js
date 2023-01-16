import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Header } from "../header/Header";
import Button from "@mui/material/Button";
import { useGetUserProfileQuery } from "../api/apiSlice";
import { api } from "../api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { setHeaderProps } from "../header/headerSlice";
import { DisplayBadge } from "../fragment/Badge";

// TODO: Move ApiKeyGenerator to its own file
const ApiKeyGenerator = ({ username }) => {
  const [assignedApiKey, setAssignedApiKey] = useState(null);
  const [assignApiKeyTrigger, assignApiKeyResult] =
    api.endpoints.assignApiKey.useMutation();
  const [copied, setCopied] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");

  // TODO: Api url is currently hardcoded
  const assignApiKey = () => {
    assignApiKeyTrigger({ username }).then((res) => {
      setAssignedApiKey(
        `${res.data.apiKey}_http://localhost:8080/api/v1_${username}`
      );
    });
  };

  const resetSnackbar = () => {
    setCopied(false);
    setSnackbarMessage("");
    setSnackbarSeverity("success");
  };

  const handleApiKeyCopy = () => {
    setSnackbarMessage("API key copied to clipboard");
    setSnackbarSeverity("success");
    setCopied(true);
  };

  return (
    <>
      <h2>API key generator</h2>
      <p>For publishing content from the CLI tool.</p>
      {!assignedApiKey && (
        <Button onClick={assignApiKey} variant="contained">
          Generate key
        </Button>
      )}
      {assignedApiKey && (
        <>
          <h3>Generated key</h3>
          <div
            style={{
              backgroundColor: "yellow",
              display: "inline-block",
              height: "36px",
              lineHeight: "36px",
              paddingRight: "5px",
              paddingLeft: "5px",
              verticalAlign: "top",
              marginTop: "-5px",
            }}
          >
            <code>{assignedApiKey}</code>
          </div>
          <CopyToClipboard onCopy={handleApiKeyCopy} text={assignedApiKey}>
            <div style={{ marginTop: "15px" }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon />}
              >
                Copy key
              </Button>
            </div>
          </CopyToClipboard>
          <p>
            This key will disappear once you've navigated away from this page.
          </p>
          <p>Don't worry, you can always create another one!</p>
          {copied && (
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              open={copied}
              autoHideDuration={3000}
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
          )}
        </>
      )}
    </>
  );
};

// TODO: Make some kind of PageWrapper component that abstracts away the header and the div,
// to ensure consistent and easily modifiable padding, header args, etc.
export const UserProfile = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "User profile",
        currentPage: "User profile",
      })
    );
  }, []);

  const { username } = useParams();

  const {
    data: user,
    isLoading: userIsLoading,
    isSuccess: userLoadedSuccessfully,
    isError: userHasError,
    error: userError,
  } = useGetUserProfileQuery({ username });

  if (userIsLoading) {
    return null;
  } else if (userHasError) {
    return <div>User fetch error: {JSON.stringify(userError)}</div>;
  }

  let name = user.email;
  if (user.firstName) {
    name = user.firstName;
  }
  if (user.lastName) {
    name += " " + user.lastName;
  }

  return (
    <div style={{ padding: "25px 40px" }}>
      <h1>User profile for {name}</h1>
      <h2>Badges</h2>
      {user.badges.length === 0 && (
        <div>You haven't earned any badges yet.</div>
      )}
      {user.badges.map((badge, i) => (
        <div key={i} style={{ display: "inline-block", marginRight: "20px" }}>
          <DisplayBadge
            title={badge.title}
            description={badge.description}
            icon={badge.icon}
          />
        </div>
      ))}
      <ApiKeyGenerator username={username} />
    </div>
  );
};
