import React, { useContext, useState } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BiSolidDownArrow } from "react-icons/bi";
import { UserContext } from "../context/UserContext";
import { BsGear } from "react-icons/bs";
import { AiOutlineUser } from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { ChatContext } from "../context/ChatContext";
import { NotificationContext } from "../context/NotificationContext";

const ProfileBar = () => {
  const navigate = useNavigate();

  const [toggle, setToggle] = useState(false);
  const { userInfos, userUnsub1, userUnsub2 } = useContext(UserContext);
  const { notUnsub1 } = useContext(NotificationContext);
  const { dispatch, chatUnsub1, chatUnsub2, chatUnsub3 } =
    useContext(ChatContext);

  const toggleProfileMenu = () => {
    setToggle(!toggle);
  };

  const logOut = async () => {
    dispatch({ type: "REMOVE_USER" });
    userUnsub1();
    userUnsub2();
    notUnsub1();
    chatUnsub1();
    if (chatUnsub2 !== null) {
      chatUnsub2();
    }
    chatUnsub3();
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer relative max-sm:hidden"
      onClick={toggleProfileMenu}
    >
      <img
        src={userInfos?.profilePicture}
        className="rounded-full h-[35px] w-[35px]"
        alt=""
      />
      <div className="text-md dark:text-gray-300">{userInfos?.userName}</div>
      <BiSolidDownArrow size={14} className="dark:text-white" />
      <div
        className={`absolute top-9 right-0 overflow-hidden min-w-full ${
          toggle ? "" : "hidden"
        } bg-zinc-50 border-2 border-t-0 border-zinc-300 dark:border-gray-700 w-[75%]  rounded-b-lg dark:bg-black`}
      >
        <div
          className="hover:bg-gray-200 dark:hover:bg-[#1d1d1d] flex gap-2 items-center p-1 dark:text-gray-300"
          onClick={() => navigate(`/profile/${userInfos?.userName}`)}
        >
          <AiOutlineUser size={18} />
          Profile
        </div>
        <div
          className="hover:bg-gray-200 dark:hover:bg-[#1d1d1d]  flex gap-1 items-center p-1 dark:text-gray-300"
          onClick={() => navigate("/settings")}
        >
          <BsGear size={17} />
          Settings
        </div>
        <div
          className="hover:bg-gray-200 dark:hover:bg-[#1d1d1d]  flex gap-1 items-center p-1 dark:text-gray-300"
          onClick={logOut}
        >
          <BiLogOut size={18} />
          Log out
        </div>
      </div>
    </div>
  );
};

export default ProfileBar;
