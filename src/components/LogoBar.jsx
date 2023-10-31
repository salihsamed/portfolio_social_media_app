import React from "react";
import { GiPalmTree } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

const LogoBar = () => {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => {
        navigate("/");
      }}
    >
      <GiPalmTree size={33} className="text-blue-500 dark:text-white" />
      <h1 className="text-2xl font-bold dark:text-white max-sm:hidden">
        Social Z
      </h1>
    </div>
  );
};

export default LogoBar;
