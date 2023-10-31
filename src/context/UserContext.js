import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useReducer, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [userInfos, setUserInfos] = useState({});
  const [userFriends, setUserFriends] = useState([]);
  const [userPosts, setUserPosts] = useState({});
  const [userUnsub1, setUnsub1] = useState(null);
  const [userUnsub2, setUnsub2] = useState(null);
  const [unsubscribeArr, setUnsubscribeArr] = useState([]);
  const [friendsPostCount, setFriendsPostCount] = useState({});
  const [checkString, setCheckString] = useState("");
  const [friendsPostCountSolid, setFriendsPostCountSolid] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = collection(db, "users");
        const q = query(userRef, where("userID", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUserInfos(doc.data());
        });
      } else {
        setUserFriends([]);
        setUserInfos({});
        setUserPosts({});
      }
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    let unsubscribe = null; // Abonelik değişkeni
    let unsubscribe2 = null;
    // useEffect içinde yeni bir fonksiyon tanımlayarak kullanabilirsiniz
    const getInfos = () => {
      // Eski aboneliği iptal et
      if (unsubscribe !== null) {
        unsubscribe();
      }

      if (unsubscribe2 !== null) {
        unsubscribe2();
      }

      // Yeni aboneliği oluştur
      unsubscribe = onSnapshot(doc(db, "friends", userInfos.userID), (doc) => {
        setUserFriends(doc.data().friendList);
      });

      unsubscribe2 = onSnapshot(doc(db, "posts", userInfos.userID), (doc) => {
        setUserPosts(doc.data());
      });
    };

    setUnsub1(() => unsubscribe);
    setUnsub2(() => unsubscribe2);

    userInfos.userName && getInfos();

    // useEffect temizlenirken aboneliği iptal et
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }

      if (unsubscribe2) {
        unsubscribe2();
      }
    };
  }, [userInfos.userID]);

  useEffect(() => {
    if (userFriends.length > 0) {
      if (unsubscribeArr.length > 0) {
        for (const element1 of unsubscribeArr) {
          element1();
        }
      }

      const funcs = [];
      const postCount = {};

      for (const element2 of userFriends) {
        const unsbscrb = onSnapshot(doc(db, "posts", element2), (doc) => {
          postCount[element2] = Object.keys(doc.data()).length;
          setFriendsPostCount(postCount);
          setCheckString(JSON.stringify(postCount));
        });

        funcs.push(unsbscrb);
      }

      setUnsubscribeArr(funcs);
      setFriendsPostCount(postCount);
    }

    return () => {
      if (unsubscribeArr.length > 0) {
        for (const element of unsubscribeArr) {
          element();
        }
      }
    };
  }, [userFriends]);

  useEffect(() => {
    if (Object.keys(friendsPostCount).length > 0) {
      let sayac = 0;
      Object.values(friendsPostCount).forEach((element) => {
        sayac += element;
      });
      setFriendsPostCountSolid(sayac);
    }
  }, [checkString]);

  const INITIAL_STATE = {
    logout: false,
  };

  const logoutReducer = (state, action) => {
    switch (action.type) {
      case "logout":
        return {
          logout: true,
        };
      case "signup":
        return {
          logout: false,
        };

      default:
        return state;
    }
  };

  const [state, logoutDispatch] = useReducer(logoutReducer, INITIAL_STATE);

  return (
    <UserContext.Provider
      value={{
        userInfos,
        userFriends,
        userPosts,
        userUnsub1,
        userUnsub2,
        logout: state.logout,
        logoutDispatch,
        friendsPostCountSolid,
        unsubscribeArr,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
