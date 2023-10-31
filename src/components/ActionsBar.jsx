import React, { useContext, useEffect, useState } from "react";
import { MdOutlineLightMode } from "react-icons/md";
import { NotificationContext } from "../context/NotificationContext";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineMoon } from "react-icons/hi";
import { ClipLoader } from "react-spinners";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Notification from "./Notification";
import { UserContext } from "../context/UserContext";

const ActionsBar = ({ visibility }) => {
  const { userInfos } = useContext(UserContext);
  const { notification } = useContext(NotificationContext);
  const [mode, setMode] = useState(false);
  const [notPanelVisibility, setNotPanelVisibility] = useState(false);
  const [notInfos, setNotInfos] = useState([]);

  useEffect(() => {
    const preference = localStorage.getItem("mode");
    if (preference === "true") {
      setMode(true);
    }
  }, []);

  useEffect(() => {
    if (mode) {
      document.getElementsByTagName("html")[0].classList.add("dark");
    } else {
      document.getElementsByTagName("html")[0].classList.remove("dark");
    }
  }, [mode]);

  const switchMode = () => {
    localStorage.setItem("mode", !mode);
    setMode(!mode);
  };

  const getUserInfo = async (userID) => {
    const docRef = doc(db, "users", userID);
    const snapshot = await getDoc(docRef);
    const data = snapshot.data();
    return data;
  };

  const notificationParser = async () => {
    const tempArr = [];
    for (const element of notification) {
      const notificationInfos = element.split(",");

      if (notificationInfos[0] == 0) {
        const userID = notificationInfos[1];
        const postID = notificationInfos[3];

        const userInfo = await getUserInfo(userID);
        const notElement = {
          type: 0,
          userID: userInfos.userID,
          userName: userInfo.userName,
          postID,
          profilePicture: userInfo.profilePicture,
          actionString: element,
        };

        tempArr.push(notElement);
      } else if (notificationInfos[0] == 1) {
        const userID = notificationInfos[1];
        const postID = notificationInfos[2];
        const userInfo = await getUserInfo(userID);
        const notElement = {
          type: 1,
          userID: userInfos.userID,
          userName: userInfo.userName,
          postID,
          profilePicture: userInfo.profilePicture,
          actionString: element,
        };
        tempArr.push(notElement);
      } else if (notificationInfos[0] == 2) {
        const userID = notificationInfos[1];
        const userInfo = await getUserInfo(userID);
        const notElement = {
          type: 2,
          userName: userInfo.userName,
          profilePicture: userInfo.profilePicture,
          actionString: element,
        };
        tempArr.push(notElement);
      } else {
        const userID = notificationInfos[1];
        const userInfo = await getUserInfo(userID);
        const notElement = {
          type: 3,
          userName: userInfo.userName,
          profilePicture: userInfo.profilePicture,
          actionString: element,
        };
        tempArr.push(notElement);
      }
    }

    setNotInfos(tempArr);
  };

  const removeFromUnseenAction = async (actionString) => {
    const docRef = doc(db, "notifications", userInfos.userID);
    const snapshot = await getDoc(docRef);
    var unseenActions = snapshot.data().unseenActions;
    unseenActions = unseenActions.filter((element) => element !== actionString);
    await updateDoc(docRef, {
      unseenActions,
    });
  };

  const switchNotPanel = () => {
    if (
      notPanelVisibility === false &&
      notification.length !== notInfos.length
    ) {
      notificationParser();
    }
    setNotPanelVisibility(!notPanelVisibility);
  };

  return (
    <div className="flex gap-6 items-center">
      <div className=" max-sm:hidden">
        {mode ? (
          <MdOutlineLightMode
            size={27}
            className="hover:text-gray-700 cursor-pointer dark:text-white"
            onClick={switchMode}
          />
        ) : (
          <HiOutlineMoon
            size={25}
            className="hover:text-gray-700 cursor-pointer"
            onClick={switchMode}
          />
        )}
      </div>

      <div className="relative">
        <div className={`${visibility ? "max-sm:hidden" : ""}`}>
          <FaRegBell
            size={21}
            className={`hover:text-gray-700 cursor-pointer dark:text-white `}
            onClick={switchNotPanel}
          />
        </div>

        <div
          className={`bg-red-500 rounded-full  absolute -top-2 -left-2 px-1 text-white text-xs font-semibold max-sm:hidden ${
            notification.length > 0 ? "block" : "hidden"
          }`}
        >
          {notification.length}
        </div>

        <div
          className={`absolute bg-white top-10 max-sm:top-8 max-sm:left-0 max-sm:-translate-x-[25vh] max-sm:w-[70vw] right-0 border lg:w-[15vw] md:w-[35vw]  overflow-hidden border-gray-400 rounded-md  ${
            notPanelVisibility ? "" : "hidden"
          } dark:bg-black dark:text-white z-10`}
        >
          {notification.length === 0 ? (
            <div className="p-2 dark:bg-black dark:text-white">
              There is no notification.
            </div>
          ) : notInfos.length === 0 ? (
            <ClipLoader color="#36d7b7" />
          ) : (
            notInfos.map((notInfo, index) => (
              <Notification
                key={index}
                info={notInfo}
                removeFunc={() => {
                  removeFromUnseenAction(notInfo.actionString);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionsBar;
