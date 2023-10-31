import React, { useState, useContext, useRef } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { UserContext } from "../context/UserContext";
import { AiOutlineSearch } from "react-icons/ai";
import { ChatContext } from "../context/ChatContext";

const ChatSearch = ({ visibility }) => {
  const [foundUser, setfoundUser] = useState([]);
  const { userInfos } = useContext(UserContext);
  const [focus, setFocus] = useState(false);
  const { dispatch } = useContext(ChatContext);
  const ref = useRef();

  const handleSearch = async (input2) => {
    const input = input2.toLowerCase();
    if (input) {
      const end_input = input + "\uf8ff";
      const q = query(
        collection(db, "users"),
        where("searchName", ">=", input),
        where("searchName", "<=", end_input)
      );
      const querySnapshot = await getDocs(q);
      const newArray = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().userName !== userInfos.userName) {
          newArray.push(doc.data());
        }
      });
      setfoundUser(newArray);
    } else {
      setfoundUser([]);
    }
  };

  const handleSelect = async (user) => {
    const payloadObject = {
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      userID: user.userID,
    };

    const combinedId =
      userInfos.userID > user.userID
        ? userInfos.userID + user.userID
        : user.userID + userInfos.userID;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", userInfos.userID), {
          [combinedId + ".userInfo"]: {
            userID: user.userID,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".unseenMessageCount"]: 0,
        });

        await updateDoc(doc(db, "userChats", user.userID), {
          [combinedId + ".userInfo"]: {
            userID: userInfos.userID,
            displayName: userInfos.displayName,
            profilePicture: userInfos.profilePicture,
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".unseenMessageCount"]: 0,
        });

        dispatch({ type: "CHANGE_USER", payload: payloadObject });
        ref.current.value = "";
        setfoundUser([]);
      } else {
        dispatch({ type: "CHANGE_USER", payload: payloadObject });
        ref.current.value = "";
        setfoundUser([]);
      }
    } catch (err) {}
  };

  return (
    <div className={`mb-2 ${visibility ? "" : "max-sm:hidden"}`}>
      <div className=" bg-white relative dark:bg-transparent max-md:w-[90%] max-md:mx-auto max-md:mt-2">
        <input
          className={
            "outline-none w-full  pl-7 py-1  bg-gray-100  rounded-lg dark:bg-black dark:border dark:border-gray-700 dark:text-white"
          }
          ref={ref}
          placeholder="Find a user"
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            setFocus(true);
          }}
        />
        <AiOutlineSearch
          className="absolute left-1 top-[0.3rem] -z-1 dark:text-gray-300"
          size={20}
        />
      </div>

      <div
        className={`flex items-center gap-2  pt-2 pb-2 overflow-x-scroll w-[15vw]  max-md:w-full ${
          foundUser.length != 0 ? "block" : "hidden"
        }`}
      >
        {foundUser.map((us, i) => (
          <div
            key={i}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1d1d1d] flex flex-col items-center flex-shrink-0"
            onClick={() => handleSelect(us)}
          >
            <img
              className="h-[3vw] w-[3vw] max-md:h-[9vw] max-lg:w-[9vw] md:h-[6vw] md:w-[6vw] rounded-full"
              src={us.profilePicture}
            />
            <div className="flex flex-col">
              <p className="font-bold dark:text-white">{us.displayName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSearch;
