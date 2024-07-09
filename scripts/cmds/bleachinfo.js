const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bleachinfo",
    aliases: [],
    author: "Vex_Kshitiz",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "",
    longDescription: "Get information about bleach anime character.",
    category: "fun",
    guide: "{p}bleach {name}",
  },

  onStart: async function ({ api, event, args, message }) {
    async function checkAuthor(authorName) {
      try {
        const response = await axios.get('https://author-check.vercel.app/name');
        const apiAuthor = response.data.name;
        return apiAuthor === authorName;
      } catch (error) {
        console.error("Error checking author:", error);
        return false;
      }
    }

    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await message.reply("Author changer alert! this cmd belongs to Vex_Kshitiz.");
      return;
    }

    const characterName = args.join(" ");
    const opApiUrl = `https://character-info-kshitiz.vercel.app/bleach?character=${encodeURIComponent(characterName)}`;

    try {
      const response = await axios.get(opApiUrl);
      const { title, description, image, info } = response.data;

      const infoText = Object.entries(info)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const messageBody = `Name: ${title}\n\nDescription: ${description}\n\n${infoText}`;

      const tempImagePath = path.join(__dirname, "cache", `${Date.now()}_${title}.jpg`);

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(tempImagePath);
        writer.on("finish", resolve);
        writer.on("error", reject);
        axios.get(image, { responseType: "stream" }).then(imageResponse => {
          imageResponse.data.pipe(writer);
        }).catch(reject);
      });

      const stream = fs.createReadStream(tempImagePath);
      message.reply({
        body: messageBody,
        attachment: stream,
      }, (err) => {
        if (err) console.error(err);
        fs.unlink(tempImagePath, (err) => {
          if (err) console.error(`Error deleting temp file: ${err}`);
        });
      });

    } catch (error) {
      console.error(error);
      message.reply("Sorry, an error occurred while processing your request.");
    }
  }
};
