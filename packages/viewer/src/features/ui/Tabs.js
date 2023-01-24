import React from "react";
import MuiTabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";
import { muiTheme } from "../../theme";

const Tabs = styled((props) => (
  <MuiTabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    width: "100%",
    backgroundColor: muiTheme.palette.secondary.main,
  },
});

export default Tabs;
