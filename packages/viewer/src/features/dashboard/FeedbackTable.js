import React from "react";
import { useGetFeedbackQuery } from "../api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { TicketsTable } from "./TicketsTable";

export const FeedbackTable = () => {
  const {
    data: tickets,
    isLoading: ticketsAreLoading,
    isSuccess: ticketsLoadedSuccessfully,
    isError,
    error,
  } = useGetFeedbackQuery();

  if (ticketsAreLoading) {
    return <LoadingOutlined />;
  } else if (isError) {
    return (
      <div>
        <p>Feedback load error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return <TicketsTable tickets={tickets} />;
};
