import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { GiPalmTree } from "react-icons/gi";

const Login = () => {
  const [err, setErr] = useState();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch {
      setErr(true);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-center w-full min-h-[100vh] relative">
        <div
          className="flex items-center cursor-pointer absolute top-3 left-3"
          onClick={() => {
            navigate("/");
          }}
        >
          <GiPalmTree size={33} className="text-blue-500 dark:text-white" />
          <h1 className="text-2xl font-bold dark:text-white">Social Z</h1>
        </div>
        <div className="flex flex-col items-center gap-5 max-lg:w-[70%] max-sm:w-[95%] lg:w-[60%] xl:w-[45%] 2xl:w-[30%] mt-32">
          <div className="flex">
            <h2 className="font-bold text-2xl mt-5 text-gray-800">Login</h2>
          </div>

          <div className="flex flex-col w-[60%] max-sm:w-[80%]">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
            />
          </div>

          <div className="flex flex-col w-[60%] max-sm:w-[80%]">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="border-2 border-transparent rounded-xl shadow-lg outline-none py-1 px-2 sametInputBgColor sametInputTextColor focus:border-blue-400"
            />
          </div>

          <div>
            <button
              type="submit"
              className="px-7 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all"
            >
              Login
            </button>
          </div>

          {err ? (
            <p className="text-red-500">Email or password is wrong.</p>
          ) : (
            ""
          )}

          <div>
            <span>
              Don't have an account ?
              <Link to={"/SignUp"} className="text-blue-500">
                {" "}
                Sign up
              </Link>
            </span>
          </div>
          <div>
            <span className="font-semibold">Trial Accounts:</span>
            <div className="mt-2">Email:cem@socialz.com</div>
            <div>Password:Cem123x?</div>
            <div className="mt-2">Email:hediye@socialz.com</div>
            <div>Password:Hediye123x?</div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Login;
