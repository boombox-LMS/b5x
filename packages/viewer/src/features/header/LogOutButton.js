import React from "react";
import { useLogOutUserMutation } from "../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import { Tooltip } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

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

  return (
    <span id="logout-button" onClick={handleClick}>
      <Tooltip title="Log out" placement="top">
        <div
          className="header__menu-icon"
          style={{ color: "rgba(0, 0, 0, 0.6)" }}
        >
          <MeetingRoomIcon />
        </div>
      </Tooltip>
    </span>
  );
};
