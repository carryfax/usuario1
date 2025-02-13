let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'))

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  let media, msg, type
  //const { antiver, isBanned } = global.db.data.chats[m.chat]

  // Verifica si el mensaje debe ser procesado, basado en 'antiver' y 'isBanned'
  //if (!antiver || isBanned) return
console.log(m.messageStubParameters[1])
  // Verifica que 'm.messageStubParameters' esté presente y contenga el tipo correcto
  if (m.messageStubParameters && m.messageStubParameters[1]) {
    let messageData = JSON.parse(m.messageStubParameters[1]) // Convierte el JSON en un objeto
    let messageContent = messageData.content[0] // El contenido del mensaje

    // Si el mensaje tiene el tipo "view_once", lo procesamos
    if (messageContent) {
      
      // Verificamos si el contenido tiene el 'reporting_tag' para extraer más detalles
      let reportingTag = messageContent.content.find(tag => tag.tag === 'reporting_tag')
      
      if (reportingTag) {
        // Aquí puedes ver qué contiene el reportingTag para determinar el tipo de archivo
        let fileData = reportingTag.content[0] // Asumimos que los datos de la imagen/video/audio están aquí
        // Log para ver el contenido
        console.log('fileData:', fileData)
        
        // Dependiendo del contenido de fileData, determinar el tipo de archivo
        if (fileData) {
          let fileType = fileData.type // Aquí debes verificar cómo identificar el tipo de archivo, esto es solo un ejemplo.
          
          // Si el fileType corresponde a un archivo de imagen, video o audio
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
