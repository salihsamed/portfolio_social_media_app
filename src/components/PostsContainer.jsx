import React, { useContext, useEffect, useState } from "react";
import Post from "./Post";
import { UserContext } from "../context/UserContext";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const PostsContainer = () => {
  const { userInfos, userFriends, userPosts, friendsPostCountSolid } =
    useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [postOwners, setPostOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newArray = [...userFriends, userInfos.userID];

    setPostOwners(newArray);
  }, [userFriends]);

  useEffect(() => {
    setLoading(true);
    if (Object.keys(postOwners).length !== 0) {
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
        setLoading(false);
      });
    }
  }, [postOwners, userPosts, friendsPostCountSolid]);

  return (
    <div className="flex flex-col gap-5 xl:w-[40%] lg:w-[50%] md:w-[65%] max-md:w-[95%] mt-5 mb-20">
      {!loading ? (
        posts.length ? (
          posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((p, i) => <Post post={p} key={p.postID} />)
        ) : (
          <div className="text-center text-gray-700 dark:text-white">
            There is no post.
          </div>
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default PostsContainer;
