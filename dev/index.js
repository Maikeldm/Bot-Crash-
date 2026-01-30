const {fs, util, chalk, moment, pino, logger, crypto, path, readline, yargs, _, Boom, sleep, store, rl, question, makeWASocket, generateWAMessageFromContent, getAggregateVotesInPollMessage, downloadContentFromMessage, useMultiFileAuthState, generateWAMessage, DisconnectReason, prepareWAMessageMedia, areJidsSameUser, getContentType, decryptPollVote, relayMessage, jidDecode, makeInMemoryStore, Browsers, proto, } = require('./consts.js')

const NodeCache = require('node-cache');
const groupCache = new NodeCache({ stdTTL: 300, useClones: false });
const dir = (relPath) => path.join(__dirname, relPath);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
async function snowiStart() {
const { state, saveCreds } = await useMultiFileAuthState(dir("/session"))
const bruxin = makeWASocket({
logger: pino({ level: "silent" }),
breakprintQRInTerminal: false,
markOnlineOnConnect: false,
auth: state,
cachedGroupMetadata: async (jid) => groupCache.get(jid),
emitOwnEvents: true,
printQRInTerminal: false,
browser: ["Ubuntu", "Chrome", "20.0.04"],
version: [2, 3000, 1028395461],
getMessage: async (key) => {
if (store) {
const msg = await store.loadMessage(key.remoteJid, key.id);
return msg.message || undefined;
}
return {
conversation: "null"
};
},
shouldSyncHistoryMessage: msg => {
return !!msg.syncType;
},
}, store);
bruxin.mainPath = __dirname
Object.assign(bruxin, require('./functions.js'));
if (!bruxin.authState.creds.registered) {
const phoneNumber = await question('Escribe tu número: ');
let code = await bruxin.requestPairingCode(phoneNumber.replace(/[^\d]/g, ''), "PAZINWEB");
code = code?.match(/.{1,4}/g)?.join("-") || code;
console.log(`Código: `, code);
}
store.bind(bruxin.ev);
bruxin.ev.on('messages.upsert', async chatUpdate => {
try {
update = chatUpdate.messages[0]
if (!update.message) return
update.message = (Object.keys(update.message)[0] === 'ephemeralMessage') ? update.message.ephemeralMessage.message : update.message
if (update.key.id.startsWith('3EB0')) return
function b2b64(obj) {
    if (!obj || typeof obj !== 'object') return obj
    if (Buffer.isBuffer(obj)) return obj.toString('base64')
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data).toString('base64')
    for (const k in obj) obj[k] = b2b64(obj[k])
    return obj
}
m = {...update}
m = b2b64(m)
if (m?.message?.pollUpdateMessage) {
require("./poll.js")(bruxin, m)
}
require("../snowi.js")(bruxin, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})
bruxin.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update;
  if (connection) connectionStatus = connection;
if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

switch (reason) {
case DisconnectReason.badSession:
console.error('Borrando sesión debido a un error. Reconectando...');
fs.rmSync(dir('/session'), { recursive: true, force: true }); 
snowiStart();
break;

case DisconnectReason.connectionClosed:
case DisconnectReason.connectionLost:
case DisconnectReason.timedOut:
console.warn('Conexión eliminada. Reconectando...');
snowiStart();
break;

case DisconnectReason.loggedOut:
console.error('Desconectado debido a un error. Porfavor elimina la carpeta session y vuelve a iniciar sesión');
fs.rmSync(dir('/session'), { recursive: true, force: true }); 
snowiStart();
break;

case DisconnectReason.restartRequired:
console.log('Reboot requirida. Reconectando...');
snowiStart();
break;

case DisconnectReason.forbidden:
fs.rmSync(dir('/session'), { recursive: true, force: true }); 
snowiStart();
break;

default:
console.error(`Error. Razón: ${reason}. Reconectando...`);
snowiStart();
break;
}
} else if (connection === 'open') {
console.clear
console.log('\n\n')
await sleep(1000)
console.log(chalk.redBright('Connected'))
console.log(chalk.redBright(bruxin.user.id || '👁️'))
console.log("\n")
bruxin.ev.on('messages.update', async (chatUpdate) => {
    for (const { key, update } of chatUpdate) {
        if (update.pollUpdates && key.fromMe) {
            const pollCreation = await bruxin.getMessage(key);

            if (pollCreation) {
                let pollUpdate = await getAggregateVotesInPollMessage({
                    message: pollCreation?.message?.botInvokeMessage?.message || pollCreation?.message,
                    pollUpdates: update.pollUpdates,
                });
                
                let selectedOptionName = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name;
                const selectedCmd = bruxin.tempPollStore.find(item => item.id === key.id)?.cmds.find(c => c.vote === selectedOptionName)?.cmd;
                const selectedCmdx = selectedCmd || selectedOptionName
              await bruxin.makeFakeCommand(m, selectedCmdx, chatUpdate);
            } else {
                return false;
            }
            return;
        }
    }
});
}
});
bruxin.ev.on('creds.update', saveCreds)
async function getMessage(key) {
    if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg;
    }
    return {
        conversation: "undefined",
    };
}

return bruxin
}
snowiStart()
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
process.exit()
})
