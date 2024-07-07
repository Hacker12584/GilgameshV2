const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const ytdl = require("ytdl-core");
const yts = require("yt-search");

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

async function sing(api, event, args, message) {
  api.setMessageReaction("🕢", event.messageID, (err) => {}, true);
  try {
    let title = '';

    const extractShortUrl = async () => {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "video" || attachment.type === "audio") {
        return attachment.url;
      } else {
        throw new Error("Invalid attachment type.");
      }
    };

    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0 && args.length === 0) {
      const shortUrl = await extractShortUrl();
      const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
      title = musicRecognitionResponse.data.title;
    } else if (args.length > 0 && args[0] !== 'sing') {
      title = args.join(" ");
    } else {
      message.reply("");
      return;
    }

    const searchResults = await yts(title);
    if (!searchResults.videos.length) {
      message.reply("No song found for the given query.");
      return;
    }

    const videoUrl = searchResults.videos[0].url;
    const stream = await ytdl(videoUrl, { filter: "audioonly" });

    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "cache", fileName);
    const writer = fs.createWriteStream(filePath);

    stream.pipe(writer);

    writer.on('finish', async () => {
      try {
        const audioStream = fs.createReadStream(filePath);
        const sentMessage = await message.reply({ body: `🎧 Playing: ${title}`, attachment: audioStream });
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: singCommand.name,
          uid: event.senderID
        });
      } catch (error) {
        console.error('Error sending message:', error.message);
        message.reply("An error occurred while sending the audio file.");
      } finally {
        await fs.unlink(filePath);
      }
    });

    writer.on('error', (error) => {
      console.error("Error:", error);
      message.reply("An error occurred while processing the audio file.");
    });
  } catch (error) {
    console.error("Error:", error);
    message.reply("An error occurred while processing the request.");
  }
}

function handleReply(api, event, args, message) {
  const replyData = global.GoatBot.onReply.get(event.messageReply.messageID);

  if (replyData && replyData.uid === event.senderID) {
    global.GoatBot.onReply.delete(event.messageReply.messageID);
    const newArgs = event.body.split(" ");
    return sing(api, event, newArgs, message);
  }
}

const singCommand = {
  name: "sing",
  version: "2.0",
  author: "Vex_kshitiz",
  countDown: 10,
  role: 0,
  shortDescription: "play music from yt",
  longDescription: "play music from yt support audio recognition.",
  category: "music",
  guide: "{p}sing {musicName} or reply to audio or video by {p}sing"
};

module.exports = {
  config: singCommand,
  handleCommand: sing,
  onStart: async function ({ api, event, message, args }) {
    const isAuthorValid = await checkAuthor(module.exports.config.author);
    if (!isAuthorValid) {
      await message.reply("Author changer alert! This command belongs to Vex_Kshitiz.");
      return;
    }

    return sing(api, event, args, message);
  },
  onReply: function ({ api, message, event, args }) {
    if (event.type === 'message_reply') {
      if (event.messageReply.attachments && event.messageReply.attachments.length > 0 && event.body.trim() === 'sing') {
        return sing(api, event, [], message);
      } else if (event.messageReply.body && event.messageReply.body.trim() !== '') {
        return handleReply(api, event, args, message);
      }
    }
  }
};
