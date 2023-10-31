import React, { useContext, useEffect, useState } from "react";
import Message from "./Message";
import { db } from "../firebase/firebase";
import { ChatContext } from "../context/ChatContext";

const Messages = () => {
  const { messages } = useContext(ChatContext);
  return (
    <div className="p-[10px]  overflow-y-scroll w-full max-md:w-full h-[77%] bg-slate-100 dark:bg-black">
      {messages?.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
