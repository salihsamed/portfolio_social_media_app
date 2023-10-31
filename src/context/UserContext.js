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

    // userInfos değiştiğinde getChats fonksiyonunu çağır
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
