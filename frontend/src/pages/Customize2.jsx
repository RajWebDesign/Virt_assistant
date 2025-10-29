import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { userDataContext } from "../context/UserContext";

function Customize2() {
  const navigate = useNavigate();
  const {
    userdata,
    backendImage,
    SelectedImage,
    frontImage,
    serverUrl,
    setuserdata,
  } = useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(userdata?.assistantName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    if (!assistantName) {
      alert("Please enter your assistant's name");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);

     
      if (backendImage && backendImage instanceof File) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", frontImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        {
          withCredentials: true, 
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(" Update success:", result.data);

      setuserdata(result.data.user || result.data);

      
      navigate("/");
    } catch (error) {
      console.error(" Update error:", error);
      alert("Something went wrong while updating your assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex flex-col justify-center items-center gap-8">

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 text-white text-3xl hover:text-gray-300 transition-all duration-300"
        title="Go Back"
      >
        <IoArrowBackOutline />
      </button>

   
      <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
        Give a Name to your Assistant
      </h1>

      <input
        type="text"
        placeholder="Rajnandini..."
        className="w-80 h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

    
      {assistantName && (
        <button
          className={`absolute bottom-8 right-8 ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-[#3b3bbd] hover:bg-[#3b3bbd] hover:text-white"
          } font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-300`}
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {loading ? "Loading..." : "Done →"}
        </button>
      )}
    </div>
  );
}

export default Customize2;
