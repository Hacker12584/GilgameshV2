const cron = require('node-cron');
const axios = require("axios");
const request = require('request');
const fs = require("fs");

const activeThreads = {};

module.exports = {
	config: {
		name: "shoticron",
		author: "who is tokodori", // Convert To Goat By Tokodori
		role: 2,
		shortDescription: "TikTok send every 2minutes",
		longDescription: "send tiktok video every 2minutes",
		category: "CRON",
		guide: "{pn}"
	},
	onStart: async function({api, event, input}) {
		const args = event.body.split(" ");
		const threadID = event.threadID;

		if (args[1] === "on") {
			if (!activeThreads[threadID]) {
				activeThreads[threadID] = true;
				api.sendMessage(`Automatic sending of videos is now enable.`, event.threadID);
				cron.schedule('*/2 * * * *', async () => {
					try {
						if (activeThreads[threadID]) {
							let response = await axios.post(
								"https://api--v1-shoti.vercel.app/api/v1/get",
								{
									apikey: "$shoti-1hfdaljvdsfauofg7j",
								}
							);
							var file = fs.createWriteStream(__dirname + "/cache/shoti.mp4");
							const userInfo = response.data.data.user;
							const username = userInfo.username;
							const nickname = userInfo.nickname;
							const tid = event.threadID;
							var rqs = request(encodeURI(response.data.data.url));
							rqs.pipe(file);
							file.on('finish', () => {
								api.sendMessage(
									{
										body: `Username: @${username}\nNickname: ${nickname}\nTid: ${tid}`,
										attachment: fs.createReadStream(__dirname + '/cache/shoti.mp4')
									}, threadID, (error, info) => {
										if (!error) {
											fs.unlinkSync(__dirname + '/cache/shoti.mp4');
										}
									});
							});
						}
					} catch (error) {
						console.error('Error:', error);
					}
				});
			} else {
				api.sendMessage("Automatic sending of videos is already ON in this thread.", threadID);
			}
		} else if (args[1] === "off") {
			if (activeThreads[threadID]) {
				activeThreads[threadID] = false;
				api.sendMessage(`Automatic sending of videos is now disable.`, threadID);
			} else {
				api.sendMessage("Automatic sending of videos is already OFF in this thread.", threadID);
			}
		}
	}
};