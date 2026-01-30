const fs = require("fs")
const { proto } = require("@whiskeysockets/baileys/WAProto")
const { aesDecryptGCM, hmacSign } = require("@whiskeysockets/baileys/lib/Utils/crypto")

function b2b64(obj) {
    if (!obj || typeof obj !== "object") return obj
    if (Buffer.isBuffer(obj)) return obj.toString("base64")
    if (obj.type === "Buffer" && Array.isArray(obj.data)) return Buffer.from(obj.data).toString("base64")
    for (const k in obj) obj[k] = b2b64(obj[k])
    return obj
}

const toNumber = (t) => ((typeof t === "object" && t) ? ("toNumber" in t ? t.toNumber() : t.low) : t || 0)

const jidEncode = (user, server, device, agent) =>
    `${user || ""}${agent ? `_${agent}` : ""}${device ? `:${device}` : ""}@${server}`

const jidDecode = (jid) => {
    const sepIdx = typeof jid === "string" ? jid.indexOf("@") : -1
    if (sepIdx < 0) return undefined
    const server = jid.slice(sepIdx + 1)
    const userCombined = jid.slice(0, sepIdx)
    const [userAgent, device] = userCombined.split(":")
    const user = userAgent.split("_")[0]
    return { server, user, domainType: server === "lid" ? 1 : 0, device: device ? +device : undefined }
}

const jidNormalizedUser = (jid) => {
    const r = jidDecode(jid)
    if (!r) return ""
    const { user, server } = r
    return jidEncode(user, server === "c.us" ? "s.whatsapp.net" : server)
}

function decryptPollVoteFixed({ encPayload, encIv }, { pollCreatorJid, pollMsgId, pollEncKey, voterJid }) {
    const toBinary = (txt) => Buffer.from(txt)
    const sign = Buffer.concat([
        toBinary(pollMsgId),
        toBinary(pollCreatorJid),
        toBinary(voterJid),
        toBinary("Poll Vote"),
        new Uint8Array([1]),
    ])
    const key0 = hmacSign(pollEncKey, new Uint8Array(32), "sha256")
    const decKey = hmacSign(sign, key0, "sha256")
    const aad = toBinary(`${pollMsgId}\u0000${voterJid}`)
    const decrypted = aesDecryptGCM(encPayload, decKey, encIv, aad)
    return proto.Message.PollVoteMessage.decode(decrypted)
}

module.exports = async (bruxin, pollMsg) => {
    const update = pollMsg?.message?.pollUpdateMessage
    if (!update?.pollCreationMessageKey) return console.log(JSON.stringify("nokey", null, 4))

    const key = update.pollCreationMessageKey

    const pollCreation = await bruxin.getMessage(key)
    if (!pollCreation) return console.log(JSON.stringify("nomsg", null, 4))

    const actualPollMsg =
        pollCreation?.message?.viewOnceMessage?.message ||
        pollCreation?.message?.botInvokeMessage?.message ||
        pollCreation?.message
    if (!actualPollMsg) return console.log(JSON.stringify("nomsg", null, 4))

    const mePn = jidNormalizedUser(bruxin.user.id)
    const meLid = jidNormalizedUser(bruxin.user.lid || "")
    const preferLid = key.addressingMode === "lid" || (pollMsg.key.participant && pollMsg.key.participant.endsWith("@lid"))
    const selfJid = preferLid && meLid ? meLid : mePn

    const incomingVoterRaw = pollMsg.key.participant || pollMsg.key.remoteJid || ""
    const incomingVoter = jidNormalizedUser(incomingVoterRaw)
    const isMe = incomingVoter === mePn || incomingVoter === meLid || pollMsg.key.fromMe === true
    if (!isMe) {
        return 
    }

    const pollCreatorJid = selfJid
    const voterJid = selfJid

    const pollEncKeyBase64 =
        actualPollMsg?.messageContextInfo?.messageSecret ||
        pollCreation?.message?.botInvokeMessage?.message?.messageContextInfo?.messageSecret ||
        pollCreation?.message?.viewOnceMessage?.message?.messageContextInfo?.messageSecret ||
        pollCreation?.message?.messageContextInfo?.messageSecret ||
        null

    if (!pollEncKeyBase64) return console.log(JSON.stringify("nokeyfound", null, 4))

    const encPayloadBuf = Buffer.from(update.vote.encPayload, "base64")
    const encIvBuf = Buffer.from(update.vote.encIv, "base64")
    const pollEncKeyBuf = Buffer.from(pollEncKeyBase64, "base64")

    try {
        const voteMsg = decryptPollVoteFixed(
            { encPayload: encPayloadBuf, encIv: encIvBuf },
            { pollEncKey: pollEncKeyBuf, pollCreatorJid, pollMsgId: key.id, voterJid }
        )

        bruxin.ev.emit("messages.update", [
            {
                key,
                update: {
                    pollUpdates: [
                        {
                            pollUpdateMessageKey: pollMsg.key,
                            vote: voteMsg,
                            senderTimestampMs: toNumber(update.senderTimestampMs),
                        }
                    ]
                }
            }
        ])
    } catch (e) {
        console.log(JSON.stringify({ error: e, message: e?.message, stack: e?.stack }, null, 4))
    }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})