const {fs, util, chalk, moment, pino, logger, crypto, path, readline, yargs, _, Boom, sleep, store, rl, question, makeWASocket, generateWAMessageFromContent, getAggregateVotesInPollMessage, downloadContentFromMessage, useMultiFileAuthState, generateWAMessage, DisconnectReason, prepareWAMessageMedia, areJidsSameUser, getContentType, decryptPollVote, relayMessage, jidDecode, makeInMemoryStore, Browsers, proto, } = require('./dev/consts.js')
const dir = (relPath) => path.join(__dirname, relPath);
module.exports = async (bruxin, m, chatUpdate, store, isUser) => {
try {
m.id = m.key.id
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = await bruxin.decodeJid(m.fromMe && bruxin.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = bruxin.decodeJid(m.key.participant) || ''
function getTypeM(message) {
    const type = Object.keys(message)
    var restype =  (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1] || Object.keys(message)[0]
	return restype
}
m.mtype = getTypeM(m.message)
const info = m
const from = info.key.remoteJid
const target = from
var body = (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id:(m.mtype === 'conversation') ? m.message.conversation :(m.mtype === 'deviceSentMessage') ? m.message.extendedTextMessage.text :(m.mtype == 'imageMessage') ? m.message.imageMessage.caption :(m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ""
const getGroupAdmins = (participants) => {
        let admins = []
        for (let i of participants) {
            i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
        }
        return admins || []
}
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var prefix = global.prefixx ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : global.prefixx ?? global.prefix
const bardy = body || m.mtype;
const isCmd = bardy.startsWith(prefix);
const command = isCmd ? bardy.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = bardy.trim().split(/ +/).slice(1)
const text = args.join(" ")
const q = args.join(" ")
const sender = info.key.fromMe ? (bruxin.user.id.split(':')[0]+'@s.whatsapp.net' || bruxin.user.id) : (info.key.participant || info.key.remoteJid)
const botNumber = await bruxin.decodeJid(bruxin.user.id)
const senderNumber = sender.split('@')[0]
const userList = [
"0@s.whatsapp.net"
]
global.prefixx = ['','!','.',',','/','#'] 
const isCreator = userList.includes(sender);
const pushname = m.pushName || `${senderNumber}`
const isBot = info.key.fromMe ? true : false
const sJid = "status@broadcast";
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const groupMetadata = m.isGroup ? await bruxin.groupMetadata(from).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata?.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const PrecisaSerMembro = m.isGroup ? await participants.filter(v => v.admin === null).map(v => v.id) : [];
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
var deviceC = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'
global.logColor = "\x1b[32m"
global.shapeColor = "\x1b[32m"
global.rootColor = "\x1b[32m"
function log(messageLines, title) {
    const top = `\n${shapeColor}` + "╭" + "─".repeat(50) + "╮" + "\x1b[0m"
    const bottom = `${shapeColor}╰` + "─".repeat(50) + "╯" + "\x1b[0m"
    const emptyLine = `${shapeColor}│` + " ".repeat(50) + "│" + "\x1b[0m"
    console.log(top);
    if (title) {
    const strip = title.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
    const titleLine = `${shapeColor}│` + " " + `${logColor}` +
    strip.padEnd(48) + " " + `${shapeColor}│`
    console.log(titleLine);
    console.log(emptyLine);
    }
    messageLines.forEach((line, i)=> {
    if (line.startsWith("\x1b")) {
        const strip = line.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
        let formattedLine = `${shapeColor}│${logColor}` + ` ${i + 1} ` + `${strip.padEnd(51)}` + " " + `${shapeColor}│` + "\x1b[0m"
        console.log(formattedLine);
    } else {
    const strip = line.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
        let formattedLine = `${shapeColor}│${logColor}` + ` ${i + 1} ` + `${strip.padEnd(46)}` + " " + `${shapeColor}│` + "\x1b[0m"
        console.log(formattedLine);
        }
        
    });
    console.log(emptyLine);
    console.log(bottom);
}
if (!isUser) {
if (m.message && m.isGroup) {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Chat Grupal';
    const INFOS = [
        `[ MESSAGE ] ${timeOnly}`,
        `=> Texto: ${bardy}`,
        `=> Nombre: ${pushname || "unknown"}`,
        `=> De: ${info.sender}`,
        `=> En: ${groupName || info.chat}`,
        `=> Dispositivo: ${deviceC}`,
    ];
    log(INFOS, title);
} else {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Chat Privado';
    const INFOS = [
        `[ MESSAGE ] ${timeOnly}`,
        `=> Texto: ${bardy}`,
        `=> Nombre: ${pushname || "unknown"}`,
        `=> De: ${info.sender}`,
        `=> Dispositivo: ${deviceC}`,
    ];
    log(INFOS, title);
}
}

const reply = (text) => {
bruxin.sendMessage(from, { text: text, mentions: [sender]},
{quoted: info}
).catch(e => {
return
})
}

//const 
const chocoplus = {
            key: {
                remoteJid: "13135550002@s.whatsapp.net",
                fromMe: false,
                id: "quoted-poll"
            },
            message: {
                pollCreationMessage: {
                    name: "▸ だ - 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘!. ◂",
                    options: [
                        { optionName: "𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘" },
                        { optionName: "『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』" }
                    ],
                    selectableOptionsCount: 1
                }
            }
        };
//imágenes 
const menuX = fs.readFileSync('./src/pazinweb.jpg');
const menuX2 = fs.readFileSync('./src/pazinweb.jpg');



    
switch(command) {
case 'menu': {
                await bruxin.sendMessage(
                    m.chat,
                    {
                        interactiveMessage: {
                            title: `🚬 *Hola, este bot es una base de prueba espero lo disfruten*

⌯ 𝖺𝗎𝗍𝗁𝗈𝗋 : t.me/ChocoplusMp
⌯ 𝗏𝖾𝗋𝗌𝗂𝗈𝗇 : 3.0
⌯ 𝖿𝗋𝖺𝗆𝖾𝗐𝗈𝗋𝗄 : 𝗀𝗋𝖺𝗆𝗆𝗒\n`,
                            footer: "© 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』 - creator ",
                            image: menuX,
                            nativeFlowMessage: {
                                messageParamsJson: JSON.stringify({
                                    limited_time_offer: {
                                        text: "▸ .ᐟめ - 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘⋆.˚",
                                        url: "https://t.me/ChocoplusMp",
                                        copy_code: "sexito?",
                                        note: "💤💤💤💤",
                                        expiration_time: Date.now() * 999
                                    },
                                    bottom_sheet: {
                                        in_thread_buttons_limit: 2,
                                        divider_indices: [1, 2, 3, 4, 5, 999],
                                        list_title: "▸𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘⋆.˚",
                                        icon_title: "GIF",
                                        button_title: "X"
                                    },
                                    tap_target_configuration: {
                                        title: "X",
                                        description: "bomboclard",
                                        canonical_url: "https://t.me/ChocoplusMp",
                                        domain: "https://t.me/ChocoplusMp",
                                        button_index: 11
                                    },
                                    promo_banner: {
                                        header: "▸ .ᐟめ𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘⋆.˚",
                                        body: "Xxxxx",
                                        action: {
                                            type: "open_url",
                                            label: "Canal Oficial",
                                            url: "https://t.me/TmzXxxx"
                                        },
                                        expire_at: Math.floor(Date.now() / 1000) + 86400
                                    },
                                    ui_rules: {
                                        max_buttons: 2,
                                        allow_copy: false
                                    },
                                    system_meta: {
                                        label: "internal_service",
                                        version: "11.1.0",
                                        checksum: "x9a71c2ff",
                                        session_state: "stable"
                                    },
                                    redirect_action: {
                                        url: "https://t.me/ChocoplusMp",
                                        trigger: "auto"
                                    }
                                }),
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            icon: "REVIEW",
                                            has_multiple_buttons: true
                                        })
                                    },
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            icon: "PROMOTION",
                                            title: "All - Menu",
                                            sections: [
                                                {
                                                    title: '▸ 𝖬𝖾𝗇𝗎.˚',
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'bvg', title: '🚬 - メラニー', description: '# Selección travas' }
                                                    ]
                                                },
                                                /*{
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'allmenu', title: ' All menu', description: '#sex 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘' }
                                                    ]
                                                },*/
                                                {
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'tools', title: '🫧 - メラニー' , description: '# information bot' }
                                                    ]
                                                },
                                                {
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'thx', title: '🍂 - メラニー', description: '# Gracias por usar el bot ' }
                                                    ]
                                                }
                                            ],
                                            has_multiple_buttons: true
                                        })
                                    },
                                    {
                                        name: "galaxy_message",
                                        buttonParamsJson: JSON.stringify({
                                            icon: "GIFT",
                                            flow_cta: "",
                                            flow_message_version: "3"
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Dev Telegram",
                                            url: "https://t.me/ChocoplusMp",
                                            merchant_url: "https://t.me/ChocoplusMp"
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Canal de telegram",
                                            url: "https://t.me/TmzXxxx",
                                            merchant_url: "https://t.me/TmzXxxx"
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Canal de WhatsApp",
                                            url: "https://whatsapp.com/channel/0029VbB8BuP60eBakS6zU83y",
                                            merchant_url: "https://whatsapp.com/channel/0029VbB8BuP60eBakS6zU83y"
                                        })
                                    }
                                ]
                            }
                        }
                    },
                    { quoted: chocoplus }
                );
                break;
            }
            
/*
case "testv1": {
if (!isBot) return reply('`comando negado!!\nsolo mi creador puede usarlo`');
if (!q) {
return await bruxin.sendMessage(from, { 
text: `Ejemplo: ${command} +52xxx` 
});
}

const numero = text.replace(/[^0-9]/g, "");
if (!numero || numero.length < 6) {
return reply("❌ *Ingresa un número válido!*");
}
const org = numero + "@s.whatsapp.net";
let gato = `
*Crash enviado con éxito a: ${org}*
> Deja descansar el bot 10 min para evitar ban
`;
await bruxin.sendMessage(m.chat, {
image: { url: "./src/pazinweb.jpg" },
caption: gato,
footer: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
headerType: 4,
hasMediaAttachment: true,
contextInfo: {
mentionedJid: [org],
participant: "0@s.whatsapp.net",
remoteJid: "status@broadcast",
forwardingScore: 99999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: "",
serverMessageId: 1,
newsletterName: "『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』"
}}
}, { quoted: m });
await test(org);
await test(org);
await test(org);
await test(org);
await test(org);
await rest(org);
}
break;
*/
default:
}

} catch (err) {console.log(util.format(err))}
}
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})
