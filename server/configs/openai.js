import axios from "axios";

/**
 * Gemini API Configuration
 * Uses direct REST API calls to Google's Gemini API
 * Supports multiple free models with automatic fallback
 */
const geminiAPI = {
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  
  /**
   * Convert OpenAI-style messages to Gemini format
   * @param {Array} messages - Array of messages with role and content
   * @returns {Array} Gemini-formatted contents array
   */
  _convertMessagesToGeminiFormat(messages) {
    return messages
      .filter(msg => msg.role === "user" || msg.role === "assistant")
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));
  },

  /**
   * Generate text using Gemini API with automatic model fallback
   * Supports function calling for real-time data
   * @param {Array} messages - Conversation messages
   * @param {Object} tools - Optional tools/functions for real-time data
   * @returns {Object} OpenAI-compatible response format
   */
  async generateText(messages, tools = null) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const contents = this._convertMessagesToGeminiFormat(messages);
    
    // Prepare request payload
    const requestPayload = { contents };
    
    // Add tools if provided (for function calling)
    if (tools && tools.length > 0) {
      requestPayload.tools = tools;
    }
    
    // Free models in order of preference (fastest to slowest)
    const modelsToTry = [
      "gemini-2.5-flash",      // Latest, fastest free model with function calling
      "gemini-flash-latest",   // Stable flash model
      "gemini-pro-latest",     // Pro model with latest features
      "gemini-2.0-flash",      // Alternative flash model
    ];
    
    let lastError = null;
    
    for (const modelName of modelsToTry) {
      try {
        const response = await axios.post(
          `${this.baseURL}/models/${modelName}:generateContent?key=${this.apiKey}`,
          requestPayload,
          { 
            headers: { "Content-Type": "application/json" },
            timeout: 30000 // 30 second timeout
          }
        );
        
        const candidate = response.data?.candidates?.[0];
        if (!candidate?.content?.parts?.[0]) {
          continue;
        }

        // Check if function call is requested
        const part = candidate.content.parts[0];
        if (part.functionCall) {
          return {
            choices: [{
              message: {
                role: "assistant",
                content: null,
                function_call: {
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args || {})
                }
              }
            }]
          };
        }
        
        // Regular text response
        if (part.text) {
          return {
            choices: [{
              message: {
                role: "assistant",
                content: part.text
              }
            }]
          };
        }
        
        continue;
      } catch (error) {
        lastError = error;
        // Continue to next model
        continue;
      }
    }
    
    // All models failed
    const errorMessage = lastError?.response?.data?.error?.message || 
                        lastError?.message || 
                        "All Gemini models failed";
    throw new Error(`Gemini API error: ${errorMessage}`);
  }
};

export default geminiAPI;
