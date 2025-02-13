let handler = async function (m, { conn }) {
  // Verificar si hay contenido en m.messageStubParameters
  if (m.messageStubParameters && m.messageStubParameters[1]) {
    const messageData = JSON.parse(m.messageStubParameters[1]);

    // Comprobar si el mensaje es de tipo "view_once"
    if (messageData.content && messageData.content.some(item => item.tag === 'unavailable' && item.attrs.type === 'view_once')) {
      // Extraer la información del contenido 'reporting'
      const reportingContent = messageData.content.find(item => item.tag === 'reporting');
      const mediaContent = reportingContent && reportingContent.content[0].content.data
        ? Buffer.from(reportingContent.content[0].content.data, 'base64') // Convertir de base64 a buffer
        : null;

      // Si hay contenido multimedia
      if (mediaContent) {
        // Verificar el tipo de contenido (puede ser imagen, video o audio)
        const mediaType = messageData.attrs.type;
        
        if (mediaType === 'media') {
          const mediaTag = messageData.content[0].tag;

          if (mediaTag === 'imageMessage') {
            console.log('Imagen de view once recibida');
            // Enviar imagen
            await conn.sendFile(m.chat, mediaContent, 'image.jpg', 'Contenido de view once (Imagen)', m);
          } else if (mediaTag === 'videoMessage') {
            console.log('Video de view once recibido');
            // Enviar video
            await conn.sendFile(m.chat, mediaContent, 'video.mp4', 'Contenido de view once (Video)', m);
          } else if (mediaTag === 'audioMessage') {
            console.log('Audio de view once recibido');
            // Enviar audio
            await conn.sendFile(m.chat, mediaContent, 'audio.mp3', 'Contenido de view once (Audio)', m);
          }
        }
      } else {
        console.log('No se ha encontrado contenido multimedia');
      }
    }
  }
};

export default handler;
