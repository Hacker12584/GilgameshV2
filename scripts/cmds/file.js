const fs = require('fs');

module.exports = {
  config: {
    name: "sendfile",
    aliases: ["file"],
    version: "1.0",
    author: "Mahir Tahsan",
    countDown: 5,
    role: 0,
    shortDescription: "Send bot script",
    longDescription: "Send bot specified file ",
    category: "owner",
    guide: "{pn} file name. Ex: .{pn} filename"
  },

  onStart: async function ({ message, args, api, event }) {
    const permission = ["100053549552408",];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("- Paku, You don't have permission to use this command. 🐤", event.threadID, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/🔴🟡🟢\n\n${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`🔴🟡🟢\n\nFile not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: fileContent }, event.threadID);
  }
};