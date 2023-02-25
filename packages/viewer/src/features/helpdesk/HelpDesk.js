import React, { useState } from "react";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { HelpGetter } from "./HelpGetter";
import { IssueReporter } from "./IssueReporter";
import { FeedbackSubmitter } from "./FeedbackSubmitter";
import Tab from "../ui/Tab";
import TabPanel from "../ui/TabPanel";
import Tabs from "../ui/Tabs";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import styled from "styled-components/macro";
import { muiTheme, INACTIVE_MENU_ICON_COLOR } from "../../theme";

const HelpDeskExitIconWrapper = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
  font-size: 1.4em;
  color: ${INACTIVE_MENU_ICON_COLOR};
  &:hover {
    color: ${muiTheme.palette.secondary.main};
  }
`;

const actions = [
  { icon: <HelpOutlineOutlinedIcon />, name: "Ask for help" },
  { icon: <BugReportOutlinedIcon />, name: "Report issue" },
  { icon: <AddCommentOutlinedIcon />, name: "Share feedback" },
];

export const HelpDesk = () => {
  const [currentAction, setCurrentAction] = useState(null);

  const tabIndicesByActionName = {
    "Ask for help": 0,
    "Report issue": 1,
    "Share feedback": 2,
  };

  const [activeTabValue, setActiveTabValue] = React.useState(
    tabIndicesByActionName[currentAction] || 0
  );

  const handleTabChange = (event, value) => {
    setActiveTabValue(value);
  };

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSpeedDialSelection = (actionName) => {
    setCurrentAction(actionName);
    setActiveTabValue(tabIndicesByActionName[actionName]);
  };

  const handleTicketSubmission = ({ resultStatus, resultMessage }) => {
    setCurrentAction(null);
    setSnackbarSeverity(resultStatus);
    setSnackbarMessage(resultMessage);
    setShowSnackbar(true);
  };

  const resetSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <div>
      <SpeedDial
        ariaLabel="Feedback speed dial"
        hidden={currentAction !== null}
        icon={<SpeedDialIcon />}
        direction="up"
        sx={{
          position: "fixed",
          paddingBottom: "7px",
          "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
            bottom: "10px",
            right: "10px",
          },
          "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
            top: "10px",
            left: "10px",
          },
        }}
        FabProps={{
          sx: {
            width: "40px",
            height: "40px",
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              handleSpeedDialSelection(action.name);
            }}
          />
        ))}
      </SpeedDial>
      {currentAction !== null && (
        <Paper
          elevation={3}
          sx={{
            width: "550px",
            minHeight: "525px",
            paddingTop: "15px",
            position: "fixed",
            right: "20px",
            bottom: "20px",
            overflow: "scroll",
            zIndex: "2000",
          }}
        >
          <div>
            <HelpDeskExitIconWrapper
              onClick={() => {
                setCurrentAction(null);
              }}
            >
              <CloseIcon />
            </HelpDeskExitIconWrapper>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs centered value={activeTabValue} onChange={handleTabChange}>
                <Tab
                  icon={<HelpOutlineOutlinedIcon />}
                  label="Ask for help"
                  index={0}
                />
                <Tab
                  icon={<BugReportOutlinedIcon />}
                  label="Report issue"
                  index={1}
                />
                <Tab
                  icon={<AddCommentOutlinedIcon />}
                  label="Share feedback"
                  index={2}
                />
              </Tabs>
            </Box>
            <TabPanel value={activeTabValue} index={0}>
              <HelpGetter />
            </TabPanel>
            <TabPanel value={activeTabValue} index={1}>
              <IssueReporter formSubmitCallback={handleTicketSubmission} />
            </TabPanel>
            <TabPanel value={activeTabValue} index={2}>
              <FeedbackSubmitter formSubmitCallback={handleTicketSubmission} />
            </TabPanel>
          </div>
        </Paper>
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
