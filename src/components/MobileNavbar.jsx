import React, { useContext } from "react";
import { useEffect } from "react";
import { MdOutlineLightMode } from "react-icons/md";
import { HiOutlineMoon } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { ChatContext } from "../context/ChatContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { NotificationContext } from "../context/NotificationContext";

const MobileNavbar = ({ visibility, closeFunc }) => {
  const [mode, setMode] = useState(false);
  const { userInfos, userUnsub1, userUnsub2, unsubscribeArr } =
    useContext(UserContext);
  const { notUnsub1 } = useContext(NotificationContext);
  const { dispatch, chatUnsub1, chatUnsub2, chatUnsub3 } =
    useContext(ChatContext);

  const navigate = useNavigate();

  console.log("visibility", visibility);

  const logOut = async () => {
    closeFunc();
    dispatch({ type: "REMOVE_USER" });
    userUnsub1();
    userUnsub2();
    for (const element of unsubscribeArr) {
      element();
    }
    notUnsub1();
    chatUnsub1();
    if (chatUnsub2 !== null) {
      chatUnsub2();
    }
    chatUnsub3();
    await signOut(auth);
    navigate("/login");
  };

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

  if (visibility) {
    document.getElementById("root").classList.add("h-[100dvh]");

    document.getElementById("root").classList.add("overflow-y-hidden");
  } else {
    document.getElementById("root").classList.remove("h-[100dvh]");

    document.getElementById("root").classList.remove("overflow-y-hidden");
  }

  const switchMode = () => {
    localStorage.setItem("mode", !mode);
    setMode(!mode);
  };

  return (
    <div
      className={`absolute top-0 right-0 h-screen w-full transition-all bg-blue-500 opacity-95 z-20 dark:bg-black text-white pt-40 md:hidden ${
        visibility ? "translate-x-0" : "translate-x-[100%]"
      }`}
    >
      <div className="w-[80%] mx-auto flex flex-col gap-10">
        <div className="flex w-full justify-center">
          {mode ? (
            <MdOutlineLightMode
              size={40}
              className="hover:text-gray-700 cursor-pointer dark:text-white"
              onClick={switchMode}
            />
          ) : (
            <HiOutlineMoon
              size={40}
              className="hover:text-gray-700 cursor-pointer"
              onClick={switchMode}
            />
          )}
        </div>
        <div
          className="text-3xl text-center"
          onClick={() => {
            navigate(`/profile/${userInfos.userName}`);
            closeFunc();
          }}
        >
          Profile
        </div>
        <div
          className="text-3xl text-center"
          onClick={() => {
            navigate(`/settings`);
            closeFunc();
          }}
        >
          Settings
        </div>
        <div className="text-3xl text-center" onClick={logOut}>
          Logout
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
