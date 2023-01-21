import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHeaderProps } from "../header/headerSlice";

export const TopicPublisher = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "Publish a topic",
        currentPage: "Publish a topic",
      })
    );
  }, []);

  return <div style={{ padding: "25px 40px" }}>TopicPublisher</div>;
};
