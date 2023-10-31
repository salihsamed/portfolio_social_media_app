import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePostsContainer from "../components/ProfilePostsContainer";
import { UserContext } from "../context/UserContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { ClipLoader } from "react-spinners";
import { Tooltip } from "@mui/material";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { LuUserPlus, LuUserMinus, LuUser } from "react-icons/lu";
import { TbMessage } from "react-icons/tb";
import { BiMessageRounded } from "react-icons/bi";
import ChatWindow from "../components/ChatWindow";
import { IoClose } from "react-icons/io5";
import FriendsModal from "../components/FriendsModal";
import { AiFillLock, AiOutlineEdit } from "react-icons/ai";
import { ChatContext } from "../context/ChatContext";
import EditProfileModal from "../components/EditProfileModal";

const Profile = () => {
  const { userName } = useParams();
  const { userInfos } = useContext(UserContext);
  const { counter } = useContext(ChatContext);
  const [profile, setProfile] = useState({});
  const colRef = collection(db, "users");
  const [status, setStatus] = useState();
  const [postCount, setPostCount] = useState();
  const [friendCount, setFriendCount] = useState();
  const [commonFriendCount, setCommonFriendCount] = useState(0);
  const [visibleCommonFriend, setVisibleCommonFriend] = useState([]);
  const [scrollButtonVisible, setScrollButtonVisible] = useState(false);
  const [removeFriendIconVisibility, setRemoveFriendIconVisibility] =
    useState(false);
  const [chatVisibility, setChatVisibility] = useState(false);
  const [friendModalVisibility, setFriendModalVisibility] = useState(false);
  const [friends, setFriends] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [canSeeProfile, setCanSeeProfile] = useState(false);
  const [editProfilePanelVisibility, SetEditProfilePanelVisibility] =
    useState(false);
  const { dispatch } = useContext(ChatContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 767) {
      if (chatVisibility) {
        document.getElementById("root").classList.add("h-[100dvh]");

        document.getElementById("root").classList.add("overflow-y-hidden");
      } else {
        document.getElementById("root").classList.remove("h-[100dvh]");

        document.getElementById("root").classList.remove("overflow-y-hidden");
      }
    }
  }, [chatVisibility]);

  useEffect(() => {
    setCanSeeProfile(false);
    getUserID();
  }, [userName]);

  useEffect(() => {
    if (Object.keys(userInfos).length > 0 && Object.keys(profile).length > 0) {
      getInfo();
      getFriendsCount();
      getCommonFriends();
      getPostsCount();
    }
  }, [userInfos, profile]);

  window.onscroll = () => {
    if (window.scrollY >= 1000) {
      setScrollButtonVisible(true);
    } else if (window.scrollY < 500) {
      setScrollButtonVisible(false);
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchChatVisibility = () => {
    setChatVisibility(!chatVisibility);
  };

  const getUserID = async () => {
    const q = query(colRef, where("userName", "==", userName));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((document) => {
      setProfile(document.data());
    });
  };

  const getInfo = async () => {
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);

    const snapshot = await getDoc(docRef2);

    if (profile.userID === userInfos.userID) {
      setCanSeeProfile(true);
    }

    if (snapshot.data().friendList.includes(profile.userID)) {
      setStatus(0);
      setCanSeeProfile(true);
    } else if (snapshot.data().sendedFriendRequest.includes(profile.userID)) {
      setStatus(1);
      if (profile.private === "no") {
        setCanSeeProfile(true);
      }
    } else if (snapshot.data().receivedFriendRequest.includes(profile.userID)) {
      setStatus(2);
      if (profile.private === "no") {
        setCanSeeProfile(true);
      }
    } else {
      setStatus(3);
      if (profile.private === "no") {
        setCanSeeProfile(true);
      }
    }
  };

  const getCommonFriends = async () => {
    if (profile.userID === userInfos.userID) return;

    const commonElements = [];
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);
    const snapshot = await getDoc(docRef);
    const snapshot2 = await getDoc(docRef2);
    const profileFriendList = snapshot.data().friendList;
    const userFriendList = snapshot2.data().friendList;

    for (const element of profileFriendList) {
      if (userFriendList.includes(element)) {
        commonElements.push(element);
      }
    }

    setCommonFriendCount(commonElements.length);
    var visibleCommonFriendCounts = 0;

    if (commonElements.length >= 2) {
      visibleCommonFriendCounts = 2;
    }
    if (commonElements.length === 1) {
      visibleCommonFriendCounts = 1;
    }

    if (visibleCommonFriendCounts) {
      const tempArr = commonElements.slice(0, visibleCommonFriendCounts);
      const tempArr2 = [];
      for (const element of tempArr) {
        const docRef = doc(db, "users", `${element}`);
        const snapshot = await getDoc(docRef);
        tempArr2.push(snapshot.data());
      }

      setVisibleCommonFriend(tempArr2);
    }
  };

  const getFriendsCount = async () => {
    const docRef = doc(db, "friends", `${profile.userID}`);
    const snapshot = await getDoc(docRef);
    setFriendCount(snapshot.data().friendList.length);
  };

  const getPostsCount = async () => {
    const docRef = doc(db, "posts", `${profile.userID}`);
    const snapshot = await getDoc(docRef);
    setPostCount(Object.keys(snapshot.data()).length);
  };

  const addFriend = async () => {
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);
    const notRef = doc(db, "notifications", profile.userID);
    const notSnapshot = await getDoc(notRef);
    const unseenActions = notSnapshot.data().unseenActions;

    const snapshot = await getDoc(docRef);
    const receivedRequestsArray = snapshot.data().receivedFriendRequest;
    receivedRequestsArray.push(userInfos.userID);

    const snapshot2 = await getDoc(docRef2);
    const sendedRequestsArray = snapshot2.data().sendedFriendRequest;
    sendedRequestsArray.push(profile.userID);

    const mergedActionString = `2,${userInfos.userID}`;
    unseenActions.push(mergedActionString);

    await updateDoc(notRef, {
      unseenActions,
    });

    await updateDoc(docRef, {
      receivedFriendRequest: receivedRequestsArray,
    });

    await updateDoc(docRef2, {
      sendedFriendRequest: sendedRequestsArray,
    });

    getInfo();
  };

  const cancelRequest = async () => {
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);
    const notRef = doc(db, "notifications", profile.userID);
    const notSnapshot = await getDoc(notRef);
    const unseenActions = notSnapshot.data().unseenActions;
    const mergedActionString = `2,${userInfos.userID}`;
    const filteredUnseenActions = unseenActions.filter(
      (item) => item !== mergedActionString
    );

    const snapshot = await getDoc(docRef);
    const arr1 = snapshot.data().receivedFriendRequest;
    for (let i = arr1.length - 1; i >= 0; i--) {
      if (arr1[i] === userInfos.userID) {
        arr1.splice(i, 1);
      }
    }
    const snapshot2 = await getDoc(docRef2);
    const arr2 = snapshot2.data().sendedFriendRequest;
    for (let i = arr2.length - 1; i >= 0; i--) {
      if (arr2[i] === profile.userID) {
        arr2.splice(i, 1);
      }
    }

    await updateDoc(docRef, {
      receivedFriendRequest: arr1,
    });

    await updateDoc(docRef2, {
      sendedFriendRequest: arr2,
    });

    await updateDoc(notRef, {
      unseenActions: filteredUnseenActions,
    });

    getInfo();
  };

  const removeFriend = async () => {
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);

    const snapshot = await getDoc(docRef);
    const arr1 = snapshot.data().friendList;
    const snapshot2 = await getDoc(docRef2);
    const arr2 = snapshot2.data().friendList;
    for (let i = arr1.length - 1; i >= 0; i--) {
      if (arr1[i] === userInfos.userID) {
        arr1.splice(i, 1);
      }
    }
    for (let i = arr2.length - 1; i >= 0; i--) {
      if (arr2[i] === profile.userID) {
        arr2.splice(i, 1);
      }
    }

    await updateDoc(docRef, {
      friendList: arr1,
    });

    await updateDoc(docRef2, {
      friendList: arr2,
    });

    getInfo();
    getFriendsCount();
  };

  const acceptRequest = async () => {
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);
    const notRef = doc(db, "notifications", profile.userID);
    const notSnapshot = await getDoc(notRef);
    const unseenActions = notSnapshot.data().unseenActions;
    const mergedActionString = `3,${userInfos.userID}`;
    unseenActions.push(mergedActionString);

    const snapshot = await getDoc(docRef);
    const arr1 = snapshot.data();
    const snapshot2 = await getDoc(docRef2);
    const arr2 = snapshot2.data();
    const arr1_sended = arr1.sendedFriendRequest.filter(
      (item) => item !== userInfos.userID
    );
    const arr2_received = arr2.receivedFriendRequest.filter(
      (item) => item !== profile.userID
    );
    arr1.friendList.push(userInfos.userID);
    arr2.friendList.push(profile.userID);

    await updateDoc(docRef, {
      friendList: arr1.friendList,
      sendedFriendRequest: arr1_sended,
    });

    await updateDoc(docRef2, {
      friendList: arr2.friendList,
      receivedFriendRequest: arr2_received,
    });

    await updateDoc(notRef, {
      unseenActions,
    });

    getInfo();
    getFriendsCount();
  };

  const sendMessage = async () => {
    setChatVisibility(true);

    const user = {
      userID: profile.userID,
      displayName: profile.displayName,
      profilePicture: profile.profilePicture,
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

        dispatch({ type: "CHANGE_USER", payload: user });
      } else {
        dispatch({ type: "CHANGE_USER", payload: user });
      }
    } catch (err) {}
  };

  const declineRequest = async () => {
    const docRef = doc(db, "friends", profile.userID);
    const docRef2 = doc(db, "friends", userInfos.userID);
    const snapshot = await getDoc(docRef);
    const snapshot2 = await getDoc(docRef2);
    var sended = snapshot.data().sendedFriendRequest;
    var received = snapshot2.data().receivedFriendRequest;
    received = received.filter((item) => item !== profile.userID);
    sended = sended.filter((item) => item !== userInfos.userID);

    await updateDoc(docRef, {
      sendedFriendRequest: sended,
    });

    await updateDoc(docRef2, {
      receivedFriendRequest: received,
    });

    getInfo();
  };

  const toProfile = (name) => {
    navigate(`/Profile/${name}`);
  };

  const showMutualFriends = async () => {
    setFriendModalVisibility(true);
    setModalTitle("Common Friends");

    const commonElements = [];
    const docRef = doc(db, "friends", `${profile.userID}`);
    const docRef2 = doc(db, "friends", `${userInfos.userID}`);
    const snapshot = await getDoc(docRef);
    const snapshot2 = await getDoc(docRef2);
    const profileFriendList = snapshot.data().friendList;
    const userFriendList = snapshot2.data().friendList;

    for (const element of profileFriendList) {
      if (userFriendList.includes(element)) {
        commonElements.push(element);
      }
    }

    const tempArr = [];
    for (const element of commonElements) {
      const docRef = doc(db, "users", `${element}`);
      const snapshot = await getDoc(docRef);
      tempArr.push(snapshot.data());
    }

    setFriends(tempArr);
  };

  const closeModal = () => {
    setFriends([]);
    setFriendModalVisibility(false);
  };

  const showFriends = async () => {
    if (!canSeeProfile) return 0;

    setFriendModalVisibility(true);
    setModalTitle("All Friends");

    const docRef = doc(db, "friends", `${profile.userID}`);
    const snapshot = await getDoc(docRef);
    const profileFriendList = snapshot.data().friendList;

    const tempArr = [];
    for (const element of profileFriendList) {
      const docRef = doc(db, "users", `${element}`);
      const snapshot = await getDoc(docRef);
      tempArr.push(snapshot.data());
    }

    setFriends(tempArr);
  };

  const openEditProfilePanel = () => {
    SetEditProfilePanelVisibility(true);
  };

  const closeEditProfilePanel = () => {
    SetEditProfilePanelVisibility(false);
  };

  return (
    <div className="sametInputBgColor min-h-screen dark:bg-black pb-[10vh]">
      {Object.keys(userInfos).length === 0 ? (
        <div>Loading...</div>
      ) : (
        <div className="xl:w-[40%] lg:w-[50%] md:w-[65%] max-md:w-[95%] mx-auto pt-6">
          <div
            id="profileHead"
            className="bg-white  rounded-lg relative dark:text-white dark:bg-black dark:border dark:border-gray-700"
          >
            <div className="flex flex-col">
              <div>
                <img
                  src={profile.bannerPhoto}
                  alt=""
                  className="h-[220px] w-full rounded-t-lg"
                />
              </div>

              <div className="flex-1 px-2 -mt-20">
                <div className="flex">
                  <img
                    src={profile.profilePicture}
                    alt=""
                    className="h-[130px] w-[130px] rounded-full border border-black"
                  />
                  <div
                    className={`flex items-end justify-end flex-1 gap-2 ${
                      profile.userID === userInfos.userID ? "hidden" : ""
                    }`}
                  >
                    <Tooltip title="Send a message">
                      <div onClick={sendMessage}>
                        <TbMessage size={25} className="cursor-pointer" />
                      </div>
                    </Tooltip>
                    {status === 0 ? (
                      <Tooltip
                        title="Remove from friends"
                        className="cursor-pointer"
                      >
                        <div
                          onMouseOver={() => {
                            setRemoveFriendIconVisibility(true);
                          }}
                          onMouseOut={() => {
                            setRemoveFriendIconVisibility(false);
                          }}
                        >
                          {removeFriendIconVisibility ? (
                            <LuUserMinus size={25} onClick={removeFriend} />
                          ) : (
                            <LuUser size={25} />
                          )}
                        </div>{" "}
                      </Tooltip>
                    ) : (
                      ""
                    )}
                    {status === 1 ? (
                      <button
                        className="px-1 py-1  rounded-lg  text-gray-800 font-semibold border border-gray-600 dark:text-white"
                        onClick={cancelRequest}
                      >
                        Requested
                      </button>
                    ) : (
                      ""
                    )}
                    {status === 2 ? (
                      <div className="flex gap-2">
                        <button
                          className="border px-1 border-gray-600 rounded-lg font-semibold text-gray-800 dark:text-white"
                          onClick={declineRequest}
                        >
                          Decline
                        </button>
                        <button
                          className="text-white  px-1 py-1 rounded-lg bg-blue-500 font-semibold"
                          onClick={acceptRequest}
                        >
                          Accept Request
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                    {status === 3 ? (
                      <Tooltip title="Add friend">
                        <div>
                          <LuUserPlus
                            size={25}
                            onClick={addFriend}
                            className="cursor-pointer"
                          />
                        </div>
                      </Tooltip>
                    ) : (
                      ""
                    )}
                  </div>

                  <div
                    className={`flex-1 flex justify-end items-end ${
                      profile.userID !== userInfos.userID ? "hidden" : ""
                    }`}
                  >
                    <Tooltip title="Edit the profile">
                      <div>
                        <AiOutlineEdit
                          className="text-2xl cursor-pointer"
                          onClick={openEditProfilePanel}
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div className="text-2xl font-bold">{profile.displayName}</div>
                <div>@{profile.userName}</div>

                <div className="mt-2">
                  <div>{profile.biography}</div>
                </div>

                <div className="flex gap-5 mt-2 pb-2">
                  <div>
                    <span className="font-bold">{postCount}</span>
                    {postCount > 1 ? " Posts" : " Post"}
                  </div>
                  <div>
                    <div className="cursor-pointer mb-3" onClick={showFriends}>
                      <span className="font-bold">{friendCount}</span>
                      {friendCount > 1 ? " Friends" : " Friend"}
                    </div>
                    {commonFriendCount == 1 &&
                    visibleCommonFriend.length > 0 ? (
                      <div>
                        <img
                          src={visibleCommonFriend[0]?.profilePicture}
                          className="h-[25px] w-[25px] rounded-full inline-block"
                        />
                        <span
                          className="font-bold cursor-pointer"
                          onClick={() =>
                            toProfile(visibleCommonFriend[0].userName)
                          }
                        >
                          {visibleCommonFriend[0].userName}
                        </span>{" "}
                        is a mutual friend.
                      </div>
                    ) : (
                      ""
                    )}
                    {commonFriendCount == 2 &&
                    visibleCommonFriend.length > 0 ? (
                      <div>
                        <img
                          src={visibleCommonFriend[0]?.profilePicture}
                          className="h-[25px] w-[25px] rounded-full inline-block relative z-[1]"
                        />
                        <img
                          src={visibleCommonFriend[1]?.profilePicture}
                          className="h-[25px] w-[25px] rounded-full inline-block -ml-2"
                        />
                        <span
                          className="font-bold cursor-pointer"
                          onClick={() =>
                            toProfile(visibleCommonFriend[0].userName)
                          }
                        >
                          {" "}
                          {visibleCommonFriend[0]?.userName}
                        </span>{" "}
                        and{" "}
                        <span
                          className="font-bold cursor-pointer"
                          onClick={() =>
                            toProfile(visibleCommonFriend[1].userName)
                          }
                        >
                          {visibleCommonFriend[1]?.userName}
                        </span>{" "}
                        are mutual friends.
                      </div>
                    ) : (
                      ""
                    )}
                    {commonFriendCount > 2 && visibleCommonFriend.length > 0 ? (
                      <div>
                        <img
                          src={visibleCommonFriend[0]?.profilePicture}
                          className="h-[25px] w-[25px] rounded-full inline-block relative z-[1]"
                        />
                        <img
                          src={visibleCommonFriend[1]?.profilePicture}
                          className="h-[25px] w-[25px] rounded-full inline-block -ml-2"
                        />
                        <span
                          className="font-bold cursor-pointer"
                          onClick={() =>
                            toProfile(visibleCommonFriend[0].userName)
                          }
                        >
                          {" "}
                          {visibleCommonFriend[0]?.userName}
                        </span>
                        ,
                        <span
                          className="font-bold cursor-pointer"
                          onClick={() =>
                            toProfile(visibleCommonFriend[1].userName)
                          }
                        >
                          {visibleCommonFriend[1]?.userName}
                        </span>{" "}
                        and{" "}
                        <span
                          className="font-bold cursor-pointer"
                          onClick={showMutualFriends}
                        >
                          {commonFriendCount - visibleCommonFriend.length} other
                        </span>{" "}
                        mutual friends.
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            {friendModalVisibility && (
              <FriendsModal
                infos={friends}
                closeFunc={closeModal}
                title={modalTitle}
              />
            )}

            {editProfilePanelVisibility && (
              <EditProfileModal
                closeFunc={closeEditProfilePanel}
                userInfos={userInfos}
                refreshInfo={getUserID}
              />
            )}
          </div>

          {profile.userID === undefined ? (
            <ClipLoader loading color="#3b82f6" size={30} />
          ) : canSeeProfile ? (
            <ProfilePostsContainer userID={profile.userID} />
          ) : (
            <div className="flex items-center gap-2 mt-2 dark:text-white">
              <AiFillLock className="text-xl dark:text-white" />
              Sorry, this profile is private.
            </div>
          )}

          <div className="fixed bottom-[50px] left-[30px]">
            <IoIosArrowDropupCircle
              size={35}
              className={`text-blue-500 hover:text-blue-600 cursor-pointer  ${
                scrollButtonVisible ? "block" : "hidden"
              }  dark:text-white dark:hover:text-gray-300`}
              onClick={scrollTop}
            />
          </div>

          <div className="fixed bottom-[50px] right-[30px]">
            <div className="relative">
              <BiMessageRounded
                size={30}
                className={` hover:text-gray-500 cursor-pointer dark:text-gray-300`}
                onClick={switchChatVisibility}
              />
              <div
                className={`bg-red-500 rounded-full  absolute -top-2 -left-2 p-1 text-white text-xs font-semibold`}
              >
                {counter}
              </div>
            </div>
          </div>

          <div
            className={`fixed bottom-[0] right-[0px] z-20 ${
              chatVisibility ? "block" : "hidden"
            }`}
          >
            <div className="relative">
              <div className="absolute right-1 top-2">
                <IoClose
                  className="text-white cursor-pointer"
                  size={23}
                  onClick={switchChatVisibility}
                />
              </div>
              <ChatWindow />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
