const {fs, util, chalk, moment, pino, logger, crypto, path, readline, yargs, _, Boom, sleep, store, rl, question, makeWASocket, generateWAMessageFromContent, getAggregateVotesInPollMessage, downloadContentFromMessage, useMultiFileAuthState, generateWAMessage, DisconnectReason, prepareWAMessageMedia, areJidsSameUser, getContentType, decryptPollVote, relayMessage, jidDecode, MakeInMemoryStore, Browsers, proto, } = require('./consts.js')
const dir = (relPath) => path.join(__dirname, relPath);

const tempPollStore = []

const isUrl = async function (str) {
  return (str.startsWith('http://') || str.startsWith('https://'));
};

const resolveSource = async function (input) {
if (await this.isUrl(input)) return input;
const resolved = path.resolve(await this.mainPath, input);
if (!fs.existsSync(resolved)) {
return console.log(`Not found: ${resolved}`);
}
return resolved;
};

const getMessage = async function (key) {
try {
    if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg;
    }
    return {
        conversation: "Snowi",
    };
} catch(e) {}
}

const decodeJid = async function (jid) {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

const sendjson = async function(target, json = {}, config = {}) {
var msg = generateWAMessageFromContent(target,
json ,{})
 
return this.relayMessage(target, msg.message, { messageId: msg.key.sender, ...config})
}


const makeFakeCommand = async function (m, text, chatUpdate) {
    let messages = await generateWAMessage(
        m.key.remoteJid,
        { text: text || '' },
        { quoted: m.quoted }
    );
    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;

    let msg = {
        messages: [messages],
        type: "append",
    };
    return this.ev.emit("messages.upsert", msg);
};

const pollMenu = async function (jid, name = '', pollOptions = [], context = {}, selectableCount = 1) {
    let options = [];
    for (let pollOption of pollOptions) {
        options.push(pollOption.vote);
    }
    let pollMsg = await this.sendMessage(jid, { botInvoke: {
        messageContextInfo: {
            messageSecret: (0, crypto.randomBytes)(32),
        },
        pollCreationMessage: {
            name: name,
            options: options.map(optionName => ({ optionName })),
            contextInfo: context,
            selectableOptionsCount: selectableCount,
            
        }
    } },{poll: false});
    this.tempPollStore.push({ id: pollMsg.key.id, cmds: pollOptions });
    return;
};

const downloadMediaMessage = async function (message) {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}

const sendAlbumMessage = async function (target, media = [], contextInfo = {}) {
  const isUrl = (str) => typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));

  const resolveSource = async (inputPath) => {
    if (isUrl(inputPath)) return inputPath;
    const base = global.projectRoot || process.cwd();
    const resolved = require('path').resolve(base, inputPath);
    if (!require('fs').existsSync(resolved)) {
      console.log(`File not found: ${resolved}`);
      return null;
    }
    return resolved;
  };

  const albumMsg = generateWAMessageFromContent(target, proto.Message.fromObject({
    albumMessage: {
      expectedImageCount: 1,
      expectedVideoCount: 1,
      contextInfo
    }
  }), {});

  const albumKey = {
    id: await this.relayMessage(target, albumMsg.message, { messageId: albumMsg.key.id }),
    remoteJid: target,
    fromMe: true
  };

  const keys = { album: albumKey };
  let i = 1;

  for (const medi of media) {
    const ext = medi.split('.').pop().toLowerCase();
    const mimetypes = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4'
    };
    const messagetypes = {
      jpg: 'imageMessage', jpeg: 'imageMessage', png: 'imageMessage',
      gif: 'imageMessage', webp: 'imageMessage', mp4: 'videoMessage'
    };

    const mimetype = mimetypes[ext];
    const type = messagetypes[ext];
    if (!mimetype || !type) {
      console.log(`Invalid filetype: ${medi}`);
      continue;
    }

    const source = await resolveSource(medi);
    if (!source) continue;

    const msg = await prepareWAMessageMedia(
      { [type.startsWith('image') ? 'image' : 'video']: { url: source }, mimetype },
      { upload: this.waUploadToServer }
    );

    const mediaMessage = generateWAMessageFromContent(target, proto.Message.fromObject({
      associatedChildMessage: {
        message: {
          messageContextInfo: {
            messageSecret: require('crypto').randomBytes(32),
            messageAssociation: {
              associationType: 'MEDIA_ALBUM',
              parentMessageKey: albumKey
            }
          },
          [type]: { ...msg[type] }
        }
      }
    }), {});

    keys[`media_${i++}`] = {
      id: await this.relayMessage(target, mediaMessage.message, { messageId: mediaMessage.key.id }),
      fromMe: true,
      remoteJid: target
    };
  }

  return keys;
};

const statusMention = async function (target, content) {
try {
const media = await generateWAMessageFromContent(target, content, {});
const additionalNodes = [
    {
        tag: "meta",
        attrs: {},
        content: [
            {
                tag: "mentioned_users",
                attrs: {},
                content: [
                    {
                        tag: "to",
                        attrs: { jid: target },
                        content: undefined,
                    }
                ],
            }
        ],
    }
];
await this.relayMessage("status@broadcast", media.message, {
"messageId": media.key.id,
"statusJidList": [target, this.user.id],
additionalNodes,
});
let type
var SmM = generateWAMessageFromContent(target, proto.Message.fromObject({
statusMentionMessage: {
message: {
    protocolMessage: {
        key: media.key,
        type: "STATUS_MENTION_MESSAGE",
        timestamp: Date.now() * 1000,
    },
},
}
}),{})
await this.relayMessage(target, SmM.message, {
additionalNodes: [
    {
        tag: "meta",
        attrs: { is_status_mention: "true" },
        content: undefined,
    }
],
});
return media;
} catch (e) {
    console.log("error: " + e)
}
}

module.exports = {
getMessage,
decodeJid,
makeFakeCommand,
pollMenu,
downloadMediaMessage,
tempPollStore,
statusMention,
sendAlbumMessage,
isUrl,
sendjson,
resolveSource,
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
process.exit()
})
