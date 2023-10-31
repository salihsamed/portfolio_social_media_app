import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./page/Login";
import Home from "./page/Home";
import SignUp from "./page/SignUp";
import Profile from "./page/Profile";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState } from "react";
import Layout from "./components/Layout/Layout";
import PostPage from "./page/PostPage";
import Settings from "./page/Settings";
function App() {
  const [option, setOption] = useState(null);

  const ProtectedRoute = ({ children }) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setOption(1);
      } else {
        setOption(2);
      }
    });

    if (option === 1) {
      return children;
    } else if (option === 2) {
      return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="Login" element={<Login />} />
        <Route path="SignUp" element={<SignUp />} />
        <Route
          path="/"
          index
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="Profile/:userName"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path=":userID/Post/:postID"
          element={
            <Layout>
              <PostPage />
            </Layout>
          }
        />
        <Route
          path="Settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
