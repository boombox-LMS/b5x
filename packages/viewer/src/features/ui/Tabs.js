import React from "react";
import MuiTabs from "@mui/material/Tabs";
import { styled } from "@mui/material/styles";

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
    backgroundColor: "#0297ed",
  },
});

export default Tabs;
