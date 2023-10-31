import React, { useContext } from "react";
import ChatSearch from "./ChatSearch";
import Chats from "./Chats";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { GiPalmTree } from "react-icons/gi";
import { AiOutlineArrowLeft } from "react-icons/ai";

const ChatWindow = () => {
  const { data, dispatch } = useContext(ChatContext);

  return (
    <div className=" rounded-t-lg overflow-hidden dark:border-l dark:border-t dark:border-gray-700">
      <div className="flex bg-blue-500 p-2  items-center dark:bg-black dark:border-b dark:border-gray-700 ">
        <GiPalmTree size={27} className="text-white" />
        <span className="text-white text-lg ">Messenger</span>
      </div>

      <div className="flex h-[500px] max-md:h-[80vh] overflow-hidden ">
        <div
          className={`md:w-[30vw] lg:w-[20vw] xl:w-[15vw] ${
            !Object.keys(data.user).length ? "max-sm:w-[100vw]" : "max-sm:w-0"
          }  bg-white border-r border-gray-100 border-l dark:bg-black dark:border-l-0 dark:border-gray-700 md:p-2`}
        >
          <ChatSearch visibility={Object.keys(data.user).length === 0} />
          <Chats />
        </div>

        <div
          className={`xl:w-[25vw] lg:w-[40vw] md:w-[55vw] ${
            Object.keys(data.user).length ? "max-sm:w-[100vw]" : "max-sm:w-0"
          } bg-white dark:bg-black`}
        >
          <div
            className={`h-full w-full ${
              !Object.keys(data.user).length ? "hidden" : ""
            }`}
          >
            <div className="flex bg-white  items-center h-[11%] gap-1 px-2 border-b border-gray-300 dark:bg-black dark:text-white dark:border-gray-700 ">
              <AiOutlineArrowLeft
                className={`${
                  Object.keys(data.user).length ? "" : "hidden"
                } sm:hidden text-2xl text-gray-700 dark:text-gray-300`}
                onClick={() => dispatch({ type: "REMOVE_USER" })}
              />
              <img
                src={data.user.profilePicture}
                className="h-[40px] w-[40px] rounded-full"
              />
              <span>{data.user.displayName}</span>
            </div>
            <Messages />
            <Input />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
