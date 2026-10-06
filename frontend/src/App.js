import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import Home from "./modules/common/Home";
import Login from "./modules/common/Login";
import Register from "./modules/common/Register";
import ForgotPassword from "./modules/common/ForgotPassword";
import { createContext, useEffect, useState } from "react";
import AdminHome from "./modules/admin/AdminHome";
import OwnerHome from "./modules/user/Owner/OwnerHome";
import RenterHome from "./modules/user/renter/RenterHome";

export const UserContext = createContext();

/* The session lives in localStorage, so read it before the first render. The
   old code only filled this in from an effect, which left a directly visited
   /adminhome "signed out" for one render - and because the three home routes
   were declared only once signed in, a page that matched no route at all
   painted a blank screen instead of sending the visitor to /login. */
const readSession = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && typeof user === "object" ? user : undefined;
  } catch (error) {
    return undefined;
  }
};

function App() {
  const date = new Date().getFullYear();
  const [userData, setUserData] = useState(readSession);
  const [userLoggedIn, setUserLoggedIn] = useState(() => Boolean(readSession()));

  const getData = async () => {
    try {
      const user = await JSON.parse(localStorage.getItem("user"));
      if (user && typeof user === "object") {
        setUserData(user);
        setUserLoggedIn(true)
      } else {
        setUserData(undefined);
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // A page that needs a session sends the visitor to /login rather than
  // matching no route at all and showing nothing.
  const needsSession = (page) => (userLoggedIn ? page : <Navigate to="/login" replace />);
  return (
    <UserContext.Provider value={{userData, userLoggedIn}}>
      <div className="App">
        <Router>
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/adminhome" element={needsSession(<AdminHome />)} />
              <Route path="/ownerhome" element={needsSession(<OwnerHome />)} />
              <Route path="/renterhome" element={needsSession(<RenterHome />)} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <footer className="bg-light text-center text-lg-start">
            <div className="text-center p-3">
              © {date} Copyright: RentEase
            </div>
          </footer>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;
