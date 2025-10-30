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
  const [started, setStarted] = useState(false); // 👈 mic started after button click

  const recognitionRef = useRef(null);
  const startRecognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  // 🔊 Speak function
  const speak = (text) => {
    if (!text) return;
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      console.log("✅ Done speaking, restarting mic...");
      setTimeout(() => {
        if (startRecognitionRef.current) startRecognitionRef.current();
      }, 3500);
    };

    synth.speak(utterance);
  };

  // 🚪 Sign Out
  const handleSignOut = async () => {
    try {
      await axios.get(`https://virt-assistant.vercel.app/api/auth/logout`, {
        withCredentials: true,
      });
      setuserdata(null);
      navigate("/signup");
    } catch {
      setuserdata(null);
    }
  };

  const handleCustomize = () => navigate("/customize");

  // 🎙️ Setup recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    const startRecognition = () => {
      if (isRecognizingRef.current || isSpeakingRef.current) return;
      try {
        recognition.start();
        console.log("🎙️ Recognition started");
      } catch (err) {
        console.warn("⚠️ Recognition start error:", err.message);
      }
    };
    startRecognitionRef.current = startRecognition;

    const stopRecognition = () => {
      try {
        recognition.stop();
        console.log("🛑 Recognition stopped");
      } catch {}
    };

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      console.log("Recognition ended.");
      if (!isSpeakingRef.current) {
        setTimeout(() => {
          if (started) startRecognition();
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current) {
        setTimeout(() => {
          if (started) startRecognition();
        }, 1500);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("🗣️ Heard:", transcript);
      setUserText(transcript);

      // 👇 Trigger AI when you say assistant name
      if (
        userdata?.assistantName &&
        transcript.toLowerCase().includes(userdata.assistantName.toLowerCase())
      ) {
        stopRecognition();
        try {
          const data = await getGeminiResponse(transcript);
          setAiText(data.response);
          setHistory((prev) => [...prev, { user: transcript, ai: data.response }]);
          speak(data.response);
        } catch (error) {
          console.error("AI error:", error);
          speak("Sorry, something went wrong.");
        }
      }
    };

    return () => {
      recognition.stop();
      isRecognizingRef.current = false;
      isSpeakingRef.current = false;
      synth.cancel();
    };
  }, [userdata, started]);

  // 🟢 Start mic manually
  const handleStart = () => {
    setStarted(true);
    if (startRecognitionRef.current) startRecognitionRef.current();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex">
      {/* Left side - History */}
      <div className="w-[300px] bg-black/30 border-r border-white/20 p-4 overflow-y-auto">
        <h2 className="text-white text-2xl font-semibold mb-4 text-center">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-300 text-center italic">No chats yet</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item, index) => (
              <li key={index} className="bg-white/10 p-3 rounded-xl text-white">
                <p className="text-yellow-300 text-sm italic">You: {item.user}</p>
                <p className="text-green-300 text-sm mt-1">
                  {userdata?.assistantName || "AI"}: {item.ai}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right side - Assistant */}
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

        {/* Assistant Avatar */}
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

        {/* Listening status */}
        <p className="text-white opacity-80 text-lg mt-2">
          {listening ? "🎧 Listening..." : "🛑 Inactive"}
        </p>

        {/* Start button */}
        {!started && (
          <button
            onClick={handleStart}
            className="mt-4 px-8 py-3 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition"
          >
            Start Assistant
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
