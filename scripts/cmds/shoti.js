const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "shoti",
    aliases: [],
    author: "itachi",//api is not mine api credit goes to api creator 
    version: "1.0",
    cooldowns: 10,
    role: 0,
    shortDescription: "Get random shoti video",
    longDescription: "Get random shoti video",
    category: "fun",
    guide: "{p}shoti",
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      
      const response = await axios.get("https://shoti-html.onrender.com/");
      const videoUrl = response.data.url; // Assuming the API returns a URL in the 'url' field
      const username = response.data.user || "@user_unknown"; // Assuming the API returns a username in the 'user' field

      const tempVideoPath = path.join(__dirname, "temp_shoti_video.mp4");
      const writer = fs.createWriteStream(tempVideoPath);

      const downloadResponse = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
      });

      downloadResponse.data.pipe(writer);

      writer.on("finish", async () => {
        const stream = fs.createReadStream(tempVideoPath);
        await message.reply({
          body: `username:"${username}"`,
          attachment: stream,
        });

        fs.unlink(tempVideoPath, (err) => {
          if (err) {
            console.error("Error deleting temporary video file:", err);
          }
        });
      });

      writer.on("error", (error) => {
        console.error("Error writing video file:", error);
        api.sendMessage("Sorry, something went wrong while downloading the shoti video. Please try again later.", event.threadID);
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("Sorry, something went wrong while fetching the shoti video. Please try again later.", event.threadID);
    }
  }
};
