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
  const startRecognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  // 🎤 Speak and auto-restart listening
  const speak = (text) => {
    if (!text) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // normal speed
    utterance.pitch = 1;
    utterance.volume = 1;

    isSpeakingRef.current = true;
    setListening(false);

    utterance.onend = () => {
      console.log("✅ Speaking finished");
      isSpeakingRef.current = false;

      // restart recognition smoothly
      setTimeout(() => {
        if (startRecognitionRef.current) startRecognitionRef.current();
      }, 1200);
    };

    synth.speak(utterance);
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
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Try using Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // 👈 important: prevent overlap
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    const startRecognition = () => {
      if (isRecognizingRef.current || isSpeakingRef.current) return;
      try {
        recognition.start();
        console.log("🎤 Listening started...");
      } catch (e) {
        if (e.name !== "InvalidStateError") console.error(e);
      }
    };
    startRecognitionRef.current = startRecognition;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      console.log("✅ Recognition started");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      console.log("🛑 Recognition ended");
      if (!isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 800);
      }
    };

    recognition.onerror = (event) => {
      console.warn("⚠️ Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 1200);
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("🗣️ Heard:", transcript);
      setUserText(transcript);

      // 👂 trigger response only if it includes assistant name
      if (
        userdata?.assistantName &&
        transcript.toLowerCase().includes(userdata.assistantName.toLowerCase())
      ) {
        recognition.stop(); // stop listening while processing
        try {
          const data = await getGeminiResponse(transcript);
          const response = data.response || "Sorry, I couldn’t process that.";
          setAiText(response);
          setHistory((prev) => [...prev, { user: transcript, ai: response }]);
          speak(response);
        } catch (err) {
          console.error("Gemini fetch error:", err);
          speak("Sorry, something went wrong.");
        }
      }
    };

    startRecognition();
    return () => {
      recognition.stop();
      isRecognizingRef.current = false;
    };
  }, [userdata]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex">
      {/* Left History Panel */}
      <div className="w-[300px] bg-black/30 border-r border-white/20 p-4 overflow-y-auto">
        <h2 className="text-white text-2xl font-semibold mb-4 text-center">
          🕒 History
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-300 text-center italic">No chats yet</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item, index) => (
              <li key={index} className="bg-white/10 p-3 rounded-xl text-white">
                <p className="text-yellow-300 text-sm italic">
                  You: {item.user}
                </p>
                <p className="text-green-300 text-sm mt-1">
                  {userdata?.assistantName || "AI"}: {item.ai}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
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

        <div className="w-[250px] h-[330px] flex justify-center items-center overflow-hidden rounded-[25px] shadow-xl border-2 border-white">
          <img
            src={userdata?.assistantImage}
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
          {userText && (
            <p className="text-base italic text-yellow-300">
              You said: "{userText}"
            </p>
          )}
          {aiText && (
            <p className="text-base text-green-300 mt-2">
              {userdata?.assistantName || "AI"}: {aiText}
            </p>
          )}
        </div>

        <p className="text-white opacity-80 text-lg mt-2">
          {listening ? "🎙️ Listening..." : "🔇 Inactive"}
        </p>
      </div>
    </div>
  );
}

export default Home;
