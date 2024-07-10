const axios = require("axios");
const fs = require("fs");
const path = require("path");


const channelLinks = [ 

  "https://www.youtube.com/@amvquotes",
 
];

module.exports = {
  config: {
    name: "amvquote",
    aliases: ["amvquotes"], 
    author: "Vex_Kshitiz",
    cooldowns: 5,
    role: 0,
    shortDescription: "",
    longDescription: "amvquotes",
    category: "utility",
    guide: "{p}amvquote",
  },

  onStart: async function ({ api, event, args, message }) {
    api.setMessageReaction("✨", event.messageID, (err) => {}, true);

    try {

      const randomChannelLink = channelLinks[Math.floor(Math.random() * channelLinks.length)];


      const apiResponse = await axios.get(`https://anime-shorts.vercel.app/kshitiz?link=${encodeURIComponent(randomChannelLink)}`);


      const channelVideoUrl = apiResponse.data.urls[0];


      const videoResponse = await axios.get(channelVideoUrl, { responseType: "stream" });


      const tempVideoPath = path.join(__dirname, "cache", `channel.mp4`);

      const writer = fs.createWriteStream(tempVideoPath);
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {

        const stream = fs.createReadStream(tempVideoPath);


        message.reply({
          body: "",
          attachment: stream,
        });

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      });
    } catch (error) {
      console.error(error);
      message.reply("Sorry, an error occurred.");
    }
  }
};
