import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { UserContext } from "./UserContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { userInfos } = useContext(UserContext);
  const [counter, setCounter] = useState(0);
  const [chatUnsub1, setChatUnsub1] = useState(null);
  const [chatUnsub2, setChatUnsub2] = useState(null);
  const [chatUnsub3, setChatUnsub3] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(db, "userChats", userInfos.userID),
        (doc) => {
          setChats(doc.data());
        }
      );
      setChatUnsub3(() => unsub);

      return () => {
        unsub();
      };
    };

    userInfos.userID && getChats();
  }, [userInfos.userID]);

  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            userInfos.userID > action.payload.userID
              ? userInfos.userID + action.payload.userID
              : action.payload.userID + userInfos.userID,
        };
      case "REMOVE_USER":
        return {
          user: {},
          chatId: "null",
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  useEffect(() => {
    let unsub = null;
    const getChat = () => {
      if (unsub) {
        unsub();
      }

      unsub = onSnapshot(doc(db, "userChats", userInfos.userID), (doc) => {
        var sayac = 0;

        Object.values(doc.data()).forEach((element) => {
          sayac += element.unseenMessageCount;
        });

        setCounter(sayac);
      });

      setChatUnsub1(() => unsub);
    };

    userInfos.userID && getChat();

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [userInfos.userID]);

  useEffect(() => {
    if (state.chatId !== "null") {
      const unSub = onSnapshot(doc(db, "chats", state.chatId), (doc) => {
        doc.exists() && setMessages(doc.data().messages);
      });

      setChatUnsub2(() => unSub);

      return () => {
        unSub();
      };
    }
  }, [state.chatId]);

  return (
    <ChatContext.Provider
      value={{
        dispatch,
        counter,
        chatUnsub1,
        chatUnsub2,
        chatUnsub3,
        messages,
        chats,
        data: state,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
