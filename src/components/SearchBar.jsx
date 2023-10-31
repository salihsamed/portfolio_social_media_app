import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ visibility, closeFunc }) => {
  const [color, setColor] = useState("");
  const colRef = collection(db, "users");
  const [foundUser, setfoundUser] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (input) => {
    if (input) {
      const end_input = input + "\uf8ff";
      const q = query(
        colRef,
        where("searchName", ">=", input),
        where("searchName", "<=", end_input)
      );
      const querySnapshot = await getDocs(q);
      const newArray = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newArray.push(data);
      });
      setfoundUser(newArray);
    } else {
      setfoundUser([]);
    }
  };

  return (
    <div
      className={`relative xl:w-[25%] md:w-[45%] lg:w-[35%] 2xl:w-[20%] ${
        visibility ? "max-sm:w-[85%]" : "max-sm:w-0 max-sm:overflow-hidden"
      } max-sm:transition-all `}
    >
      <input
        type="text"
        id="email"
        name="email"
        placeholder="Search for friends..."
        className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400 w-full dark:bg-black dark:border-gray-800 dark:focus:border-gray-400 dark:text-gray-300"
        onFocus={() => setColor("text-blue-400")}
        onBlur={() => setColor("text-black")}
        onKeyUp={(e) => handleSearch(e.target.value.toLowerCase())}
      />

      <AiOutlineSearch
        size={23}
        className={`absolute right-3 top-2 ${color} dark:text-gray-300`}
        onClick={() => {
          if (window.innerWidth < 767) {
            closeFunc();
          }
        }}
      />
      <div
        className={`absolute top-10 w-full rounded-b-lg border-zinc-300 z-10 overflow-hidden ${
          foundUser.length > 0 ? "border-2 border-t-0" : ""
        } bg-zinc-50 dark:border-gray-500 dark:bg-black dark:text-gray-300`}
      >
        {foundUser?.map((p, i) => (
          <div
            className="flex cursor-pointer hover:bg-zinc-200  dark:hover:bg-[#1d1d1d] gap-2 items-center p-1"
            key={i}
            onClick={() => navigate(`/Profile/${p.userName}`)}
          >
            <img
              src={p.profilePicture}
              alt=""
              className="h-[30px] w-[30px] rounded-full"
            />
            <div>{p.displayName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
