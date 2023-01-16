import React, { useState } from "react";
import Tab from "../ui/Tab";
import TabPanel from "../ui/TabPanel";
import Tabs from "../ui/Tabs";
import { FragmentWrapper } from "./FragmentWrapper";
import Paper from "@mui/material/Paper";

export const TabbedContent = ({ fragment }) => {
  const [activeTabValue, setActiveTabValue] = React.useState(0);

  const handleTabChange = (event, value) => {
    setActiveTabValue(value);
  };

  return (
    <Paper variant="outlined">
      <Tabs
        value={activeTabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: "1px solid lightgray" }}
      >
        {fragment.children.map((tabFragment, index) => (
          <Tab key={index} label={tabFragment.data.title} />
        ))}
      </Tabs>
      {fragment.children.map((tabFragment, index) => (
        <TabPanel key={index} value={activeTabValue} index={index}>
          {tabFragment.children.map((contentFragment, index) => (
            <FragmentWrapper key={index} fragment={contentFragment} />
          ))}
        </TabPanel>
      ))}
    </Paper>
  );
};
