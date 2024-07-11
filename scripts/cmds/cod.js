
module.exports.config = {
  name: "cod",
  version: "90",
  role: 0,
  countdown: 5,
  author: `OtinXSandip`,
  description: "Generate codm Banner",
  category: "Image",
  usages: "<text>",
};
module.exports.onStart = async function ({ api, event, args, Users }) {
  let { senderID, threadID, messageID } = event;
  const request = require('request');
  const fs = require("fs-extra");
  const axios = require("axios");
  let pathImg = __dirname + `/cache/${event.threadID}_${event.senderID}.jpg`;
  let text = args.join(" ");
  if (!text) return api.sendMessage(`Wrong fomat\nUse: ${this.config.name} text`, event.threadID, event.messageID);
  let getWanted = (
    await axios.get(`https://canvastest.heckerman06.repl.co/burat3?name=${text}`, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(getWanted, "utf-8"));
  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};
