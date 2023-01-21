import React, { useEffect, useState } from "react";
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

  const [dropzoneIsActive, setDropzoneIsActive] = useState(false);

  let dropzoneStyle = {
    width: "100%",
    height: "100px",
    border: "2px dashed #999",
    borderRadius: "5px",
    lineHeight: "100px",
    textAlign: "center",
  };

  if (dropzoneIsActive) {
    dropzoneStyle.borderColor = "#20A7F5";
  }

  return (
    <div style={{ padding: "25px 40px" }}>
      <h1>Publish a topic</h1>
      <div
        style={dropzoneStyle}
        onMouseEnter={() => setDropzoneIsActive(true)}
        onMouseLeave={() => setDropzoneIsActive(false)}
      >
        {dropzoneIsActive && (
          <span style={{ color: "#20A7F5" }}>
            Listening for pasted topic data ...
          </span>
        )}
        {!dropzoneIsActive && (
          <span>Hover over me, then paste your topic data</span>
        )}
      </div>
    </div>
  );
};
