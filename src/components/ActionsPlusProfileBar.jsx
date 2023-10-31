import React from "react";
import ActionsBar from "./ActionsBar";
import ProfileBar from "./ProfileBar";

const ActionsPlusProfileBar = ({ visibility }) => {
  return (
    <div className="flex gap-5">
      <ActionsBar visibility={visibility} />
      <ProfileBar />
    </div>
  );
};

export default ActionsPlusProfileBar;
