import React, { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import ReactCanvasConfetti from "react-canvas-confetti";
import { ReactSVG } from "react-svg";
import { muiTheme } from "../../theme";

export const DisplayBadge = ({ title, description, icon, isNew }) => {
  const [fireConfetti, setFireConfetti] = useState(false);

  useEffect(() => {
    if (isNew) {
      setFireConfetti(true);
    }
  }, []);

  return (
    <>
      <ReactCanvasConfetti
        origin={{ x: 0.5, y: 1.1 }}
        scalar={1.6}
        gravity={0.9}
        particleCount={120}
        ticks={300}
        spread={90}
        decay={0.95}
        onDecay={() => {
          setFireConfetti(false);
        }}
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          zIndex: `${fireConfetti ? "1000" : "-100"}`,
        }}
        fire={fireConfetti}
      />
      <Paper
        elevation={3}
        sx={{
          padding: "10px",
          paddingTop: "5px",
          paddingBottom: "15px",
          width: "175px",
          textAlign: "center",
        }}
        className="display-badge"
      >
        <div>
          <ReactSVG
            src={icon}
            beforeInjection={(svg) => {
              svg.setAttribute("color", muiTheme.palette.secondary.main);
              svg.setAttribute("style", "width: 75px; height: auto;");
            }}
          />
        </div>
        <div>
          <div
            className="display-badge__title"
            style={{
              fontWeight: "bold",
              marginBottom: "7px",
              marginTop: "-9px",
              fontSize: "1em",
              lineHeight: "1.3em",
              color: muiTheme.palette.secondary.main,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.9em",
              lineHeight: "1.2em",
            }}
          >
            {description}
          </div>
        </div>
      </Paper>
    </>
  );
};

export const Badge = ({
  fragment,
  fragmentRef,
  response,
  responseUpdateCallback,
}) => {
  const awardBadge = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: true,
      status: "completed",
    });
  };

  const [badgeAwarded, setBadgeAwarded] = useState(false);

  console.log("badgeAwarded", badgeAwarded);

  useEffect(() => {
    if (!response.value) {
      console.log("running award trigger");
      setBadgeAwarded(true);
      awardBadge();
    }
  }, []);

  if (!response.value) {
    return null;
  } else {
    return (
      <>
        <p>
          You've earned a badge! It will be displayed in your User Profile
          permanently.
        </p>
        <DisplayBadge
          title={fragment.data.title}
          description={fragment.data.description}
          icon={fragment.data.icon}
          isNew={badgeAwarded}
        />
      </>
    );
  }
};
