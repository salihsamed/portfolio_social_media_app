import React from "react";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const FriendsModal = ({ infos, closeFunc, title }) => {
  const navigate = useNavigate();

  const toProfile = (name) => {
    navigate(`/Profile/${name}`);
    closeFunc();
  };

  return (
    <div className="absolute top-[30%] right-0 left-0 mx-auto z-20 w-[15vw] max-sm:w-[95%] max-2xl:w-[60%] max-sm:dark:border-gray-300 bg-white rounded-md border border-gray-400 overflow-hidden dark:bg-black dark:border-gray-700">
      <IoClose
        className="absolute right-0 top-1 cursor-pointer text-2xl"
        onClick={closeFunc}
      />
      <h3 className="text-center text-lg font-semibold pb-2 pt-1 border-b border-gray-200">
        {title}
      </h3>
      {infos.length === 0 ? (
        <ClipLoader color="#3b82f6" />
      ) : (
        infos.map((info) => (
          <div
            onClick={() => toProfile(info.userName)}
            className="flex gap-2 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 px-3 py-1"
            key={info.userID}
          >
            <img
              className="h-12 w-12 rounded-full"
              src={info.profilePicture}
              alt={info.displayName}
            />
            <span>{info.displayName}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendsModal;
