const { put, post } = require("axios"),
qz = "https://quiz-t3jj.onrender.com", // hos this https://github.com/Jnn69/quiz and replace with your api url 
rewards = Math.floor(Math.random() * (1000 - 500) + 500);
async function onReply({ message: { unsend, reply }, Reply: { playerid, messageID, answer }, usersData, event: { body, senderID } }) {
  if (senderID !== playerid) return reply("⚠ You are not the player of this question!");
  try {
 const { data: { message: m } } = await put(`${qz}/scores`, {
  playerid,
 option: body?.toLowerCase() === answer.toLowerCase() ? 'correct' : 'wrong'
    });
let user = await usersData.get(senderID); 
  if (body?.toLowerCase() === answer.toLowerCase()) {
  user.money += rewards; 
  await usersData.set(senderID, user);
        }
 reply({ 
body: m.replace(/{reward}/g, rewards).replace(/{name}/g, user.name),
mentions: [{ id: playerid, tag: user.name }]
}); 
 } catch (e) {
reply(e.message);
 }
unsend(messageID);
}
async function onReaction({ message: { unsend, reply }, usersData, event: { reaction, userID }, Reaction: { answer, messageID, playerid } }) {
    if (userID !== playerid || (reaction !== "😆" && reaction !== "😠")) return;
    unsend(messageID);
    try {
        const { data: { message: m } } = await put(`${qz}/scores`, {
            playerid,
            option: reaction === answer ? 'correct' : 'wrong'
        });

   let user = await usersData.get(userID); 
      if (reaction === answer) {
    user.money += rewards; 
  await usersData.set(userID, user);
        }
 reply({ 
body: m.replace(/{reward}/g, rewards).replace(/{name}/g, user.name),
mentions: [{ id: playerid, tag: user.name }]
}); 
    } catch (e) {
        reply(e.message);
    }
    setTimeout(() => unsend(messageID), 60000);
}
async function onStart({ 
message: { reply, unsend }, 
args, 
usersData,
event: { 
senderID: playerid,
threadID
 }, 
commandName
 }) {
 try {
const name = await usersData.getName(playerid);
const p = await global.utils.getPrefix(threadID) + this.config.name;
const { data: { msg, link, question, answer } } = await post(`${qz}/quiz`, { 
category: args.join(" "),
name,
playerid
 });
if (msg) return reply(msg.replace(/{p}/g, p));
const options = { body: question };
 if (link) options.attachment = await global.utils.getStreamFromURL(link);
 const { messageID } = await reply(options);
 /^(true|false)$/i.test(answer.trim()) ?    global.GoatBot.onReaction.set(messageID, { 
commandName, 
playerid,
answer: answer.toLowerCase() === "true" ? "😆" : "😠", 
messageID 
}) : global.GoatBot.onReply.set(messageID, {
 commandName, 
messageID, 
playerid,
 answer
 });
setTimeout(() =>
unsend(messageID), 60000);
} catch (e) {
 reply(e.message);
}
}
module.exports = {
config: {
name: "quiz",
version: 2.0,
role: 0,
countDown: 0,
author: "Jun",
Description: { 
en: "Compete with other players and enhance your iq and earn money by playing this quiz"
 }, 
category: "games",
},
onStart,
onReply,
onReaction
};
