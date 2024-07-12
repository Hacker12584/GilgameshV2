const axios = require("axios");

module.exports = {
	config: {
		name: "gemini",
		version: "1.0",
		author: "Samir OE",
		countDown: 5,
		role: 0,
		category: "google"
	},
	onStart: async function({ message, event, args, commandName }) {
		const text = args.join(' ');

		try {
			const response = await axios.get(`https://bnw.samirzyx.repl.co/api/Gemini?text=${encodeURIComponent(text)}`);

			if (response.data && response.data.candidates && response.data.candidates.length > 0) {
				const textContent = response.data.candidates[0].content.parts[0].text;
				const ans = `${textContent}`;
				message.reply({
					body: ans,
				}, (err, info) => {
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						author: event.senderID
					});
				});
			} 

		} catch (error) {
			console.error("Error:", error.message);
		}
	},

	onReply: async function({ message, event, Reply, args }) {
		let { author, commandName } = Reply;
		if (event.senderID != author) return;
		const gif = args.join(' ');

		try {
			const response = await axios.get(`https://bnw.samirzyx.repl.co/api/Gemini?text=${encodeURIComponent(gif)}`);

			if (response.data && response.data.candidates && response.data.candidates.length > 0) {
				const textContent = response.data.candidates[0].content.parts[0].text;
				const wh = `${textContent}`;
				message.reply({
					body: wh,
				}, (err, info) => {
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						author: event.senderID
					});
				});
			} 

		} catch (error) {
			console.error("Error:", error.message);
		}
	}
};