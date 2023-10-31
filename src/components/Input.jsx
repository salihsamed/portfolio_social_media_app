import { BsFillImageFill } from "react-icons/bs";
import { IoMdAttach } from "react-icons/io";
import React, { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  doc,
  FieldValue,
  increment,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { UserContext } from "../context/UserContext";
import { IoSend } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const { userInfos } = useContext(UserContext);
  const { data } = useContext(ChatContext);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {},
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: userInfos.userID,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else if (text) {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: userInfos.userID,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", userInfos.userID), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
      [data.chatId + ".unseenMessageCount"]: 0,
    });

    await updateDoc(doc(db, "userChats", data.user.userID), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
      [data.chatId + ".unseenMessageCount"]: increment(1),
    });

    setText("");
    setImg(null);
  };

  return (
    <div className="h-[12%] p-3 flex items-center justify-between bg-gray-200 border-t border-gray-300 gap-2 dark:bg-black dark:border-gray-700">
      {/* <AiOutlinePlus size={22} className='text-gray-700 dark:text-white'/>   */}
      <input
        placeholder="Type something..."
        className="py-2 px-1 flex-1 outline-none rounded-lg border focus:border-gray-800 dark:bg-black dark:border-gray-700 dark:focus:border-gray-300 dark:text-white"
        onChange={(e) => setText(e.target.value)}
        value={text}
        onKeyDown={handleKeyPress}
      />
      <div className="flex items-center gap-2 text-gray-500">
        <input
          id="file"
          type="file"
          className="hidden"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file" className="cursor-pointer"></label>
        <IoSend
          className="text-blue-500 dark:text-white"
          size={23}
          onClick={handleSend}
        />
      </div>
    </div>
  );
};

export default Input;
