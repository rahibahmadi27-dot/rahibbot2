import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys'
import pino from 'pino'
import fs from 'fs'

const SESSION_FOLDER = './sessionData'
const OWNER_NUMBER = "93701092005"

async function connectToWhatsapp(handleMessage) {

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER)

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        logger: pino({ level: "silent" })
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {

        const { connection, lastDisconnect } = update

        if (connection === "connecting") {
            console.log("⏳ Connecting to WhatsApp...")
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Connected Successfully")

            try {

                const imagePath = "./database/DigixCo.jpg"

                const text = `
╔══════════════════╗
   DigiX Crew Bot Connected 🚀
╠══════════════════╣
Always Forward. Digital Crew.
╚══════════════════╝
`

                if (fs.existsSync(imagePath)) {

                    await sock.sendMessage(
                        OWNER_NUMBER + "@s.whatsapp.net",
                        {
                            image: fs.readFileSync(imagePath),
                            caption: text
                        }
                    )

                } else {

                    await sock.sendMessage(
                        OWNER_NUMBER + "@s.whatsapp.net",
                        { text: text }
                    )

                }

                console.log("📩 Welcome message sent")

            } catch (err) {
                console.log("❌ Error sending welcome:", err)
            }

        }

        if (connection === "close") {

            const statusCode = lastDisconnect?.error?.output?.statusCode

            if (statusCode !== DisconnectReason.loggedOut) {

                console.log("🔄 Reconnecting...")
                setTimeout(() => connectToWhatsapp(handleMessage), 5000)

            } else {

                console.log("🚫 Logged out from WhatsApp")

            }
        }
    })

    sock.ev.on("messages.upsert", async (msg) => {
        if (handleMessage) {
            handleMessage(sock, msg)
        }
    })

    return sock
}

export default connectToWhatsapp
