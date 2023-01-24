import React from "react";
import MuiTab from "@mui/material/Tab";
import { styled } from "@mui/material/styles";
import { muiTheme } from "../../theme";

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
    color: muiTheme.palette.secondary.main,
  },
  "&.Mui-focusVisible": {
    backgroundColor: muiTheme.palette.secondary.main,
  },
}));

export default Tab;
