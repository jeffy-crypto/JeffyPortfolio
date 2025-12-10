// src/services/aiService.js
import axios from 'axios';

// --- PASTE YOUR N8N PRODUCTION WEBHOOK URL HERE ---
const n8nWebhookUrl = 'https://jefersonpangan.app.n8n.cloud/webhook/d5cca8b5-0ef8-48bf-b3c0-5392de15bc19/chat';

export const runChat = async (prompt) => {
  try {
    const response = await axios.post(n8nWebhookUrl, {
      prompt: prompt
    });
    
    // The AI Agent returns its response in a 'text' field
    const botMessage = response.data.text;

    if (botMessage === undefined) {
      throw new Error("The 'text' field was not found in the n8n response.");
    }
    return botMessage;

  } catch (error) {
    console.error("Error calling n8n workflow:", error.response ? error.response.data : error.message);
    return "Sorry, my connection to the workflow server failed. Please try again.";
  }
};