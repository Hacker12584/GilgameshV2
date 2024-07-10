const axios = require('axios');

async function copilot(api, event, args, message) {
  try {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return message.reply("Please provide a prompt.");
    }

    const response = await getCopilotResponse(prompt);

    if (response && response.answer) {
      message.reply(response.answer, (r, s) => {
        global.GoatBot.onReply.set(s.messageID, {
          commandName: module.exports.config.name,
          uid: event.senderID 
        });
      });
    } else {
      message.reply("No response from Copilot.");
    }
  } catch (error) {
    console.error("Error:", error);
    message.reply("An error occurred while processing your request.");
  }
}

async function getCopilotResponse(prompt) {
  try {
    const url = `https://copilot-ai-six.vercel.app/kshitiz?prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error from Copilot API:", error.message);
    throw error;
  }
}

module.exports = {
  config: {
    name: "copilot",
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    longDescription: "microsoft copilot ai.",
    category: "ai",
    guide: {
      en: "{p}copilot [prompt]"
    }
  },

  handleCommand: copilot,
  onStart: function ({ api, message, event, args }) {
    return copilot(api, event, args, message);
  },
  onReply: function ({ api, message, event, args }) {
    return copilot(api, event, args, message);
  }
};
