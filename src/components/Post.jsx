import {
  Timestamp,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { BiLike } from "react-icons/bi";
import { auth, db, storage } from "../firebase/firebase";
import { BiComment } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { UserContext } from "../context/UserContext";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import Comment from "./Comment";
import FriendsModal from "./FriendsModal";
import FormData from "form-data";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";

const Post = ({ post }) => {
  const [pp, setPP] = useState("");
  const [name, setName] = useState("");
  const [likes, setLikes] = useState([]);
  const [likeInfos, setLikeInfos] = useState([]);
  const [prevLikes, setPrevLikes] = useState([]);
  const [likeColor, setLikeColor] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [commentContent, setCommentContent] = useState([]);
  const [viewComment, setViewComment] = useState(false);
  const { userInfos } = useContext(UserContext);
  const postRef = collection(db, "posts");
  const docRef = doc(db, "posts", post.userID);
  const docRef2 = doc(db, "comments", userInfos.userID);
  const q = query(postRef, where(`${post.postID}.postID`, "==", post.postID));
  const commentInputRef = useRef();
  const navigate = useNavigate();
  const [postPanelVisibility, setPostPanelVisibility] = useState(false);
  const [delPostPanel, setDelPostPanel] = useState(false);
  const [editPostPanel, setEditPostPanel] = useState(false);
  const [commentText, setCommentText] = useState(true);
  const [commentList, setCommentList] = useState([]);
  const [editPostInput, setEditPostInput] = useState("");
  const [fileLink, setFileLink] = useState(post.fileContent);
  const [editFile, setEditFile] = useState(null);
  const reference = useRef(null);
  const [likesPanelVisibility, setLikesPanelVisibility] = useState(false);
  const [warning, setWarning] = useState("");
  const [text, setText] = useState(post.textContent);
  const [image, setImage] = useState(post.fileContent);

  useEffect(() => {
    const unSub = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        Object.values(doc.data()).forEach((element) => {
          if (element.postID === post.postID) {
            commentProcess(element.comments);
            setCommentList(element.comments);
            setLikes(element.likes);
            setLikeCount(element.likes.length);
            setCommentCount(element.comments.length);
            setText(element.textContent);
            setImage(element.fileContent);
          }
        });
      });
    });

    return () => {
      unSub();
    };
  }, []);

  useEffect(() => {
    if (Object.keys(userInfos).length > 0) {
      getProfilePic();
      setFirstLikeColor();
    }
  }, [userInfos]);

  function toDateTime(secs) {
    var t = new Date(1970, 0, 1);
    t.setSeconds(secs + 3 * 60 * 60);

    let year = t.getFullYear();
    let month = t.getMonth() + 1;
    let day = t.getDate();

    let hours = t.getHours().toString();
    let minutes = t.getMinutes().toString();

    return (
      less10(day) +
      "." +
      less10(month) +
      "." +
      year +
      " " +
      hours.padStart(2, "0") +
      ":" +
      minutes.padStart(2, "0")
    );
  }

  function less10(time) {
    return time < 10 ? "0" + time : time;
  }

  const setFirstLikeColor = async () => {
    const querySnapshot = await getDocs(q);
    var likes = [];
    querySnapshot.forEach((doc) => {
      Object.keys(doc.data()).forEach((key) => {
        if (doc.data()[key].postID === post.postID) {
          likes = doc.data()[key].likes;
        }
      });
    });

    if (likes.includes(userInfos.userID)) {
      setLikeColor(true);
    } else {
      setLikeColor(false);
    }
  };

  const commentProcess = async (deneme = commentList) => {
    var contentArray = [];

    for (const element of deneme) {
      const userID_ = element.split(",")[0];
      const commentID_ = element.split(",")[1];

      const userDocRef = doc(db, "users", userID_);
      const userDocRefSnap = await getDoc(userDocRef);
      const commentUserInfo = userDocRefSnap.data();
      const commentDocRef = doc(db, "comments", userID_);
      const commentDocRefSnap = await getDoc(commentDocRef);
      const commentContentInfo = commentDocRefSnap.data()[commentID_];

      const arrayObject = {
        userID: commentUserInfo.userID,
        userName: commentUserInfo.userName,
        profilePicture: commentUserInfo.profilePicture,
        textContent: commentContentInfo.textContent,
        date: toDateTime(commentContentInfo.date.seconds),
        commentID: commentID_,
        postID: commentContentInfo.postID,
      };
      contentArray.push(arrayObject);
    }

    setCommentContent(contentArray);
  };

  const openCommentSection = async () => {
    if (viewComment === false) {
      setViewComment(!viewComment);
      setCommentText(false);
    } else {
      setViewComment(!viewComment);
      setTimeout(() => {
        setCommentText(true);
      }, 300);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && event.target.value) {
      comment(event.target.value);
    }
  };

  const handleClick = (val) => {
    if (val) {
      comment(val);
    }
  };

  const comment = async (textContent) => {
    const commentRef = doc(db, "comments", userInfos.userID);
    const notificiationRef = doc(db, "notifications", post.userID);
    const commentID = uuid();
    if (post.userID !== userInfos.userID) {
      const notSnapshot = await getDoc(notificiationRef);
      const unseenActions = notSnapshot.data().unseenActions;
      const mergedActionString = `0,${userInfos.userID},${commentID},${post.postID}`;
      unseenActions.push(mergedActionString);
      await updateDoc(notificiationRef, {
        unseenActions,
      });
    }

    const mergedString = `${userInfos.userID},${commentID}`;

    const querySnapshot = await getDocs(q);
    var comments = [];
    querySnapshot.forEach((doc) => {
      Object.values(doc.data()).forEach((element) => {
        if (element.postID === post.postID) {
          comments = element.comments;
        }
      });
    });
    comments.push(mergedString);

    const string = `${post.postID}.comments`;

    await updateDoc(commentRef, {
      [commentID]: {
        textContent: textContent,
        userID: userInfos.userID,
        date: Timestamp.now(),
        postID: post.postID,
      },
    });

    await updateDoc(docRef, {
      [string]: comments,
    });

    commentInputRef.current.value = "";
  };

  const getProfilePic = async () => {
    const docRef = doc(db, "users", post.userID);
    const docSnap = await getDoc(docRef);
    setPP(docSnap.data().profilePicture);
    setName(docSnap.data().userName);
  };

  const like = async () => {
    const querySnapshot = await getDocs(q);
    var likes = [];

    querySnapshot.forEach((element) => {
      likes = element.data()[post.postID].likes;
    });

    const docRef2 = doc(db, "notifications", post.userID);
    const snapshot = await getDoc(docRef2);
    const unseenActions = snapshot.data().unseenActions;
    const likeTimestampArr = snapshot.data().likeTimestamp;
    const mergedString = `1,${userInfos.userID},${post.postID}`;

    if (likes.includes(userInfos.userID)) {
      if (unseenActions.includes(mergedString)) {
        const tempArr = unseenActions.filter((val) => val !== mergedString);
        const tempArr2 = likeTimestampArr.filter(
          (comment) => Object.keys(comment)[0] !== mergedString
        );
        await updateDoc(docRef2, {
          unseenActions: tempArr,
          likeTimestamp: tempArr2,
        });
      }

      const indexToDelete = likes.indexOf(userInfos.userID);
      likes.splice(indexToDelete, 1);
      setLikeColor(false);
      setLikeCount(likes.length);
    } else {
      const likeObject = {
        [mergedString]: Timestamp.now(),
      };
      likeTimestampArr.push(likeObject);
      unseenActions.push(mergedString);
      likes.push(userInfos.userID);
      setLikeColor(true);
      setLikeCount(likes.length);
      await updateDoc(docRef2, {
        unseenActions,
        likeTimestamp: likeTimestampArr,
      });
    }

    const string = `${post.postID}.likes`;
    await updateDoc(docRef, {
      [string]: likes,
    });
  };

  const toProfile = (name) => {
    navigate(`Profile/${name}`);
  };

  const switchPostPanelVisibility = () => {
    if (!postPanelVisibility) {
      setEditPostInput(post.textContent);
      setFileLink(post.fileContent);
    }

    setPostPanelVisibility(!postPanelVisibility);
  };

  const closeDelPostPanel = () => {
    setDelPostPanel(false);
  };

  const openDelPostPanel = () => {
    setDelPostPanel(true);
    setPostPanelVisibility(!postPanelVisibility);
  };

  const deletePost = async () => {
    const snapshot = await getDoc(docRef);
    const comments = snapshot.data()[post.postID].comments;

    for (let element of comments) {
      let userID = element.split(",")[0];
      let commentID = element.split(",")[1];
      let delDocRef = doc(db, "comments", userID);
      await updateDoc(delDocRef, {
        [commentID]: deleteField(),
      });
    }

    if (post.fileContent !== "") {
      const delImgRef = ref(storage, `postPictures/${post.postID}`);
      deleteObject(delImgRef);
    }

    await updateDoc(docRef, {
      [post.postID]: deleteField(),
    });
  };

  const switchEditPostPanel = () => {
    if (postPanelVisibility) {
      setPostPanelVisibility(false);
    }

    if (editPostPanel) {
      reference.current.value = null;
      setEditFile(null);
    }
    setEditPostPanel(!editPostPanel);
  };

  const editPost = async () => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    if (post.fileContent === fileLink && post.textContent === editPostInput) {
      return;
    } else if (
      post.fileContent === fileLink &&
      post.textContent !== editPostInput
    ) {
      const mergedString = `${post.postID}.textContent`;

      await updateDoc(docRef, {
        [mergedString]: editPostInput,
      });

      switchEditPostPanel();
    } else if (
      post.fileContent !== fileLink &&
      post.textContent === editPostInput
    ) {
      let data = new FormData();
      data.append("image", editFile);

      let response = await axios.post(
        "https://nsfw-check.onrender.com/check_nsfw",
        data,
        config
      );

      if (!response.data[1].isSafe) {
        setWarning("You can't upload explicit content !");
        return 0;
      }

      const fileRef = ref(storage, `postPictures/${post.postID}`);
      const uploadTask = uploadBytesResumable(fileRef, editFile);

      uploadTask.on(
        "state_changed",
        (snaphot) => {},
        (error) => {},
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            const mergedString = `${post.postID}.fileContent`;

            await updateDoc(docRef, {
              [mergedString]: downloadURL,
            });
          });
        }
      );

      switchEditPostPanel();
    } else {
      let data = new FormData();
      data.append("image", editFile);

      let response = await axios.post(
        "https://nsfw-check.onrender.com/check_nsfw",
        data,
        config
      );

      if (!response.data[1].isSafe) {
        setWarning("You can't upload explicit content !");
        return 0;
      }

      const fileRef = ref(storage, `postPictures/${post.postID}`);
      const uploadTask = uploadBytesResumable(fileRef, editFile);

      uploadTask.on(
        "state_changed",
        (snaphot) => {},
        (error) => {},
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            const mergedString = `${post.postID}.fileContent`;
            const mergedString2 = `${post.postID}.textContent`;

            await updateDoc(docRef, {
              [mergedString]: downloadURL,
            });

            await updateDoc(docRef, {
              [mergedString2]: editPostInput,
            });
          });
        }
      );

      switchEditPostPanel();
    }
  };

  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  function handleChange(e) {
    setWarning("");
    setFileLink(URL.createObjectURL(e.target.files[0]));
    setEditFile(e.target.files[0]);
  }

  const openLikesPanel = async () => {
    setLikesPanelVisibility(true);
    const tempArr = [];
    var bool = false;

    if (prevLikes.length > 0) {
      bool = arraysAreEqual(likes, prevLikes);
    }

    if (!bool) {
      for (const element of likes) {
        const docRef = doc(db, "users", element);
        const snapshot = await getDoc(docRef);
        const tempObj = snapshot.data();
        tempArr.push(tempObj);
      }

      setPrevLikes(likes);
      setLikeInfos(tempArr);
    }
  };

  return (
    <div
      className={`border bg-white dark:bg-black dark:text-white dark:border-gray-700 rounded-lg relative `}
    >
      <div
        className={`flex justify-between ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        <div
          className="flex items-center gap-1 mb-2 p-2 cursor-pointer"
          onClick={() => toProfile(name)}
        >
          <img src={pp} alt="" className="rounded-full h-[35px] w-[35px]" />
          <span className="font-bold text-lg">{name}</span>
        </div>
        {userInfos.userID === post.userID && (
          <div className="py-4 px-2 relative">
            <PiDotsThreeOutlineVerticalFill
              className="text-lg text-gray-800 cursor-pointer dark:text-white"
              onClick={switchPostPanelVisibility}
            />
            {postPanelVisibility && (
              <div className="absolute bg-white border  md:left-4 max-md:right-4 rounded-md dark:bg-black overflow-hidden">
                <div
                  className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#1D1D1D] cursor-pointer px-2 py-1"
                  onClick={switchEditPostPanel}
                >
                  <AiOutlineEdit />
                  <span>Edit</span>
                </div>
                <div
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer dark:hover:bg-[#1D1D1D]"
                  onClick={openDelPostPanel}
                >
                  <MdDeleteOutline />
                  <span>Delete</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex justify-center ${image === "" ? "hidden" : ""}  ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        <img src={image} alt="" className="w-full h-auto" />
      </div>
      <p
        className={`mb-2 px-2 ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        <span
          className={`font-semibold ${post.fileContent === "" ? "hidden" : ""}`}
        >
          {name}&nbsp;
        </span>
        {text}
      </p>

      <div
        className={`flex gap-1 px-2 ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        <BiLike
          size={23}
          className={`${
            likeColor
              ? "text-blue-500 dark:text-blue-500 "
              : "text-gray-500 dark:text-gray-200 "
          }hover:text-blue-500 cursor-pointer  dark:hover:text-blue-500`}
          onClick={like}
        />
        <BiComment
          size={23}
          className="text-gray-500 hover:text-blue-500 cursor-pointer dark:text-gray-200 dark:hover:text-blue-500"
          onClick={openCommentSection}
        />
      </div>

      <span
        className={`block px-2 font-bold  ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        <span className="cursor-pointer" onClick={openLikesPanel}>{`${
          likeCount ? `${likeCount}${likeCount > 1 ? " likes" : " like"}` : ""
        }`}</span>
      </span>
      <span
        className={`px-2 mb-2 cursor-pointer ${
          !commentText ? "hidden " : "block "
        }   ${delPostPanel || editPostPanel ? "opacity-70" : ""}`}
        onClick={openCommentSection}
      >{`${
        commentCount > 0
          ? `View ${
              commentCount > 1 ? `all ${commentCount} comments` : "1 comment"
            }`
          : ""
      }`}</span>
      <div
        className={`${
          viewComment ? "max-h-[1000px]" : "max-h-0 overflow-hidden"
        } transition-[max-height] duration-300 px-2   ${
          delPostPanel || editPostPanel ? "opacity-70" : ""
        }`}
      >
        {commentContent.map((p, i) => (
          <Comment key={i} info={p} func={commentProcess} post={post} />
        ))}
        <div className="flex gap-3 mb-2 items-center">
          <img
            src={userInfos.profilePicture}
            className="rounded-full h-[30px] w-[30px]"
            alt=""
          />
          <input
            type="text"
            placeholder={`Add a comment for ${name}`}
            className="w-[85%] sametInputBgColor py-1 px-1 outline-transparent focus:outline-blue-500 dark:border dark:border-gray-700 dark:outline-none dark:focus:border-gray-300"
            onKeyDown={handleKeyPress}
            ref={commentInputRef}
          />
          <IoSend
            size={23}
            className="text-blue-500 cursor-pointer dark:text-white"
            onClick={() => handleClick(commentInputRef.current.value)}
          />
        </div>
      </div>

      <div
        className={`bg-white border w-[30%] max-sm:w-[90%] max-lg:w-[70%] lg:w-[55%]  right-0 left-0 top-[45%] mx-auto dark:bg-black z-20 dark:border-gray-700 ${
          delPostPanel ? "" : "hidden"
        } absolute p-4 rounded-md opacity-100`}
      >
        <div className="text-center">
          Are you sure about to delete this post?
        </div>
        <div className="flex justify-center items-center gap-2 ">
          <button
            className="text-white bg-blue-500 border px-2 py-1 rounded-md hover:bg-blue-600 dark:border-blue-500"
            onClick={deletePost}
          >
            Delete
          </button>
          <button
            className="px-2 py-1 border rounded-md hover:bg-white bg-gray-50 dark:border-gray-300 dark:bg-black dark:hover:bg-[#1D1D1D]"
            onClick={closeDelPostPanel}
          >
            Cancel
          </button>
        </div>
      </div>

      <div
        className={`bg-white border border-gray-300 w-[80%] max-sm:w-full ${
          editPostPanel ? "" : "hidden"
        } absolute top-[16%] right-[10%] max-sm:right-0 max-sm:left-0 max-sm:mx-auto p-4 rounded-md opacity-100  z-10 dark:bg-black dark:border-gray-600`}
      >
        <div className="text-center font-semibold text-gray-700 mb-4 dark:text-white">
          Edit the post
        </div>
        <div className="flex mb-2 max-xl:flex-col max-md:gap-5">
          <div className="pr-2">
            <span className="text-gray-600 font-semibold text-sm dark:text-white">
              Post Text
            </span>
            <input
              type="text"
              id="textInp"
              name="textInp"
              value={editPostInput}
              placeholder="What's on your mind..."
              className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400 w-full dark:border-gray-600 dark:focus:border-gray-200 dark:text-white"
              onChange={(e) => setEditPostInput(e.target.value)}
            />
          </div>
          <div>
            <div className="text-gray-600 font-semibold text-sm mb-1 dark:text-white">
              Post Image
            </div>
            <img src={fileLink} alt="" className="mb-2 max-h-[200px] w-auto" />
            <input
              type="file"
              className="pb-4"
              onChange={handleChange}
              ref={reference}
            />
          </div>
        </div>
        <div className={`${warning ? "" : "hidden"} text-red-500`}>
          {warning ? warning : ""}
        </div>
        <div className="flex justify-center items-center gap-2 ">
          <button
            className="text-white bg-blue-500 border px-4 py-1 rounded-md hover:bg-blue-600 dark:border-blue-500 "
            onClick={editPost}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 border rounded-md hover:bg-white bg-gray-50 dark:bg-black dark:border-gray-600 dark:hover:bg-[#1D1D1D]"
            onClick={switchEditPostPanel}
          >
            Cancel
          </button>
        </div>
      </div>

      {
        <span
          className={`px-2 ${
            delPostPanel || editPostPanel ? "opacity-70" : ""
          }`}
        >
          {toDateTime(post.timestamp.seconds)}
        </span>
      }
      {likesPanelVisibility && (
        <FriendsModal
          infos={likeInfos}
          closeFunc={() => setLikesPanelVisibility(false)}
          title={"Likes"}
        />
      )}
    </div>
  );
};

export default Post;
