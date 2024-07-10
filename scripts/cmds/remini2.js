const axios = require('axios');
const fs = require('fs-extra');
const tinyurl = require('tinyurl');

module.exports = {
 config: {
  name: "remini2",
  version: "2.2",
  role: 2,
  countDown: 3,
  author: "Aljur",
  shortDescription: { 
  en: "( 𝚁𝚎𝚖𝚒𝚗𝚒 )"
  },
  category: "Image",
  guide: {
  en: "{p}{n}reply to an image/send a image link"
    },
},

  onStart: async function({ api, event, args, message }) {
    const getImageUrl = () => {
      if (event.type === "message_reply") {
        const replyAttachment = event.messageReply.attachments[0];
        if (["photo", "sticker"].includes(replyAttachment?.type)) {
          return replyAttachment.url;
        } else {
          throw new Error("𝙼𝚞𝚜𝚝 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎.");
        }
      } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g) || null) {
        return args[0];
      } else {
        throw new Error("𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎.");
      }
    };
    const { threadID, messageID } = event;
    try {
      const imageUrl = await getImageUrl();
      const shortUrl = await tinyurl.shorten(imageUrl);
        message.reply("𝙴𝚗𝚑𝚊𝚗𝚌𝚒𝚗𝚐 𝚢𝚘𝚞𝚛 𝚒𝚖𝚊𝚐𝚎, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝 𝚊 𝚠𝚑𝚒𝚕𝚎...🖤✨");

    const response = await axios.get(`https://code-merge-api-hazeyy01.replit.app/api/try/remini?url=${encodeURIComponent(shortUrl)}`);

    const processedImageURL = response.data.image_data;

        message.reply({ body: "✨ 𝙴𝚗𝚑𝚊𝚗𝚌𝚎𝚍 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢...", attachment: await global.utils.getStreamFromURL(processedImageURL) });
      } catch (error) {
        message.reply("Error: " + error.message);
         }
       }
   }
  
