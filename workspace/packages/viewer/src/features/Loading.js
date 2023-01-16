import React from "react";

export const Loading = () => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
  };

  return (
    <div style={{ paddingTop: "50px" }}>
      <div style={containerStyle}>
        <div>
          <div className="loading-note">
            <img src="/img/DoubleNote.svg" width="30px" />
          </div>
          <div>
            <img src="/img/Boombox.svg" width="90px" />
          </div>
        </div>
      </div>
    </div>
  );
};
