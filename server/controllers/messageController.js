import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openRouter from "../configs/openRouter.js";
import gemini from "../configs/openai.js";
import { 
  getWeather, 
  getCricketScores, 
  getFootballScores, 
  detectRealTimeIntent 
} from "../utils/externalAPIs.js";

/**
 * Text-based AI Chat Message Controller
 * Handles text message generation with automatic fallback between OpenRouter and Gemini
 */
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    // Validate credits
    if (req.user.credits < 1) {
      return res.status(400).json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Prepare conversation context (last 10 text messages)
    const recentMessages = chat.messages
      .slice(-10)
      .filter((msg) => !msg.isImage)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Add current user message
    recentMessages.push({
      role: "user",
      content: prompt,
    });

    // Check if real-time data is needed
    const realTimeIntent = detectRealTimeIntent(prompt);
    
    // Generate AI reply with automatic fallback and real-time data support
    const completion = await _generateAIResponse(recentMessages, realTimeIntent);

    // Validate response
    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error("No response from AI model");
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Save AI reply
    const reply = {
      role: "assistant",
      content: completion.choices[0].message.content,
      timestamp: Date.now(),
      isImage: false,
    };
    chat.messages.push(reply);
    await chat.save();

    // Deduct credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    // Send response
    res.status(200).json({ success: true, reply });
  } catch (error) {
    _handleTextMessageError(error, res);
  }
};

/**
 * Generate AI response with automatic fallback and real-time data support
 * @param {Array} messages - Conversation messages
 * @param {Object} realTimeIntent - Detected real-time data intent
 * @returns {Object} AI completion response
 */
async function _generateAIResponse(messages, realTimeIntent = {}) {
  // Fetch real-time data if needed
  let realTimeData = null;
  let enhancedPrompt = messages[messages.length - 1].content;

  try {
    if (realTimeIntent.weather) {
      // Extract city name from prompt
      const cityMatch = messages[messages.length - 1].content.match(/(?:weather|temperature|forecast).*?(?:in|of|for)?\s*([A-Za-z\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : "Delhi";
      realTimeData = await getWeather(city);
      enhancedPrompt = `${messages[messages.length - 1].content}\n\n[Real-time weather data: ${JSON.stringify(realTimeData)}]`;
    } else if (realTimeIntent.cricket) {
      realTimeData = await getCricketScores();
      enhancedPrompt = `${messages[messages.length - 1].content}\n\n[Real-time cricket scores: ${JSON.stringify(realTimeData)}]`;
    } else if (realTimeIntent.football) {
      realTimeData = await getFootballScores();
      enhancedPrompt = `${messages[messages.length - 1].content}\n\n[Real-time football scores: ${JSON.stringify(realTimeData)}]`;
    }
  } catch (error) {
    console.warn("Real-time data fetch failed:", error.message);
    // Continue without real-time data
  }

  // Update last message with enhanced prompt if real-time data is available
  if (realTimeData) {
    messages[messages.length - 1] = {
      ...messages[messages.length - 1],
      content: enhancedPrompt
    };
  }

  const useGemini = process.env.USE_GEMINI === "true" || !process.env.OPENROUTER_API_KEY;
  
  // Use Gemini if configured (supports real-time data better)
  if (useGemini && process.env.GEMINI_API_KEY) {
    return await gemini.generateText(messages);
  }

  // Try OpenRouter first
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.2-3b-instruct:free";
      return await openRouter.chat.completions.create({
        model,
        messages,
      });
    } catch (openRouterError) {
      // Fallback to Gemini if OpenRouter fails
      if (process.env.GEMINI_API_KEY) {
        return await gemini.generateText(messages);
      }
      throw openRouterError;
    }
  }

  // Fallback to Gemini if no OpenRouter key
  if (process.env.GEMINI_API_KEY) {
    return await gemini.generateText(messages);
  }

  throw new Error("No AI API configured. Please set GEMINI_API_KEY or OPENROUTER_API_KEY");
}

/**
 * Handle errors in text message controller
 * @param {Error} error - Error object
 * @param {Object} res - Express response object
 */
function _handleTextMessageError(error, res) {
  console.error("Text message error:", error.message);

  const statusCode = error.status || error.statusCode || error.response?.status;
  const errorMessage = error.message || "Internal server error";

  // Handle specific error codes
  if (statusCode === 404 || error.code === 404 || errorMessage.includes("404") || errorMessage.includes("No endpoints found")) {
    return res.status(404).json({
      success: false,
      message: `Model not found. Please check your OPENROUTER_MODEL in .env file.`,
    });
  }

  if (statusCode === 402 || error.code === 402 || errorMessage.includes("402") || errorMessage.includes("Payment Required") || errorMessage.includes("spend limit")) {
    return res.status(402).json({
      success: false,
      message: "OpenRouter API key spending limit exceeded. Please add credits or switch to Gemini API (free).",
    });
  }

  if (statusCode === 429 || errorMessage.includes("429") || errorMessage.includes("rate limit")) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please try again in a few moments.",
    });
  }

  // Handle API response errors
  if (error.response) {
    const apiErrorMessage = error.response.data?.error?.message || 
                           error.response.data?.message || 
                           errorMessage;
    return res.status(error.response.status || 500).json({
      success: false,
      message: apiErrorMessage,
    });
  }

  // Generic error
  res.status(statusCode || 500).json({
    success: false,
    message: errorMessage,
  });
}

/**
 * Image Generation Message Controller
 * Handles AI image generation using ImageKit
 */
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { prompt, chatId, isPublished } = req.body;

    // Validate credits
    if (req.user.credits < 2) {
      return res.status(400).json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Generate and upload image
    const imageUrl = await _generateAndUploadImage(prompt);

    // Save AI reply
    const reply = {
      role: "assistant",
      content: imageUrl,
      timestamp: Date.now(),
      isImage: true,
      isPublished: isPublished || false,
    };
    chat.messages.push(reply);
    await chat.save();

    // Deduct credits
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    // Send response
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Image message error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate image",
    });
  }
};

/**
 * Generate image using ImageKit and upload it
 * @param {string} prompt - Image generation prompt
 * @returns {string} Uploaded image URL
 */
async function _generateAndUploadImage(prompt) {
  if (!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("IMAGEKIT_URL_ENDPOINT is not configured");
  }

  // Encode prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);
  const timestamp = Date.now();

  // Construct ImageKit AI generation URL
  const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${timestamp}.png?tr=w-800,h-800`;

  // Fetch generated image
  const imageResponse = await axios.get(generatedImageUrl, {
    responseType: "arraybuffer",
    timeout: 60000, // 60 second timeout for image generation
  });

  // Convert to Base64
  const base64Image = `data:image/png;base64,${Buffer.from(
    imageResponse.data,
    "binary"
  ).toString("base64")}`;

  // Upload to ImageKit
  const uploadResponse = await imagekit.upload({
    file: base64Image,
    fileName: `${timestamp}.png`,
    folder: "quickgpt",
  });

  if (!uploadResponse?.url) {
    throw new Error("Failed to upload image to ImageKit");
  }

  return uploadResponse.url;
}
