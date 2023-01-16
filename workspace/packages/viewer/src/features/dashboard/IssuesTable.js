import React, { useState } from "react";
import { useGetIssuesQuery } from "../api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { DataGrid } from "@mui/x-data-grid";
import { EditorState, Editor, convertFromRaw } from "draft-js";
import { TicketsTable } from "./TicketsTable";

export const IssuesTable = () => {
  const {
    data: issues,
    isLoading: issuesAreLoading,
    isSuccess: issuesLoadedSuccessfully,
    isError,
    error,
  } = useGetIssuesQuery();

  if (issuesAreLoading) {
    return <LoadingOutlined />;
  } else if (isError) {
    return (
      <div>
        <p>Issues load error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return <TicketsTable tickets={issues} />;
};
