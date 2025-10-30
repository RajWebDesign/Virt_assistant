import React, { useState, useContext } from "react";
import axios from "axios";
import { userDataContext } from "../context/UserContext";

function Assistant() {
  const { userdata } = useContext(userDataContext);
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const handleAssistantAction = (result) => {
    const { type, userInput, response } = result;
    speak(response);
    setResponse(response);

    switch (type) {
      case "instagram_open":
        window.open("https://www.instagram.com", "_blank");
        break;
      case "facebook_open":
        window.open("https://www.facebook.com", "_blank");
        break;
      case "youtube_play":
      case "youtube_search": {
        const query = userInput.replace(/play|search/gi, "").trim();
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          "_blank"
        );
        break;
      }
      case "google_search": {
        const query = userInput.replace(/search/gi, "").trim();
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          "_blank"
        );
        break;
      }
      case "weather_show":
        window.open("https://www.google.com/search?q=weather", "_blank");
        break;
      case "calculator_open":
        speak("Sorry, I can't open calculator directly from browser.");
        break;
      default:
        break;
    }
  };

  const askAssistant = async () => {
    if (!command.trim()) return;
    try {
      const res = await axios.post(`https://virt-assistant-1.onrender.com/api/assistant/askToAssistant`, {
        command,
        userId: userdata._id,
      });
      handleAssistantAction(res.data);
    } catch (err) {
      speak("Sorry, I had trouble understanding that.");
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = async (event) => {
      const voiceCommand = event.results[0][0].transcript;
      setCommand(voiceCommand);
      const res = await axios.post(`https://virt-assistant-1.onrender.com/api/assistant/askToAssistant`, {
        command: voiceCommand,
        userId: userdata._id,
      });
      handleAssistantAction(res.data);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Virtual Assistant</h1>

      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Ask me anything..."
        className="border p-2 rounded w-80 mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={askAssistant}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Ask
        </button>
        <button
          onClick={startListening}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Speak
        </button>
      </div>

      {response && (
        <p className="mt-4 text-lg text-gray-700">
          <strong>Assistant:</strong> {response}
        </p>
      )}
    </div>
  );
}

export default Assistant;
