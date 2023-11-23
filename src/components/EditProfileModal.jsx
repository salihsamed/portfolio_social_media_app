import React, { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { MoonLoader } from "react-spinners";
import FormData from "form-data";
import axios from "axios";

const EditProfileModal = ({ closeFunc, userInfos, refreshInfo }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureLink, setProfilePictureLink] = useState(
    userInfos.profilePicture
  );
  const [bannerPhoto, setBannerPhoto] = useState(null);
  const [bannerPhotoLink, setBannerPhotoLink] = useState(userInfos.bannerPhoto);
  const [biography, setBiography] = useState(userInfos.biography);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const ppLinkChange = (e) => {
    setWarning("");
    setProfilePictureLink(URL.createObjectURL(e.target.files[0]));
    setProfilePicture(e.target.files[0]);
  };

  const bannerPhotoLinkChange = (e) => {
    setWarning("");
    setBannerPhotoLink(URL.createObjectURL(e.target.files[0]));
    setBannerPhoto(e.target.files[0]);
  };

  const editProfile = async () => {
    if (
      userInfos.profilePicture === profilePictureLink &&
      userInfos.bannerPhoto === bannerPhotoLink &&
      userInfos.biography === biography
    ) {
      return 0;
    }

    setLoading(true);
    var responseObj = {
      response1: true,
      response2: true,
    };
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    if (userInfos.profilePicture !== profilePictureLink) {
      let data = new FormData();
      data.append("image", profilePicture);

      let response = await axios.post(
        "https://nsfw-check-cmsw.onrender.com/check_nsfw",
        data,
        config
      );

      responseObj.response1 = response.data[1].isSafe;
    }

    if (userInfos.bannerPhoto !== bannerPhotoLink) {
      let data2 = new FormData();
      data2.append("image", bannerPhoto);

      let response2 = await axios.post(
        "https://nsfw-check-cmsw.onrender.com/check_nsfw",
        data2,
        config
      );

      responseObj.response2 = response2.data[1].isSafe;
    }

    if (!responseObj.response1 || !responseObj.response2) {
      setWarning("! You can not upload explicit content.");
      setLoading(false);
      return 0;
    }

    const docRef = doc(db, "users", userInfos.userID);
    const tempObj = userInfos;

    if (userInfos.profilePicture !== profilePictureLink) {
      const fileRef = ref(storage, `profilePictures/${userInfos.userID}`);
      const uploadTask = uploadBytesResumable(fileRef, profilePicture);

      try {
        const snapshot = await uploadTask;
        const downloadURL = await getDownloadURL(snapshot.ref);
        tempObj.profilePicture = downloadURL;
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
    if (userInfos.bannerPhoto !== bannerPhotoLink) {
      const fileRef = ref(storage, `bannerPhotos/${userInfos.userID}`);
      const uploadTask = uploadBytesResumable(fileRef, bannerPhoto);

      try {
        const snapshot = await uploadTask;
        const downloadURL = await getDownloadURL(snapshot.ref);
        tempObj.bannerPhoto = downloadURL;
      } catch (error) {
        console.error("Error uploading banner photo:", error);
      }
    }
    if (userInfos.biography !== biography) {
      tempObj.biography = biography;
    }

    await updateDoc(docRef, tempObj);
    setLoading(false);
    refreshInfo();
    closeFunc();
  };

  return (
    <div className="absolute top-5 left-0 right-0 mx-auto bg-white border border-gray-300 z-20 p-5 rounded-md md:w-[90%] max-md:w-full dark:bg-black dark:border-gray-600">
      <h2 className="font-semibold text-xl text-gray-700 text-center mb-5 dark:text-white">
        Edit Profile
      </h2>
      <div className="flex justify-between mb-2 max-md:flex-col">
        <div>
          <span className="text-gray-600 font-semibold dark:text-gray-200">
            Profile picture
          </span>
          <img
            src={profilePictureLink}
            alt="profile picture"
            className="h-[15vh] w-auto mb-2"
          />
          <input
            type="file"
            className="w-[90%]"
            onChange={ppLinkChange}
            size={5}
          />
        </div>

        <div>
          <span className="text-gray-600 font-semibold block dark:text-gray-200">
            Banner photo
          </span>
          <img
            src={bannerPhotoLink}
            alt="profile picture"
            className="h-[15vh] w-auto mb-2"
          />
          <input
            type="file"
            className="w-[90%]"
            onChange={bannerPhotoLinkChange}
          />
        </div>
      </div>

      <span className="text-gray-600 font-semibold block dark:text-gray-200">
        Biography
      </span>
      <textarea
        name=""
        id=""
        cols="30"
        rows="7"
        className="border w-full p-2 dark:border-gray-700 dark:bg-black"
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
      ></textarea>
      <div className="flex justify-center gap-5">
        <button
          className={`text-white bg-blue-500 border px-4 py-1 rounded-md hover:bg-blue-600 dark:border-blue-500  ${
            loading ? "pointer-events-none opacity-50" : ""
          }`}
          onClick={editProfile}
        >
          Edit
        </button>
        <button
          className={`px-2 py-1 border rounded-md hover:bg-white bg-gray-50 dark:bg-black dark:border-gray-600 dark:hover:bg-[#1D1D1D] ${
            loading ? "pointer-events-none opacity-50" : ""
          }`}
          onClick={closeFunc}
        >
          Cancel
        </button>
      </div>
      {loading && (
        <div className="flex gap-2 items-center justify-center">
          <MoonLoader color="#3b82f6" size={20} />
          Processing
        </div>
      )}

      <div className={`${warning ? "" : "hidden"} text-red-500`}>
        {warning ? warning : ""}
      </div>
    </div>
  );
};

export default EditProfileModal;
