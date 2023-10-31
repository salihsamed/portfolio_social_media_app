import React from "react";
import LogoBar from "./LogoBar";
import SearchBar from "./SearchBar";
import ActionsPlusProfileBar from "./ActionsPlusProfileBar";
import { IoReorderThree } from "react-icons/io5";
import { useState } from "react";
import MobileNavbar from "./MobileNavbar";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai";

const Top = () => {
  const [mobileNavbarVisibility, setMobileNavbarVisibility] = useState(false);
  const [searchBarVisibility, setSearchBarVisibility] = useState(false);

  const closeFunc = () => {
    setMobileNavbarVisibility(false);
  };
  return (
    <div className="flex w-full py-3 gap-3 px-2 items-center justify-between bg-white dark:bg-black dark:border-b dark:border-gray-600 max-sm:relative">
      <LogoBar />
      <AiOutlineSearch
        onClick={() => setSearchBarVisibility(true)}
        className={`text-2xl ${
          !searchBarVisibility ? "" : "hidden"
        } sm:hidden dark:text-white`}
      />
      <SearchBar
        visibility={searchBarVisibility}
        closeFunc={() => setSearchBarVisibility(false)}
      />
      <ActionsPlusProfileBar visibility={searchBarVisibility} />
      <IoReorderThree
        className={`dark:text-white text-blue-400 text-[2rem] sm:hidden z-10 ${
          mobileNavbarVisibility ? "hidden" : ""
        }`}
        onClick={() => setMobileNavbarVisibility(true)}
      />
      <AiOutlineClose
        className={`dark:text-white text-white text-3xl sm:hidden z-30 ${
          mobileNavbarVisibility ? "" : "hidden"
        }`}
        onClick={() => setMobileNavbarVisibility(false)}
      />

      <MobileNavbar visibility={mobileNavbarVisibility} closeFunc={closeFunc} />
    </div>
  );
};

export default Top;
