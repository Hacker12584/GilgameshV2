const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "logo",
    aliases: [],
    version: "1.0",
    author: "vex_Kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: "logo gen",
    longDescription: "logo gen",
    category: "image",
    guide: {
      en: "{p}meina [prompt]"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const baseUrl = "https://kshitiz-t2i-x6te.onrender.com/sdxl";
      let prompt = '';
      const model_id = 36; 

      if (args.length > 0) {
        prompt = args.join(" ").trim();
      } else {
        return message.reply("❌ | Please provide a prompt.");
      }

      const apiResponse = await axios.get(baseUrl, {
        params: {
          prompt: prompt,
          model_id: model_id
        }
      });

      if (apiResponse.data.imageUrl) {
        const imageUrl = apiResponse.data.imageUrl;
        const imagePath = path.join(__dirname, "cache", `logo.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
        const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
        imageStream.on("finish", () => {
          const stream = fs.createReadStream(imagePath);
          message.reply({
            body: "",
            attachment: stream
          });
        });
      } else {
        throw new Error("Image URL not found in response");
      }
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred. Please try again later.");
    }
  }
};
