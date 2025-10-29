import { response } from "express"
import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from 'moment'

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId).select("password")
    if (!user) {
      return res.status(400).json({message:"user not found"})
    }
     return res.status(200).json(user)
    
  } catch (error) {
     return res.status(400).json({message:"get current user error"})
    
  }
}
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    if (!assistantName) {
      return res.status(400).json({ message: "Assistant name is required" });
    }

    let assistantImage;

    // Handle file upload (if user uploads image)
    if (req.file) {
      try {
        const uploadedUrl = await uploadOnCloudinary(req.file.path);
        assistantImage = uploadedUrl;
      } catch (err) {
        console.error("❌ Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    } else {
      // Use pre-selected image
      assistantImage = imageUrl || "";
    }

    // Update user in DB
    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Assistant updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Update Assistant Error:", error);
    return res.status(500).json({
      message: "Internal server error while updating assistant",
      error: error.message,
    });
  }
};


export const askToAssistant = async (req, res) => { 
  try {
    const {command}=req.body
    const user = await User.findById(req.body.userId);
    user.history.push(command)
    user.save()
    const userName = user.name
    const assistantName = user.assistantName
    const result = await geminiResponse(command, assistantName,userName, )
    const jsonMatch = result.match(/{[\s\S]*}/)
    if (!jsonMatch) {
      return res.status(400).json({response: "sorry i can't understand"})
    }
    const gemResult = JSON.parse(jsonMatch[0])
    const type = gemResult.type
    switch (type) {
      case `get-date`:
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`
        });
      case `get-time`:
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current time is ${moment().format("hh-mm-A")}`
        });
      case `get-day`:
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("dddd")}`
        });
      case `get-month`:
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `month is ${moment().format("MMMM")}`
        });
      case 'google_search':
      case 'youtube_search':
      case 'youtube_play':
      case 'general':
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "weather_show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
          
        });
      default:
        return res.status(400).json({response: "i didn't understand the command."})
          
    }


  } catch (error) {

    return res.status(500).json({response: "ask assistant error."})
    
  }
}





