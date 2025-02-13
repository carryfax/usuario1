let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'))

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
 let media, msg, type
 // const { antiver, isBanned } = global.db.data.chats[m.chat]

  // Verifica si el mensaje debe ser procesado, basado en 'antiver' y 'isBanned'
//  if (!antiver || isBanned) return
console.log(m)
  // Verifica si m.messageStubParameters[1] contiene el mensaje
  if (m.messageStubParameters && m.messageStubParameters[1]) {
    let messageData = JSON.parse(m.messageStubParameters[1]) // Convierte el JSON en un objeto
    let content = messageData.content[0] // El contenido principal del mensaje

    // Verifica si el mensaje tiene la etiqueta 'unavailable' y es un mensaje 'view_once'
    if (content.tag === 'unavailable' && content.attrs.type === 'view_once') {
      let reportingTag = content.content.find(tag => tag.tag === 'reporting_tag')

      if (reportingTag) {
        // Log para ver el contenido de reportingTag
        let fileData = reportingTag.content[0] // Accede a los datos
        console.log('fileData:', fileData)

        // Dependiendo de lo que contenga fileData, determinamos el tipo de archivo
        if (fileData) {
          let fileType = fileData.type // Ajusta según lo que necesites revisar en el reportingTag

          // Si el fileType es válido y corresponde a imagen, video o audio
          if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
            msg = fileData
            type = fileType

            // Descarga el contenido del mensaje basado en el tipo
            media = await downloadContentFromMessage(msg, type === 'image' ? 'image' : type === 'video' ? 'video' : 'audio')

            let buffer = Buffer.from([])
            for await (const chunk of media) {
              buffer = Buffer.concat([buffer, chunk])
            }

            const fileSize = formatFileSize(msg.fileLength)
            const description = `
              ✅️ *ANTI VER UNA VEZ* ✅️\n\n💭 *No ocultes* ${type === 'image' ? '`Imagen` 📷' : type === 'video' ? '`Vídeo` 🎥' : type === 'audio' ? '`Mensaje de voz` 🎤' : 'este mensaje'}\n- ✨️ *Usuario:* *@${m.sender.split('@')[0]}*
              ${msg.caption ? `- *Texto:* ${msg.caption}` : ''}`.trim()

            // Envía el archivo dependiendo del tipo
            if (/image|video/.test(type)) {
              return await conn.sendFile(m.chat, buffer, type === 'image' ? 'error.jpg' : 'error.mp4', description, m, false, { mentions: [m.sender] })
            }

            if (/audio/.test(type)) { 
              await conn.reply(m.chat, description, m, { mentions: [m.sender] })
              await conn.sendMessage(m.chat, { audio: buffer, fileName: 'error.mp3', mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
            }
          }
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
