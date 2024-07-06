module.exports = {
config: {
name: "leaveall",
Author: "Aljur Pogoy",
role: 2,
category: "owner"
},
//Ok
onStart: async function ({ message, event, api }) {

const allThread = await threadsData.getAll();
const groupThreads = allThread.filter(t => t.isGroup && t.members.some(m => m.userID == api.getCurrentUserID() && m.inGroup));
const threadIdsToRemove = groupThreads.map(t => t.threadID);

if (threadIdsToRemove.length === 0) {
  message.reply("There are no groups to leave.");
  return;
}

message.reply("✅ | Leaving all groups");

const leftCount = threadIdsToRemove.length;
for (const threadId of threadIdsToRemove) {
  try {
    await api.removeUserFromGroup(api.getCurrentUserID(), threadId);
  } catch (error) {
    message.reply(error);
  }
}

message.reply(`✅ | Successfully left ${leftCount} group(s)`);

}
};
