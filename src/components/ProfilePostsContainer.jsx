import React, { useContext, useEffect, useState } from "react";
import Post from "./Post";
import { UserContext } from "../context/UserContext";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const ProfilePostsContainer = ({ userID }) => {
  const { userPosts } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [postOwners, setPostOwners] = useState([]);

  useEffect(() => {
    setPostOwners([userID]);
  }, [userID]);

  useEffect(() => {
    if (postOwners.length !== 0) {
      const newpostArray = [];
      Promise.all(
        postOwners.map(async (element) => {
          const docRef = doc(db, "posts", element);
          const docSnap = await getDoc(docRef);
          var data = docSnap.data();
          delete data["count"];
          Object.keys(data).forEach(function (key) {
            newpostArray.push(data[key]);
          });
        })
      ).then(() => {
        setPosts(newpostArray);
      });
    }
  }, [postOwners, userPosts]);

  return (
    <div className="flex flex-col gap-5 w-full mt-5">
      {posts.length > 0 &&
        posts
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((p, i) => <Post post={p} key={p.postID} />)}
    </div>
  );
};

export default ProfilePostsContainer;
