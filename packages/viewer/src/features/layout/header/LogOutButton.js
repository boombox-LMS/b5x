import React from "react";
import { useLogOutUserMutation } from "../../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import { Tooltip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import styled from "styled-components/macro";
import { muiTheme } from "../../../theme/active-theme";

export const LogOutButton = () => {
  const [logOutUser, { isLoading }] = useLogOutUserMutation();

  const navigate = useNavigate();

  const handleClick = async () => {
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
    color: rgba(0, 0, 0, 0.6);
    &:hover {
      color: ${muiTheme.palette.secondary.main};
    }
  `;

  return (
    <span id="logout-button" onClick={handleClick}>
      <Tooltip title="Log out" placement="top">
        <HeaderMenuIconWrapper>
          <MeetingRoomIcon />
        </HeaderMenuIconWrapper>
      </Tooltip>
    </span>
  );
};
