import React, { useContext, useEffect, useState, useRef } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

function Home() {
  const { userdata, setuserdata, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([]);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const speak = (text) => {
    if (!text) return;
    if (recognitionRef.current) recognitionRef.current.stop();

    const utter = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    utter.onend = () => {
      isSpeakingRef.current = false;
      if (recognitionRef.current) recognitionRef.current.start();
    };
    window.speechSynthesis.speak(utter);
  };

  const handleSignOut = async () => {
    try {
      await axios.get(`https://virt-assistant-1.onrender.com/api/auth/logout`, { withCredentials: true });
      setuserdata(null);
      navigate("/signup");
    } catch (error) {
      console.error(error);
      setuserdata(null);
    }
  };

  const handleCustomize = () => navigate("/customize");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !userdata) {
      console.error("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true; // manual restart loop
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    const startRecognition = () => {
      if (isSpeakingRef.current) return;
      try {
        recognition.start();
        setListening(true);
      } catch {}
    };

    recognition.onstart = () => setListening(true);

    recognition.onend = () => {
      setListening(false);
      if (!isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 300);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      setTimeout(() => startRecognition(), 500);
    };

recognition.onresult = async (e) => {
  let transcript = "";
  for (let i = e.resultIndex; i < e.results.length; i++) {
    transcript += e.results[i][0].transcript;
  }
  
  // Only handle final transcripts
  const isFinal = e.results[e.results.length - 1].isFinal;
  if (!isFinal) {
    setUserText(transcript); // just update live transcript
    return; // don't respond yet
  }

  transcript = transcript.trim();
  setUserText(transcript);

  if (userdata?.assistantName && transcript.toLowerCase().includes(userdata.assistantName.toLowerCase())) {
    recognition.stop();
    try {
      const data = await getGeminiResponse(transcript);
      setAiText(data.response);
      setHistory((prev) => [...prev, { user: transcript, ai: data.response }]);
      speak(data.response);
    } catch (err) {
      console.error("Gemini fetch error:", err);
    }
  }
};


    startRecognition();

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [userdata]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex">
      {/* Sidebar */}
      <div className="w-[300px] bg-black/30 border-r border-white/20 p-4 overflow-y-auto">
        <h2 className="text-white text-2xl font-semibold mb-4 text-center">🕒 History</h2>
        {history.length === 0 ? (
          <p className="text-gray-300 text-center italic">No chats yet</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item, idx) => (
              <li key={idx} className="bg-white/10 p-3 rounded-xl text-white">
                <p className="text-yellow-300 text-sm italic">You: {item.user}</p>
                <p className="text-green-300 text-sm mt-1">
                  {userdata?.assistantName || "AI"}: {item.ai}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        {/* Buttons */}
        <div className="absolute top-6 right-6 flex flex-col gap-4 items-end">
          <button
            onClick={handleCustomize}
            className="bg-white text-[#3b3bbd] font-semibold text-[17px] px-6 py-2 rounded-full shadow-md hover:bg-[#3b3bbd] hover:text-white transition-all duration-300"
          >
            Customize Assistant
          </button>
          <button
            onClick={handleSignOut}
            className="bg-white text-[#3b3bbd] font-semibold text-[17px] px-6 py-2 rounded-full shadow-md hover:bg-[#3b3bbd] hover:text-white transition-all duration-300"
          >
            Sign Out
          </button>
        </div>

        {/* Assistant Image */}
        <div className="w-[250px] h-[330px] flex justify-center items-center overflow-hidden rounded-[25px] shadow-xl border-2 border-white">
          <img
            src={userdata?.assistantImage || aiImg}
            alt={userdata?.assistantName || "Assistant"}
            className="h-full object-cover"
          />
        </div>

        <h1 className="text-white text-2xl font-semibold">
          I am {userdata?.assistantName || "Your Virtual Assistant"}
        </h1>

        {!aiText && <img src={userImg} alt="" className="w-[80px]" />}
        {aiText && <img src={aiImg} alt="" className="w-[80px]" />}

        <div className="text-center text-white mt-3">
          {userText && <p className="text-base italic text-yellow-300">You said: "{userText}"</p>}
          {aiText && <p className="text-base text-green-300 mt-2">{userdata?.assistantName || "AI"}: {aiText}</p>}
        </div>

        <p className="text-white opacity-80 text-lg mt-2">{listening ? "🎙️ Listening..." : "🔇 Inactive"}</p>

        {/* Optional Mic Button */}
        <button
          onClick={() => recognitionRef.current?.start()}
          className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-full font-semibold"
        >
          🎤 Start Listening
        </button>
      </div>
    </div>
  );
}

export default Home;
