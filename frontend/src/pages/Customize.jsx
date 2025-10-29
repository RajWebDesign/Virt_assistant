import React, { useContext, useRef } from "react";
import Card from "../components/Card";
import female from "../assets/female.jpg";
import male from "../assets/male.jpg";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function Customize() {
  const {
    backendImage,
    setBackendImage,
    frontImage,
    setFrontImage,
    SelectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFrontImage(imageUrl);
      setBackendImage(file);
      setSelectedImage("uploaded");
    }
  };

 
  const handleSelect = (type, img) => {
    setFrontImage(img);
    setBackendImage(null);
    setSelectedImage(type);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex flex-col justify-center items-center gap-8">
    
      <button
        onClick={() => navigate("/")} 
        className="absolute top-6 left-6 text-white text-3xl hover:text-gray-300 transition-all duration-300"
        title="Go Home"
      >
        <IoArrowBackOutline />
      </button>

      <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
        Select your Assistant
      </h1>

     
      <div className="flex justify-center items-center gap-6 flex-wrap">
        <div onClick={() => handleSelect("female", female)}>
          <Card image={female} isSelected={SelectedImage === "female"} />
        </div>

        <div onClick={() => handleSelect("male", male)}>
          <Card image={male} isSelected={SelectedImage === "male"} />
        </div>

        {frontImage && SelectedImage === "uploaded" ? (
          <Card image={frontImage} isSelected={true} />
        ) : (
          <label
            htmlFor="upload"
            className="w-[200px] h-[300px] sm:w-[180px] sm:h-[260px] bg-[blue] border-2 border-[blue] rounded-2xl overflow-hidden flex justify-center items-center hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 transition-all duration-300"
          >
            <FaFileUpload className="text-white w-[35px] h-[35px]" />
            <input
              id="upload"
              type="file"
              accept="image/*"
              ref={inputImage}
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {SelectedImage && (
        <button
          className="absolute bottom-8 right-8 bg-white text-[#3b3bbd] font-semibold px-6 py-2 rounded-full shadow-lg hover:bg-[#3b3bbd] hover:text-white transition-all duration-300"
          onClick={() => {
            console.log("Frontend Image:", frontImage);
            console.log("Backend Image:", backendImage);
            console.log("Selected Type:", SelectedImage);
            navigate("/customize2");
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}

export default Customize;
