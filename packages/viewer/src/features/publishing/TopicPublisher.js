import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setHeaderProps } from "../header/headerSlice";
import { api } from "../api/apiSlice";
import { Link } from "react-router-dom";
import { muiTheme } from "../../theme";

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

  const [dropzoneStatus, setDropzoneStatus] = useState("inactive");
  const [publishedTopicUri, setPublishedTopicUri] = useState(null);

  let dropzoneStyle = {
    width: "100%",
    height: "120px",
    border: "2px dashed #999",
    borderRadius: "5px",
    lineHeight: "120px",
    textAlign: "center",
    cursor: "pointer",
  };

  if (dropzoneStatus !== "inactive") {
    dropzoneStyle.border = `2px dashed ${muiTheme.palette.secondary.main}`;
  }

  const [publishTopicTrigger, publishTopicResult] =
    api.endpoints.publishTopic.useMutation();

  const handleDropzonePaste = (e) => {
    if (dropzoneStatus === "listening") {
      e.preventDefault();
      setDropzoneStatus("publishing");
      const clipboardData = e.clipboardData.getData("text");
      const topicJson = JSON.parse(clipboardData);
      console.log("Topic JSON:", topicJson);
      // TODO: Handle publishing errors
      publishTopicTrigger(topicJson).then((result) => {
        console.log("Result:", result);
        setPublishedTopicUri(topicJson.topic.uri);
        setDropzoneStatus("inactive");
      });
    }
  };

  return (
    <div style={{ padding: "25px 40px" }}>
      <h1>Publish a topic</h1>
      <div
        style={dropzoneStyle}
        onClick={() => setDropzoneStatus("listening")}
        onMouseLeave={() => setDropzoneStatus("inactive")}
        onPaste={handleDropzonePaste}
      >
        {dropzoneStatus === "listening" && (
          <span style={{ color: muiTheme.palette.secondary.main }}>
            Listening for pasted topic data ...
          </span>
        )}
        {dropzoneStatus === "inactive" && (
          <span>Click here when you're ready to paste your topic data</span>
        )}
        {dropzoneStatus === "publishing" && (
          <span style={{ color: muiTheme.palette.secondary.main }}>
            Publishing topic...
          </span>
        )}
      </div>
      {publishedTopicUri && (
        <p>
          Topic published successfully! Browse for it in the{" "}
          <Link to="/">catalog</Link>, or just{" "}
          <Link to={`/topics/${publishedTopicUri}`}>view it directly</Link>.
        </p>
      )}
    </div>
  );
};
