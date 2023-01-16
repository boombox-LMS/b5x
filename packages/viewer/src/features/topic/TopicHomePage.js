import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/apiSlice";
import { Header } from "../header/Header";
import { TopicDetails } from "./TopicDetails";
import { LoadingOutlined } from "@ant-design/icons";
import Button from "@mui/material/Button";
import { setHeaderProps } from "../header/headerSlice";

/**
 *  The topic home page serves as a shareable entry point into a topic;
 *  it is displayed at the URL that should always be used to refer to the topic
 *  in cases when referencing a specific version is not intended.
 *
 *  The topic home page can be thought of as where the topic persistently "lives",
 *  so it's the link that should be used to reference the topic in docs/comms
 *  (e.g., "if you would like to learn SQL, start with the intro course here").
 *
 *  While the page can't be "versionless" exactly, it aims to display the same information
 *  to everyone, regardless of what version they are actually enrolled in
 *  (or whether they are enrolled at all).
 *
 *  The only content difference is at the bottom:
 *  - Users who are not enrolled in the topic will see a Start button.
 *  - Users already enrolled in the topic will see a Resume button
 *    that takes them to the appropriate topic version / current document.
 *  - TODO: Users enrolled in an old version will be prompted to migrate
 *    in cases where that's advisable.
 */

export const TopicHomePage = () => {
  const dispatch = useDispatch();
  const { topicSlugOrUri } = useParams();
  const topicUriRegex = /^(.*)-v(.*)$/; // TODO: Make the version separator a double dash or something, for safety, and throw an error if the initial slug contains a double dash
  const isUri = topicUriRegex.test(topicSlugOrUri);
  let topicQueryParams;
  if (isUri) {
    topicQueryParams = { uri: topicSlugOrUri };
  } else {
    topicQueryParams = { slug: topicSlugOrUri };
  }

  const navigate = useNavigate();

  const handleTopicStart = () => {
    // TODO: force catalog refresh so the user is not routed to this page
    // from the catalog once they've enrolled in a course ...
    // Maybe this should be a createEnrollment action,
    // since auto-creating the enrollment is confusing behavior anyway?
    navigate(`/topics/${topic.uri}/documents/${topic.firstDocumentUri}`);
  };

  // TODO: Is the topic's URI going to be wrong in this case,
  // since we're using the enrollment data to hone in on the specific topic version?
  // Eventually will want to give the user the option to migrate etc.,
  // so this will probably all change anyway.
  const handleTopicResume = () => {
    navigate(
      `/topics/${topic.slug}-v${topic.enrollmentData.topicVersion}/documents/${topic.enrollmentData.currentDocumentUri}`
    );
  };

  // TODO: Set up as CSS and add green on hover
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    border: "1.5px solid #f0f0f0",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
    borderRadius: "3px",
    fontWeight: "500",
  };

  // fetch topic
  const {
    data: topic,
    isLoading: topicIsLoading,
    isSuccess: topicLoadedSuccessfully,
    isError: topicHasError,
    error: topicError,
  } = api.endpoints.getTopicInfo.useQuery(topicQueryParams);

  useEffect(() => {
    let props = {
      isHidden: true,
    };
    if (topic) {
      props = {
        isHidden: false,
        isMinimized: false,
        title: `Topic details: ${topic.title}`,
        activeIcon: "topic",
      };
    }
    dispatch(setHeaderProps(props));
  }, [topic]);

  // wait for everything above to finish loading
  if (topicIsLoading) {
    return null;
    // handle any errors
  } else if (topicHasError) {
    return (
      <div>
        <p>Topic Load Error: {JSON.stringify(topicError)}</p>
      </div>
    );
  }

  return (
    <>
      <div className="header-spacer" />
      <div
        style={{
          width: "800px",
          margin: "auto",
          marginTop: "50px",
          paddingBottom: "100px",
        }}
      >
        <p>
          <Link to="/">Back to catalog</Link>
        </p>
        <TopicDetails topic={topic} />
        {/* TODO: Handle messaging around prereqs not being met */}
        {/* TODO: Handle documentation case 
      -- maybe they are just sent straight to the documentation instead of this page? */}
        {!topic.enrollmentData && topic.unmetPrerequisites.length === 0 && (
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            onClick={handleTopicStart}
          >
            Start
          </Button>
        )}
        {topic.enrollmentData && (
          <Button
            sx={{ width: "100%" }}
            variant="contained"
            onClick={() => {
              handleTopicResume(topic);
            }}
          >
            Resume
          </Button>
        )}
      </div>
    </>
  );
};
