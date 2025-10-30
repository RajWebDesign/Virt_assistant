import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

function Home() {
  const { userdata, setuserdata } = useContext(userDataContext);
  const navigate = useNavigate();
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [history, setHistory] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  const speak = (text, callback) => {
    if (!text) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => {
      isSpeakingRef.current = false;
      if (callback) callback();
    };
    isSpeakingRef.current = true;
    synth.speak(utter);
  };

  const handleSignOut = async () => {
    try {
      await axios.get(`https://virt-assistant-1.onrender.com/api/auth/logout`, { withCredentials: true });
      setuserdata(null);
      navigate("/signup");
    } catch (error) {
      setuserdata(null);
    }
  };

  const handleAction = (type, userInput) => {
    switch (type) {
      case "google_search":
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
        break;
      case "youtube_search":
      case "youtube_play":
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
        break;
      case "instagram_open":
        window.open("https://www.instagram.com", "_blank");
        break;
      case "facebook_open":
        window.open("https://www.facebook.com", "_blank");
        break;
      case "calculator_open":
        window.open("calculator://", "_blank");
        break;
      case "weather_show":
        window.open(`https://www.google.com/search?q=weather`, "_blank");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    const startListening = () => {
      if (isSpeakingRef.current) return;
      try {
        recognition.start();
        setListening(true);
      } catch (e) {}
    };

    recognition.onend = () => {
      setListening(false);
      if (!isSpeakingRef.current) setTimeout(startListening, 200);
    };

    recognition.onerror = () => {
      setListening(false);
      setTimeout(startListening, 400);
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      setUserText(transcript);
      if (userdata?.assistantName && transcript.toLowerCase().includes(userdata.assistantName.toLowerCase())) {
        try {
          const res = await axios.post(
            "https://virt-assistant-1.onrender.com/api/assistant/ask",
            { command: transcript, userId: userdata._id },
            { withCredentials: true }
          );
          const data = res.data;
          setAiText(data.response);
          setHistory((prev) => [...prev, { user: transcript, ai: data.response }]);
          handleAction(data.type, data.userInput);
          speak(data.response, () => startListening());
        } catch (err) {
          speak("Sorry, something went wrong.", () => startListening());
        }
      }
    };

    startListening();
    return () => recognition.stop();
  }, [userdata]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-t from-black to-[#3b3bbd] flex">
      <div className="w-[300px] bg-black/30 border-r border-white/20 p-4 overflow-y-auto">
        <h2 className="text-white text-2xl font-semibold mb-4 text-center">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-300 text-center italic">No chats yet</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item, index) => (
              <li key={index} className="bg-white/10 p-3 rounded-xl text-white">
                <p className="text-yellow-300 text-sm italic">You: {item.user}</p>
                <p className="text-green-300 text-sm mt-1">{userdata?.assistantName || "AI"}: {item.ai}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        <div className="absolute top-6 right-6 flex flex-col gap-4 items-end">
          <button
            onClick={() => navigate("/customize")}
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
          <img src={userdata?.assistantImage} alt={userdata?.assistantName || "Assistant"} className="h-full object-cover" />
        </div>

        <h1 className="text-white text-2xl font-semibold">I am {userdata?.assistantName || "Your Virtual Assistant"}</h1>

        {!aiText && <img src={userImg} alt="" className="w-[80px]" />}
        {aiText && <img src={aiImg} alt="" className="w-[80px]" />}

        <div className="text-center text-white mt-3">
          {userText && <p className="text-base italic text-yellow-300">You said: "{userText}"</p>}
          {aiText && <p className="text-base text-green-300 mt-2">{userdata?.assistantName || "AI"}: {aiText}</p>}
        </div>

        <p className="text-white opacity-80 text-lg mt-2">{listening ? "Listening..." : "Inactive"}</p>
      </div>
    </div>
  );
}

export default Home;
