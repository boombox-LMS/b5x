import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useGetUserProfileQuery } from "../api/apiSlice";
import { setHeaderProps } from "../header/headerSlice";
import { DisplayBadge } from "../fragment/Badge";

// TODO: Make some kind of PageWrapper component that abstracts away the header and the div,
// to ensure consistent and easily modifiable padding, header args, etc.
export const UserProfile = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "User profile",
        currentPage: "User profile",
      })
    );
  }, []);

  const { username } = useParams();

  const {
    data: user,
    isLoading: userIsLoading,
    isSuccess: userLoadedSuccessfully,
    isError: userHasError,
    error: userError,
  } = useGetUserProfileQuery({ username });

  if (userIsLoading) {
    return null;
  } else if (userHasError) {
    return <div>User fetch error: {JSON.stringify(userError)}</div>;
  }

  let name = user.email;
  if (user.firstName) {
    name = user.firstName;
  }
  if (user.lastName) {
    name += " " + user.lastName;
  }

  return (
    <div style={{ padding: "25px 40px" }}>
      <h1>User profile for {name}</h1>
      <h2>Badges</h2>
      {user.badges.length === 0 && (
        <div>You haven't earned any badges yet.</div>
      )}
      {user.badges.map((badge, i) => (
        <div key={i} style={{ display: "inline-block", marginRight: "20px" }}>
          <DisplayBadge
            title={badge.title}
            description={badge.description}
            icon={badge.icon}
          />
        </div>
      ))}
    </div>
  );
};
