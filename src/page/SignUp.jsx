import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase/firebase";
import { MdArrowBackIos } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import FormData from "form-data";
import axios from "axios";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AiOutlineExclamation } from "react-icons/ai";
import { GiPalmTree } from "react-icons/gi";
import { MoonLoader } from "react-spinners";

const SignUp = () => {
  const navigate = useNavigate();
  const [nextPage, setNextPage] = useState(false);
  const [ppFile, setPPFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [warning, setWarning] = useState("");
  const wrapperRef = useRef(null);
  const wrapperRef2 = useRef(null);
  const ppRef = useRef(null);
  const bannerRef = useRef(null);
  const [process, setProcess] = useState(false);
  const [isNextClicked, setIsNextClicked] = useState(false);
  const [ppLink, setPPLink] = useState(
    "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
  );
  const [bannerLink, setBannerLink] = useState(
    "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
  );
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("Required")
      .min(2, "First name is too short - should be 2 chars minimum"),
    lastName: Yup.string()
      .required("Required")
      .min(2, "Last name is too short - should be 2 chars minimum"),
    userName: Yup.string()
      .required("Required")
      .min(3, "User name is too short - should be 3 chars minimum"),
    birthdate: Yup.date().required("Required"),
    gender: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    password: Yup.string()
      .min(8, "Password is too short - should be 8 chars minimum")
      .matches(/[0-9]/, "Password requires a number")
      .matches(/[a-z]/, "Password requires a lowercase letter")
      .matches(/[A-Z]/, "Password requires an uppercase letter")
      .matches(/[^\w]/, "Password requires a symbol")
      .required("Password is a required field"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Mismatched passwords")
      .required("Please confirm your password"),
    biography: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      userName: "",
      birthdate: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
      biography: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setProcess(true);
      if (
        ppLink !==
        "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
      ) {
        let data = new FormData();
        data.append("image", ppFile);
        const config = {
          headers: { "content-type": "multipart/form-data" },
        };

        let response = await axios.post(
          "https://nsfw-check.onrender.com/check_nsfw",
          data,
          config
        );

        if (!response.data[1].isSafe) {
          setWarning("Your profile picture can not be a explicit content.");
          setProcess(false);
          return 0;
        }
      }

      if (
        bannerLink !==
        "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
      ) {
        let data = new FormData();
        data.append("image", bannerFile);
        const config = {
          headers: { "content-type": "multipart/form-data" },
        };

        let response = await axios.post(
          "https://nsfw-check.onrender.com/check_nsfw",
          data,
          config
        );

        if (!response.data[1].isSafe) {
          setWarning("Your banner photo can not be a explicit content.");
          setProcess(false);
          return 0;
        }
      }

      const displayName = values.firstName + " " + values.lastName;
      const searchName = displayName.toLowerCase();

      const res = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await updateProfile(res.user, {
        displayName,
      });

      var tempObj = {};

      if (ppFile !== null) {
        const fileRef = ref(storage, `profilePictures/${res.user.uid}`);
        const uploadTask = uploadBytesResumable(fileRef, ppFile);
        try {
          const snapshot = await uploadTask;
          const downloadURL = await getDownloadURL(snapshot.ref);
          tempObj.profilePicture = downloadURL;
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          setProcess(false);
        }
      } else {
        tempObj.profilePicture =
          "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA..";
      }

      if (bannerFile !== null) {
        const fileRef2 = ref(storage, `bannerPhotos/${res.user.uid}`);
        const uploadTask2 = uploadBytesResumable(fileRef2, bannerFile);

        try {
          const snapshot2 = await uploadTask2;
          const downloadURL = await getDownloadURL(snapshot2.ref);
          tempObj.bannerPhoto = downloadURL;
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          setProcess(false);
        }
      } else {
        tempObj.bannerPhoto =
          "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA..";
      }

      await setDoc(doc(db, "users", res.user.uid), {
        userID: res.user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName,
        searchName,
        userName: values.userName,
        email: values.email,
        gender: values.gender,
        birthdate: values.birthdate,
        biography: values.biography,
        private: "yes",
        bannerPhoto: tempObj.bannerPhoto,
        profilePicture: tempObj.profilePicture,
      });

      await setDoc(doc(db, "posts", res.user.uid), {});

      await setDoc(doc(db, "notifications", res.user.uid), {
        seenActions: [],
        unseenActions: [],
        likeTimestamp: [],
        userID: res.user.uid,
      });

      await setDoc(doc(db, "likedPosts", res.user.uid), {
        likedPostsList: [],
        userID: res.user.uid,
      });

      await setDoc(doc(db, "friends", res.user.uid), {
        friendList: [],
        receivedFriendRequest: [],
        sendedFriendRequest: [],
        userID: res.user.uid,
      });

      await setDoc(doc(db, "comments", res.user.uid), {});

      await setDoc(doc(db, "userChats", res.user.uid), {});

      setProcess(false);

      await signOut(auth);

      await signInWithEmailAndPassword(auth, values.email, values.password);

      window.alert("Registration completed !");

      navigate("/");
    },
  });

  Object.values(formik.errors).forEach((element) => {
    if (nextPage && element) {
      setNextPage(false);
    }
  });

  const toNextPage = () => {
    setIsNextClicked(true);
    setNextPage(true);
  };

  const onDragEnter = () => wrapperRef.current.classList.add("opacity-60");

  const onDragLeave = () => wrapperRef.current.classList.remove("opacity-60");

  const onDrop = () => wrapperRef.current.classList.remove("opacity-60");

  const onFileDrop = (e, type) => {
    const newFile = e.target.files[0];
    if (type == "profile") {
      if (newFile) {
        setPPFile(newFile);
        setWarning("");
        setPPLink(URL.createObjectURL(e.target.files[0]));
      }
    } else {
      if (newFile) {
        setBannerFile(newFile);
        setWarning("");
        setBannerLink(URL.createObjectURL(e.target.files[0]));
      }
    }
  };

  const emptyFile = (e, type) => {
    if (type === "profile") {
      setPPFile(null);
      setPPLink(
        "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
      );
      setWarning("");
    } else {
      setBannerFile(null);
      setBannerLink(
        "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
      );
      setWarning("");
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="min-h-[100vh] py-5 relative">
        <div
          className="flex items-center cursor-pointer absolute top-3 left-3"
          onClick={() => {
            navigate("/");
          }}
        >
          <GiPalmTree size={33} className="text-blue-500 dark:text-white" />
          <h1 className="text-2xl font-bold dark:text-white">Social Z</h1>
        </div>
        <div
          className={`max-lg:w-[70%] max-sm:w-[95%] lg:w-[60%] xl:w-[45%] 2xl:w-[30%] mx-auto overflow-hidden max-sm:py-8`}
        >
          <div
            className={`flex  transition-all  ${
              nextPage ? "-translate-x-[100%]" : ""
            }`}
          >
            <div
              className={`flex flex-col flex-shrink-0 gap-5 w-full items-center py-4 px-10 max-sm:px-2 bg-opacity-95 rounded-lg `}
            >
              <div className="flex flex-col items-center">
                <h2 className="font-bold text-2xl text-gray-800">Sign Up</h2>
              </div>

              <div className="flex w-full gap-2">
                <div className="flex flex-col w-[50%]">
                  <label
                    htmlFor="firstName"
                    className="text-gray-700 font-semibold"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Name"
                    className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                    onChange={formik.handleChange}
                    value={formik.values.firstName}
                  />
                  {(isNextClicked || formik.touched.firstName) &&
                  formik.errors.firstName ? (
                    <div className="text-red-500">
                      {formik.errors.firstName}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col w-[50%]">
                  <label
                    htmlFor="lastName"
                    className="text-gray-700 font-semibold"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    className="border-2 border-transparent rounded-xl shadow-lg outline-none  py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                    onChange={formik.handleChange}
                    value={formik.values.lastName}
                  />
                  {(isNextClicked || formik.touched.lastName) &&
                  formik.errors.lastName ? (
                    <div className="text-red-500">{formik.errors.lastName}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col w-full">
                <label
                  htmlFor="userName"
                  className="text-gray-700 font-semibold"
                >
                  User Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  placeholder="JohnWick13"
                  className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2  sametInputBgColor sametInputTextColor focus:border-blue-400"
                  onChange={formik.handleChange}
                  value={formik.values.userName}
                />
                {(isNextClicked || formik.touched.userName) &&
                formik.errors.userName ? (
                  <div className="text-red-500">{formik.errors.userName}</div>
                ) : null}
              </div>

              <div className="flex w-full gap-2">
                <div className="flex flex-col w-[50%]">
                  <label
                    htmlFor="birthdate"
                    className="text-gray-700 font-semibold"
                  >
                    Birthdate
                  </label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    className="border-2 border-transparent rounded-xl shadow-lg outline-none  py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                    onChange={formik.handleChange}
                    value={formik.values.birthdate}
                  />
                  {(isNextClicked || formik.touched.birthdate) &&
                  formik.errors.birthdate ? (
                    <div className="text-red-500">
                      {formik.errors.birthdate}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col w-[30%]">
                  <label
                    htmlFor="gender"
                    className="text-gray-700 font-semibold"
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    className="border-2 border-transparent rounded-xl shadow-lg outline-none py-2 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                    onChange={formik.handleChange}
                  >
                    <option disabled selected>
                      Select
                    </option>
                    <option value="m" className="sametInputTextColor">
                      Male
                    </option>
                    <option value="f" className="sametInputTextColor">
                      Female
                    </option>
                  </select>
                  {(isNextClicked || formik.touched.gender) &&
                  formik.errors.gender ? (
                    <div className="text-red-500">{formik.errors.gender}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="email" className="text-gray-700 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="blank@socialz.com"
                  className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2  sametInputBgColor sametInputTextColor focus:border-blue-400"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                {(isNextClicked || formik.touched.email) &&
                formik.errors.email ? (
                  <div className="text-red-500">{formik.errors.email}</div>
                ) : null}
              </div>

              <div className="flex flex-col w-full">
                <label
                  htmlFor="password"
                  className="text-gray-700 font-semibold"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                {(isNextClicked || formik.touched.password) &&
                formik.errors.password ? (
                  <div className="text-red-500">{formik.errors.password}</div>
                ) : null}
              </div>

              <div className="flex flex-col w-full">
                <label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-semibold"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                  onChange={formik.handleChange}
                  value={formik.values.confirmPassword}
                />
                {(isNextClicked || formik.touched.confirmPassword) &&
                formik.errors.confirmPassword ? (
                  <div className="text-red-500">
                    {formik.errors.confirmPassword}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col w-full">
                <label
                  htmlFor="biography"
                  className="text-gray-700 font-semibold"
                >
                  Biography
                </label>
                <textarea
                  name="biography"
                  id="biography"
                  cols="30"
                  rows="5"
                  className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
                  onChange={formik.handleChange}
                  value={formik.values.biography}
                ></textarea>
                {formik.touched.biography && formik.errors.biography ? (
                  <div className="text-red-500">{formik.errors.biography}</div>
                ) : null}
              </div>

              <div>
                <button
                  type="button"
                  className="px-7 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
                  onClick={toNextPage}
                >
                  Next
                </button>
              </div>

              <div>
                <span>
                  Already have an account ?
                  <Link to={"/Login"} className="text-blue-500">
                    {" "}
                    Log in
                  </Link>
                </span>
              </div>
            </div>

            <div
              id="photoSection"
              className="w-full flex-shrink-0 flex flex-col items-center gap-5 py-4 px-10 max-sm:px-2 relative"
            >
              <h2 className="font-bold text-2xl text-gray-800">Sign Up</h2>
              <div className="w-full">
                <label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-semibold"
                >
                  Profile picture
                </label>

                <div
                  ref={wrapperRef}
                  className={`w-[50%] transition-all overflow-hidden border-dashed border-2 border-blue-300 relative min-h-[25vh] ${
                    ppLink !==
                    "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
                      ? ""
                      : "hover:opacity-60"
                  }`}
                  onDragEnter={() => {
                    if (!ppLink) {
                      onDragEnter();
                    }
                  }}
                  onDragLeave={() => {
                    if (!ppLink) {
                      onDragLeave();
                    }
                  }}
                  onDrop={() => {
                    if (!ppLink) {
                      onDrop();
                    }
                  }}
                >
                  <div
                    className={`flex flex-col items-center justify-center min-h-[inherit] ${
                      ppLink !==
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <img
                      ref={ppRef}
                      src={ppLink}
                      className="w-full h-auto"
                      alt=""
                    />
                    <p className="dark:text-white text-center">
                      Drag & Drop your image here or Click to select
                    </p>
                  </div>
                  <div
                    className={`flex w-full min-h-[inherit] items-center justify-center ${
                      ppLink ===
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={ppLink}
                        className={`h-full w-auto ${ppLink ? "" : "hidden"}`}
                      />
                      <IoClose
                        className="absolute right-0 top-0 text-red-500 text-3xl z-20 cursor-pointer hover:text-red-700"
                        onClick={(e) => emptyFile(e, "profile")}
                      />
                    </div>
                  </div>
                  <input
                    type="file"
                    value=""
                    className={`absolute w-full h-full  top-0 left-0 ${
                      ppLink ===
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/profilePictures%2Fdefault.png?alt=media&token=496cf3cd-a607-45c9-91c3-0f8afb5e5fb1&_gl=1*8fzyo4*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM4NjE5LjM1LjAuMA.."
                        ? "cursor-pointer"
                        : "cursor-default pointer-events-none"
                    } opacity-0`}
                    onChange={(e) => onFileDrop(e, "profile")}
                  />
                </div>
                <div
                  className={`${
                    warning ===
                    "Your profile picture can not be a explicit content."
                      ? ""
                      : "hidden"
                  } text-red-500`}
                >
                  {warning ? warning : ""}
                </div>
              </div>
              <div className="w-full">
                <label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-semibold"
                >
                  Banner Photo
                </label>
                <div className="flex gap-2 text-blue-500 py-2 items-center">
                  <AiOutlineExclamation className="text-lg" />
                  <span className="text-xs">
                    For the best result, we suggest using a photo that has more
                    width than height.
                  </span>
                </div>

                <div
                  ref={wrapperRef2}
                  className={`w-full transition-all overflow-hidden border-dashed border-2 border-blue-300 relative min-h-[25vh] ${
                    bannerLink !==
                    "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
                      ? ""
                      : "hover:opacity-60"
                  }`}
                  onDragEnter={() => {
                    if (!bannerLink) {
                      onDragEnter();
                    }
                  }}
                  onDragLeave={() => {
                    if (!bannerLink) {
                      onDragLeave();
                    }
                  }}
                  onDrop={() => {
                    if (!bannerLink) {
                      onDrop();
                    }
                  }}
                >
                  <div
                    className={`flex flex-col items-center justify-center min-h-[inherit] ${
                      bannerLink !==
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <img
                      ref={bannerRef}
                      src={bannerLink}
                      className="w-full h-auto"
                      alt=""
                    />
                    <p className="dark:text-white text-center">
                      Drag & Drop your image here or Click to select
                    </p>
                  </div>
                  <div
                    className={`flex w-full min-h-[inherit] items-center justify-center ${
                      bannerLink ===
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
                        ? "hidden"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={bannerLink}
                        className={`h-full w-auto ${
                          bannerLink ? "" : "hidden"
                        }`}
                      />
                      <IoClose
                        className="absolute right-0 top-0 text-red-500 text-3xl z-20 cursor-pointer hover:text-red-700"
                        onClick={(e) => emptyFile(e, "banner")}
                      />
                    </div>
                  </div>
                  <input
                    type="file"
                    value=""
                    className={`absolute w-full h-full  top-0 left-0 ${
                      bannerLink ===
                      "https://firebasestorage.googleapis.com/v0/b/socialz-7f079.appspot.com/o/bannerPhotos%2Fdefault.jpg?alt=media&token=95258dc3-952e-40fc-a9d2-f0952798a5e8&_gl=1*s8cgae*_ga*NzAyNTQyNTExLjE2ODY3MjIyMzY.*_ga_CW55HF8NVT*MTY5ODIzNzQwMy4xNjAuMS4xNjk4MjM5MDMwLjQxLjAuMA.."
                        ? "cursor-pointer"
                        : "cursor-default pointer-events-none"
                    } opacity-0`}
                    onChange={(e) => onFileDrop(e, "banner")}
                  />
                </div>
                <div
                  className={`${
                    warning ===
                    "Your banner photo can not be a explicit content."
                      ? ""
                      : "hidden"
                  } text-red-500`}
                >
                  {warning ? warning : ""}
                </div>
              </div>
              {process && (
                <div className="flex gap-2 items-center justify-center">
                  <MoonLoader color="#3b82f6" size={20} />
                  Processing
                </div>
              )}
              <button
                type="submit"
                className={`${
                  process ? "pointer-events-none opacity-60" : ""
                } px-7 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all`}
              >
                Submit
              </button>

              <MdArrowBackIos
                className="absolute top-5 left-1 text-2xl cursor-pointer"
                onClick={() => setNextPage(false)}
              />
              <div>
                <span>
                  Already have an account ?
                  <Link to={"/Login"} className="text-blue-500">
                    {" "}
                    Log in
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignUp;
