import React, { createContext, useEffect, useState } from "react";
import axios from "axios";


export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "https://virt-assistant-1.onrender.com/";

  const [userdata, setuserdata] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [SelectedImage, setSelectedImage] = useState(null);


  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setuserdata(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGeminiResponse = async (command) => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/user/asktoassistant`,
      { command, userId: userdata?._id },
      { withCredentials: true }
    );
    return result.data;
  } catch (error) {
    console.error("Gemini request error:", error);
  }
};






  useEffect(() => {
    handleCurrentUser();
  }, []);

  
  return (
    <userDataContext.Provider
      value={{
        serverUrl,
        userdata,
        setuserdata,
        backendImage,

        setBackendImage,

        frontImage,
        setFrontImage,
        SelectedImage,
        getGeminiResponse ,
        setSelectedImage,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;
