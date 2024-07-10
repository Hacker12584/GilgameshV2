module.exports = {
config: {
name: "uptime",
category: "System"
},
onStart: async function({message}) {
const d = Math.floor(process.uptime() / 86400 );
const h = Math.floor(process.uptime() / 3600 % 24 );
const m = Math.floor((process.uptime() % 3600) / 60);
const s = Math.floor(process.uptime() % 60);
message.reply(`The Bot has been running for:\n${d}days ${h}hrs ${m}mins ${s}secs`);
}
};
