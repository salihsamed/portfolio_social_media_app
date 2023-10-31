import React, { useContext, useEffect, useRef, useState } from "react";
import { MdPermMedia } from "react-icons/md";
import PostsContainer from "../components/PostsContainer";
import { UserContext } from "../context/UserContext";
import uploadImg from "../assets/cloud-upload-regular-240.png";
import { db, storage } from "../firebase/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { IoIosArrowDropupCircle } from "react-icons/io";
import { BiMessageRounded } from "react-icons/bi";
import ChatWindow from "../components/ChatWindow";
import { IoClose } from "react-icons/io5";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";
import FormData from "form-data";

const Home = () => {
  const wrapperRef = useRef(null);
  const imageRef = useRef(null);
  const { userInfos } = useContext(UserContext);
  const { counter } = useContext(ChatContext);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [warning, setWarning] = useState("");
  const [fileInputCheck, setFileInputCheck] = useState(false);
  const [scrollButtonVisible, setScrollButtonVisible] = useState(false);
  const [chatVisibility, setChatVisibility] = useState(false);
  const [fileLink, setFileLink] = useState("");

  const switchChatVisibility = () => {
    setChatVisibility(!chatVisibility);
  };

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

  const check = () => {
    setFileInputCheck(!fileInputCheck);
  };

  window.onscroll = () => {
    if (window.scrollY >= 1000) {
      setScrollButtonVisible(true);
    } else if (window.scrollY < 500) {
      setScrollButtonVisible(false);
    }
  };

  const handleClick = async () => {
    if (file === null && text === "") return;
    var postID = uuid();
    if (file !== null) {
      let data = new FormData();
      data.append("image", file);
      const config = {
        headers: { "content-type": "multipart/form-data" },
      };

      let response = await axios.post(
        "https://nsfw-check.onrender.com/check_nsfw",
        data,
        config
      );

      if (response.data[1].isSafe) {
        const fileRef = ref(storage, `postPictures/${postID}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          "state_changed",
          (snaphot) => {},
          (error) => {},
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                const docRef = doc(db, "posts", userInfos.userID);
                await updateDoc(docRef, {
                  [postID]: {
                    comments: [],
                    fileContent: downloadURL,
                    likes: [],
                    postID,
                    textContent: text,
                    userID: userInfos.userID,
                    timestamp: Timestamp.now(),
                  },
                });
              }
            );
          }
        );
      } else {
        setWarning("! You can't share explicit content.");
      }
    } else {
      const docRef = doc(db, "posts", userInfos.userID);
      await updateDoc(docRef, {
        [postID]: {
          comments: [],
          fileContent: "",
          likes: [],
          postID,
          textContent: text,
          userID: userInfos.userID,
          timestamp: Timestamp.now(),
        },
      });
    }

    setFile(null);
    setFileLink("");
    setText("");
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDragEnter = () => wrapperRef.current.classList.add("opacity-60");

  const onDragLeave = () => wrapperRef.current.classList.remove("opacity-60");

  const onDrop = () => wrapperRef.current.classList.remove("opacity-60");

  const onFileDrop = (e) => {
    const newFile = e.target.files[0];

    if (newFile.type.split("/")[0] !== "image") {
      setWarning("! You can only upload image files.");
      return 0;
    }

    if (newFile) {
      setFile(newFile);
      setWarning("");
      setFileLink(URL.createObjectURL(e.target.files[0]));
    }
  };

  const emptyFile = () => {
    setFile(null);
    setFileLink("");
    setWarning("");
  };

  return Object.keys(userInfos).length === 0 ? (
    <div>Loading</div>
  ) : (
    <div
      id="homeContainer"
      className="flex flex-col items-center sametInputBgColor dark:bg-black min-h-screen  pb-[10vh]"
    >
      <div className="flex-row xl:w-[40%] lg:w-[50%] md:w-[65%] max-md:w-[95%] bg-white dark:bg-black dark:border dark:border-gray-700 p-3 rounded-lg mt-5">
        <div className="flex-1 gap-5 flex">
          <div>
            <img
              src={userInfos.profilePicture}
              className="rounded-full h-[35px] w-[35px]"
              alt=""
            />
          </div>
          <div className="w-full">
            <input
              type="text"
              id="textInp"
              name="textInp"
              value={text}
              placeholder="What's on your mind..."
              className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400 w-full dark:bg-black dark:border-gray-600 dark:focus:border-gray-400 dark:text-white"
              onChange={(e) => setText(e.target.value)}
            />
            <div className={`${warning ? "" : "hidden"} text-red-500`}>
              {warning ? warning : ""}
            </div>

            <div
              ref={wrapperRef}
              className={`w-full transition-all overflow-hidden border-dashed border-2 border-blue-300 relative ${
                fileLink ? "" : "hover:opacity-60"
              } ${fileInputCheck ? "h-44 mt-2" : "h-0 border-none"}`}
              onDragEnter={() => {
                if (!fileLink) {
                  onDragEnter();
                }
              }}
              onDragLeave={() => {
                if (!fileLink) {
                  onDragLeave();
                }
              }}
              onDrop={() => {
                if (!fileLink) {
                  onDrop();
                }
              }}
            >
              <div
                className={`flex flex-col items-center justify-center h-full ${
                  fileLink ? "hidden" : ""
                }`}
              >
                <img
                  ref={imageRef}
                  src={uploadImg}
                  className="w-[100px] h-auto"
                  alt=""
                />
                <p className="dark:text-white">
                  {window.innerWidth > 767
                    ? "Drag & Drop your image here or Click to select"
                    : "Click to select the image"}
                </p>
              </div>
              <div className="flex w-full items-center h-44 pl-5">
                <div className="relative">
                  <img
                    src={fileLink}
                    className={`h-40 w-auto ${fileLink ? "" : "hidden"}`}
                  />
                  <IoClose
                    className="absolute right-0 top-0 text-red-500 text-3xl z-20 cursor-pointer hover:text-red-700"
                    onClick={emptyFile}
                  />
                </div>
              </div>
              <input
                type="file"
                value=""
                className={`absolute w-full h-full  top-0 left-0 ${
                  !fileLink
                    ? "cursor-pointer"
                    : "cursor-default pointer-events-none"
                } opacity-0`}
                onChange={onFileDrop}
              />
            </div>
            <div className="flex mt-2 justify-between">
              <div className="flex gap-1 items-center text-gray-500 hover:text-blue-500 w-[10%] ">
                <MdPermMedia
                  size={20}
                  className="text-gray-500 hover:text-blue-500 cursor-pointer dark:text-white "
                  onClick={check}
                />
              </div>

              <div className="items-center w-[60%] text-end">
                <button
                  type="submit"
                  className="px-4 py-1 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
                  onClick={handleClick}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostsContainer />

      <div className="fixed bottom-[50px] left-[30px]">
        <IoIosArrowDropupCircle
          size={35}
          className={`text-blue-500 hover:text-blue-600 cursor-pointer dark:text-white dark:hover:text-gray-300  ${
            scrollButtonVisible ? "block" : "hidden"
          }`}
          onClick={scrollTop}
        />
      </div>

      <div
        className={`fixed bottom-[50px] right-[30px] ${
          chatVisibility ? "hidden" : "block"
        }`}
      >
        <div className="relative">
          <BiMessageRounded
            size={30}
            className={` hover:text-gray-500 cursor-pointer dark:text-white`}
            onClick={switchChatVisibility}
          />
          <div
            className={`bg-red-500 rounded-full  absolute -top-1 -left-2 px-1 text-white text-xs font-semibold`}
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
          <div className="absolute right-1 top-3">
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
  );
};

export default Home;
