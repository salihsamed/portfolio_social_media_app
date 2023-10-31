import React, { useContext, useEffect, useRef, useState } from "react";
import { Component } from "react";
import Switch from "react-switch";
import { UserContext } from "../context/UserContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Settings = () => {
  const { userInfos } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState(null);

  const handleClick = async () => {
    if ((userInfos.private === "yes") !== choice) {
      var variable;
      if (choice) {
        variable = "yes";
      } else {
        variable = "no";
      }

      const docRef = doc(db, "users", userInfos.userID);

      await updateDoc(docRef, {
        private: variable,
      });

      window.location.reload();
    }
  };

  useEffect(() => {
    if (Object.keys(userInfos).length > 0) {
      setChoice(userInfos.private === "yes");
      setLoading(false);
    }
  }, [userInfos]);

  class SwitchExample extends Component {
    constructor() {
      super();
      this.state = { checked: userInfos.private === "yes" };
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(checked) {
      setChoice(checked);
    }

    render() {
      return (
        <div>
          <Switch
            offColor="#d6d3d1"
            onColor="#3b82f6"
            onChange={this.handleChange}
            checked={choice}
          />
        </div>
      );
    }
  }

  return (
    <div
      id="homeContainer"
      className="div sametInputBgColor dark:bg-black dark:text-white min-h-screen py-5"
    >
      {loading ? (
        <div>Loading</div>
      ) : (
        <div className="xl:w-[35%] lg:w-[50%] md:w-[65%] max-md:w-[95%] mx-auto">
          <h2 className="text-3xl text-center mb-10">Settings</h2>
          <div className="flex w-full gap-5 justify-center items-center">
            <label htmlFor="" className="text-lg">
              Private profile
            </label>
            <div>
              <SwitchExample />
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              type="submit"
              className="px-4 py-1 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
              onClick={handleClick}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
