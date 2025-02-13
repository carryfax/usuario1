let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'))

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  let media, msg, type
  //const { antiver, isBanned } = global.db.data.chats[m.chat]

  // Verifica si el mensaje debe ser procesado, basado en 'antiver' y 'isBanned'
 // if (!antiver || isBanned) return

  // Verifica que 'm.messageStubParameters' esté presente y contenga el tipo correcto
  if (m.messageStubParameters && m.messageStubParameters[1]) {
    let messageData = JSON.parse(m.messageStubParameters[1]) // Convierte el JSON en un objeto
    let messageContent = messageData.content[0] // El contenido del mensaje
console.log(messageContent)
    // Si el mensaje tiene el tipo "view_once", lo procesamos
    if (messageContent && messageContent.tag === "unavailable" && messageContent.attrs.type === "view_once") {
      let msgType = messageData.content[1].tag // Determina el tipo de mensaje (imagen, video, audio)
      
      // Determina el tipo de archivo
      if (msgType === 'imageMessage' || msgType === 'videoMessage' || msgType === 'audioMessage') {
        msg = messageData.content[1]
        type = msgType

        // Descarga el contenido del mensaje basado en el tipo
        media = await downloadContentFromMessage(msg, type === 'imageMessage' ? 'image' : type === 'videoMessage' ? 'video' : 'audio')
        
        let buffer = Buffer.from([])
        for await (const chunk of media) {
          buffer = Buffer.concat([buffer, chunk])
        }

        const fileSize = formatFileSize(msg.fileLength)
        const description = `
          ✅️ *ANTI VER UNA VEZ* ✅️\n\n💭 *No ocultes* ${type === 'imageMessage' ? '`Imagen` 📷' : type === 'videoMessage' ? '`Vídeo` 🎥' : type === 'audioMessage' ? '`Mensaje de voz` 🎤' : 'este mensaje'}\n- ✨️ *Usuario:* *@${m.sender.split('@')[0]}*
          ${msg.caption ? `- *Texto:* ${msg.caption}` : ''}`.trim()

        // Envía el archivo dependiendo del tipo
        if (/image|video/.test(type)) {
          return await conn.sendFile(m.chat, buffer, type === 'imageMessage' ? 'error.jpg' : 'error.mp4', description, m, false, { mentions: [m.sender] })
        }

        if (/audio/.test(type)) { 
          await conn.reply(m.chat, description, m, { mentions: [m.sender] })
          await conn.sendMessage(m.chat, { audio: buffer, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
        }
      }
    }
  }
}

export default handler

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'TY', 'EY']
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i]
}
