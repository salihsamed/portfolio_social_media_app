import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  Timestamp,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import { db } from "../firebase/firebase";

const Comment = ({ info, func, post }) => {
  const { userInfos } = useContext(UserContext);
  const navigate = useNavigate();
  const [commentPanelVisibility, setCommentPanelVisibility] = useState(false);
  const [commentDelInfo, setCommentDelInfo] = useState([]);
  const [editComInput, setEditComInput] = useState("");
  const [delPanel, setDelPanel] = useState(false);
  const [editCommentPanel, setEditCommentPanel] = useState(false);

  const toProfile = (name) => {
    navigate(`Profile/${name}`);
  };

  const openCommentPanel = (text, userID, commentID, postID) => {
    if (!commentPanelVisibility && !delPanel && !editCommentPanel) {
      setCommentPanelVisibility(true);
      setCommentDelInfo([text, userID, commentID, postID]);
      setEditComInput(text);
    } else if (delPanel || editCommentPanel) {
      setDelPanel(false);
      setEditCommentPanel(false);
    } else {
      setCommentPanelVisibility(false);
    }
  };

  const switchEditCommentPanel = () => {
    if (editCommentPanel) {
      setEditCommentPanel(!editCommentPanel);
      setCommentDelInfo([]);
    } else {
      setEditCommentPanel(!editCommentPanel);
      setCommentPanelVisibility(false);
    }
  };

  const editComment = async () => {
    const mergedString = commentDelInfo[2] + ".textContent";

    const commentRef = doc(db, "comments", userInfos.userID);
    await updateDoc(commentRef, {
      [mergedString]: editComInput,
    });

    func();
    switchEditCommentPanel();
  };

  const deleteComment = async () => {
    let comments = [];
    const docRef = doc(db, "posts", post.userID);
    const docSnap = await getDoc(docRef);
    setDelPanel(false);
    const notRef = doc(db, "notifications", post.userID);
    const notSnapshot = await getDoc(notRef);
    const unseenActions = notSnapshot.data().unseenActions;

    for (const element of Object.keys(docSnap.data())) {
      if (element === commentDelInfo[3]) {
        comments = docSnap.data()[element].comments;
      }
    }

    const mergedString = `${commentDelInfo[1]},${commentDelInfo[2]}`;
    const filteredArray = comments.filter((item) => item !== mergedString);
    const mergedActionString = `0,${info.userID},${info.commentID},${post.postID}`;

    const filteredAction = unseenActions.filter(
      (item) => item !== mergedActionString
    );

    await updateDoc(notRef, {
      unseenActions: filteredAction,
    });

    const docRef2 = doc(db, "comments", commentDelInfo[1]);

    const string = `${post.postID}.comments`;

    await updateDoc(docRef, {
      [string]: filteredArray,
    });

    await updateDoc(docRef2, {
      [commentDelInfo[2]]: deleteField(),
    });

    setCommentDelInfo([]);
  };

  const openDeleteCommentPanel = () => {
    setCommentPanelVisibility(false);
    setDelPanel(true);
  };

  const closeCommentPanel = () => {
    setCommentDelInfo([]);
    setDelPanel(false);
  };

  return (
    <div className="flex mb-1 py-1 gap-3 items-center w-full relative ">
      <img
        src={info.profilePicture}
        className="rounded-full h-[30px] w-[30px] cursor-pointer flex-grow-0"
        alt={info.userID}
        onClick={() => toProfile(info.userName)}
      />
      <div className="px-1 flex-1">
        <span
          className="text-sm font-bold cursor-pointer"
          onClick={() => toProfile(info.userName)}
        >
          {info.userName}
        </span>
        <div className="text-sm w-full break-all ">{info.textContent}</div>
        {userInfos.userID === info.userID ? (
          <div className="absolute right-0 top-0">
            <PiDotsThreeOutlineVerticalFill
              onClick={() =>
                openCommentPanel(
                  info.textContent,
                  info.userID,
                  info.commentID,
                  info.postID
                )
              }
              className="text-sm text-gray-800 cursor-pointer dark:text-gray-300"
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <div
        className={`absolute border top-4 right-2 bg-white z-10 rounded-l-md rounded-br-md dark:bg-black dark:border-gray-500 overflow-hidden  ${
          commentPanelVisibility ? "" : "hidden"
        }`}
      >
        <div
          className="flex px-2 pt-2 pb-1 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1d1d1d]"
          onClick={switchEditCommentPanel}
        >
          <AiOutlineEdit />
          <span>Edit</span>
        </div>
        <div
          className="flex px-2 pb-2 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1d1d1d] "
          onClick={openDeleteCommentPanel}
        >
          <MdDeleteOutline />
          <span>Delete</span>
        </div>
      </div>

      <div
        className={`absolute top-3 right-2 border p-2 rounded-l-lg rounded-br-lg  z-10 max-sm:w-[80vw]   bg-white dark:bg-black dark:border-gray-500 overflow-hidden ${
          delPanel ? "" : "hidden"
        }`}
      >
        <div className="text-center">
          Are u sure about to delete this comment ?
        </div>
        <div className="text-center break-all">{`"${commentDelInfo[0]}"`}</div>
        <div className="flex justify-between max-sm:w-full px-20 max-sm:px-5">
          <button
            className="text-white bg-blue-500 border px-2 py-1 rounded-md hover:bg-blue-600 dark:border-gray-300 dark:bg-black dark:hover:bg-[#1D1D1D]"
            onClick={deleteComment}
          >
            Delete
          </button>
          <button
            className="px-2 py-1 border rounded-md hover:bg-white bg-gray-50 dark:border-gray-300 dark:bg-black dark:hover:bg-[#1D1D1D]"
            onClick={closeCommentPanel}
          >
            Cancel
          </button>
        </div>
      </div>

      <div
        className={`absolute top-3 right-2 border  rounded-l-lg rounded-br-lg w-[50%] max-sm:w-[80vw]  z-10   bg-white dark:bg-black ${
          editCommentPanel ? "" : "hidden"
        }`}
      >
        <div className="text-center py-4 text-gray-600 font-semibold text-sm dark:text-white">
          Edit the comment
        </div>
        <div className="text-center">
          <input
            type="text"
            value={editComInput}
            onChange={(e) => setEditComInput(e.target.value)}
            className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400 w-[90%] dark:border-gray-600 dark:focus:border-gray-200 dark:text-white"
          />
        </div>
        <div className="flex gap-2 justify-center items-center py-5">
          <button
            className="text-white bg-blue-500 border px-2 py-1 rounded-md hover:bg-blue-600 dark:border-gray-300 dark:bg-black dark:hover:bg-[#1D1D1D]"
            onClick={editComment}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 border rounded-md hover:bg-white bg-gray-50 dark:border-gray-300 dark:bg-black dark:hover:bg-[#1D1D1D]"
            onClick={switchEditCommentPanel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment;
