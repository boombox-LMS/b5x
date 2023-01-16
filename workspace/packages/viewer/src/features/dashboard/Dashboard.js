import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Tab from "../ui/Tab";
import TabPanel from "../ui/TabPanel";
import Tabs from "../ui/Tabs";
import Box from "@mui/material/Box";
import { UserStatsTable } from "./UserStatsTable";
import { TopicStatsTable } from "./TopicStatsTable";
import { IssuesTable } from "./IssuesTable";
import { FeedbackTable } from "./FeedbackTable";
import { setHeaderProps } from "../header/headerSlice";

export const Dashboard = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "Dashboard",
        currentPage: "Dashboard",
      })
    );
  }, []);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="dashboard">
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Users" index={0} />
            <Tab label="Topics" index={1} />
            <Tab label="Issues" index={2} />
            <Tab label="Feedback" index={3} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <UserStatsTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TopicStatsTable />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <IssuesTable />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <FeedbackTable />
        </TabPanel>
      </Box>
    </div>
  );
};
