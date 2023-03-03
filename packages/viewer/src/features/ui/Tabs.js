import React from "react";
import MuiTabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";
import { themeSettings } from "../../theme/active-theme";

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
    backgroundColor: themeSettings.selectedTabColor,
  },
});

export default Tabs;
