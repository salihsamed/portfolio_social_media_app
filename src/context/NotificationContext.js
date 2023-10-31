import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { UserContext } from "./UserContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userInfos } = useContext(UserContext);
  const [notification, setNot] = useState(false);
  const [notUnsub1, setNotUnsub1] = useState(null);

  useEffect(() => {
    var unsubscribe = null; // Abonelik değişkeni
    // useEffect içinde yeni bir fonksiyon tanımlayarak kullanabilirsiniz
    const getNot = () => {
      if (userInfos.userID) {
        // Eski aboneliği iptal et
        if (unsubscribe) {
          unsubscribe();
        }

        // Yeni aboneliği oluştur
        unsubscribe = onSnapshot(
          doc(db, "notifications", userInfos.userID),
          (doc) => {
            setNot(doc.data().unseenActions);
          }
        );

        setNotUnsub1(() => unsubscribe);
      }
    };

    // userInfos değiştiğinde getChats fonksiyonunu çağır
    userInfos.userName && getNot();

    // useEffect temizlenirken aboneliği iptal et
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userInfos.userID]);

  return (
    <NotificationContext.Provider value={{ notification, notUnsub1 }}>
      {children}
    </NotificationContext.Provider>
  );
};
