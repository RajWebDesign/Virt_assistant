import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Customize from './pages/Customize';
import Customize2 from './pages/Customize2';
import Home from './pages/Home';
import { userDataContext } from './context/UserContext';

function App() {
  const { userdata } = useContext(userDataContext);

  return (
    <Routes>
      <Route
        path="/"
        element={
          userdata?.assistantImage && userdata?.assistantName
            ? <Home />
            : <Navigate to="/customize" />
        }
      />
      <Route
        path="/signup"
        element={!userdata ? <SignUp /> : <Navigate to="/" />}
      />
      <Route
        path="/signin"
        element={!userdata ? <SignIn /> : <Navigate to="/" />}
      />
      <Route
        path="/customize"
        element={userdata ? <Customize /> : <Navigate to="/signup" />}
      />
      <Route
        path="/customize2"
        element={userdata ? <Customize2 /> : <Navigate to="/signup" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
