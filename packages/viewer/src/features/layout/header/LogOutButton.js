import React, { useState } from "react";
import { useLogOutUserMutation } from "../../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import styled from "styled-components/macro";
import { themeSettings } from "../../../theme/active-theme";

export const LogOutButton = () => {
  const [logOutUser, { isLoading }] = useLogOutUserMutation();
  const [isClicked, setIsClicked] = useState(false);

  const navigate = useNavigate();

  const handleClick = async () => {
    setIsClicked(true);
    try {
      await logOutUser().unwrap();
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Failed to log out user:", err);
    }
  };

  const HeaderMenuIconWrapper = styled.div`
    display: inline-block;
    margin-right: 6px;
    margin-left: 6px;
    margin-top: -3px;
    font-size: 1.3em;
    cursor: pointer;
    ${(props) =>
      props.isClicked
        ? `color: ${themeSettings.activeMenuIconColor};`
        : `color: ${themeSettings.inactiveMenuIconColor};`}
  `;

  return (
    <span id="logout-button" onClick={handleClick}>
      <Tooltip title="Log out" placement="top">
        <HeaderMenuIconWrapper isClicked={isClicked}>
          <MeetingRoomIcon />
        </HeaderMenuIconWrapper>
      </Tooltip>
    </span>
  );
};
