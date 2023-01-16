import React from "react";
import MuiTab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Tab = styled((props) => (
  <MuiTab disableRipple {...props} {...a11yProps(props.index)} />
))(({ theme }) => ({
  "&.Mui-selected": {
    color: "#0297ed",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));

export default Tab;
