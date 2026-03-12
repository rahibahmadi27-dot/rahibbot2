import connectToWhatsapp from './Digix/crew.js'
import handleIncomingMessage from './messageHandler.js'

(async () => {
    await connectToWhatsapp(handleIncomingMessage)
    console.log('WhatsApp Bot Connected ✅')
})()
