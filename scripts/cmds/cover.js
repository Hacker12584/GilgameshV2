 const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");
module.exports = {
	config: {
		name: "cover",
		version: "1.0",
		author: "Samir",
		countDown: 10,
		role: 0,
		shortDescription: "Create fb Banner",
		longDescription: "",
		category: "image",
		guide: {
			en: "{p}{n} Character name or code | Name | Surname",
		}
	},

  

	onStart: async function ({ message, args, event, api }) {
 
    const info = args.join(" ");
		if (!info){
			return message.reply(`Please enter in the format:\tar  Name or code | Name | Surname`);
      
      }else {
      const msg = info.split("|");
      const id = msg[0];
    const name = msg[1];
    const juswa = msg[2];

        

       if (isNaN(id)) { // If input is not a number
          await message.reply("processing your cover please wait....");

         let id1;
    try {
        id1 = (await axios.get(`https://www.nguyenmanh.name.vn/api/searchAvt?key=${id}`)).data.result.ID; 
    } catch (error) {
      await message.reply("Character not found, please check the name and try again...");
      return;
    }

        const img = (`https://www.nguyenmanh.name.vn/api/avtWibu4?id=${id1}&tenchinh=${name}&tenphu=${juswa}&apikey=SCn2efR7`)			
                 const form = {
				body: `Here's your Cover✨`
			};
				form.attachment = []
				form.attachment[0] = await global.utils.getStreamFromURL(img);
			message.reply(form); 
         
      

       }else  { 
       await message.reply("processing your cover senpai....");
         
         const img = (`https://www.nguyenmanh.name.vn/api/avtWibu4?id=${id}&tenchinh=${name}&tenphu=${juswa}&apikey=SCn2efR7`)			
                 const form = {
				body: `Here's your Cover✨`
			};
				form.attachment = []
				form.attachment[0] = await global.utils.getStreamFromURL(img);
			message.reply(form); 
        }
      }
    }
   };
