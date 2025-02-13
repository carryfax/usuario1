import { downloadContentFromMessage } from "@whiskeysockets/baileys";

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    let media, msg, type;
    console.log(m); // Para depuración

    // Extraer datos de la base de datos global
    const { antiver, isBanned } = global.db.data.chats[m.chat];
    if (!antiver || isBanned) return;

    // Detectar mensajes de una sola vista
    if (m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessageV2Extension') {
        msg = m.mtype === 'viewOnceMessageV2' ? m.message.viewOnceMessageV2.message : m.message.viewOnceMessageV2Extension.message;
    } else if (m.mtype === 'messageContextInfo' && m.mediaMessage?.imageMessage) {
        msg = { imageMessage: m.mediaMessage.imageMessage };
    } else {
        return;
    }

    // Verificar si msg tiene contenido válido
    if (!msg) return;

    type = Object.keys(msg)[0]; // Extraer el tipo de mensaje (imagen, video, etc.)
    let mediaType = type === 'imageMessage' ? 'image' :
                    type === 'videoMessage' ? 'video' :
                    type === 'audioMessage' ? 'audio' : null;

    if (!mediaType) return;

    try {
        media = await downloadContentFromMessage(msg[type], mediaType);

        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Reenviar el mensaje según su tipo
        if (mediaType === 'image') {
            await conn.sendFile(m.chat, buffer, 'image.jpg', '*🔓 Mensaje de una sola vista desbloqueado!*', m);
        } else if (mediaType === 'video') {
            await conn.sendFile(m.chat, buffer, 'video.mp4', '*🔓 Mensaje de una sola vista desbloqueado!*', m);
        } else if (mediaType === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        }
    } catch (error) {
        console.error('Error al procesar el mensaje de una sola vista:', error);
    }
};

export default handler;
