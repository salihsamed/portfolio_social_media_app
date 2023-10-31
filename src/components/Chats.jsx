import { doc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { UserContext } from "../context/UserContext";
import { db } from "../firebase/firebase";
const Chats = () => {
  const { userInfos } = useContext(UserContext);
  const { dispatch, chats } = useContext(ChatContext);

  const handleSelect = async (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
    const combinedId =
      userInfos.userID > u.userID
        ? userInfos.userID + u.userID
        : u.userID + userInfos.userID;

    await updateDoc(doc(db, "userChats", userInfos.userID), {
      [combinedId + ".unseenMessageCount"]: 0,
    });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-black dark:text-white">
      {Object.entries(chats)
        ?.sort((a, b) => b[1].date - a[1].date)
        .map((chat, i) => (
          <div
            className="flex hover:bg-neutral-100 dark:hover:bg-[#1d1d1d]"
            key={i}
            onClick={() => handleSelect(chat[1]?.userInfo)}
          >
            <div className="flex items-center ml-1">
              <img
                className="h-[40px] w-[40px] rounded-full"
                src={chat[1]?.userInfo?.profilePicture}
                alt=""
              />
            </div>

            <div className="flex flex-row items-center gap-2 cursor-pointer  pt-2 pb-2 border-b flex-1 dark:border-gray-600">
              <div className="flex flex-col h-full ml-2 w-full">
                <p className="text-md">{chat[1]?.userInfo?.displayName}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    {chat[1]?.lastMessage?.text}
                  </p>
                  <p
                    className={`bg-blue-500 rounded-full px-2 text-white text-sm mr-2 ${
                      chat[1].unseenMessageCount === 0 ? "hidden" : ""
                    }`}
                  >
                    {chat[1]?.unseenMessageCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Chats;
