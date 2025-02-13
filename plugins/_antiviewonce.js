import { downloadContentFromMessage } from "@whiskeysockets/baileys";

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    console.log("🔎 Mensaje recibido:", m);

    // Verificar si el chat está bloqueado o la función no está activa
    const { antiver, isBanned } = global.db.data.chats[m.chat] || {};
    if (!antiver || isBanned) return;

    // Extraer el mensaje de una sola vista
    let msg, type;
    m.reply(m.mtype)
    if (m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessageV2Extension') {
        msg = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessageV2Extension?.message;
    }

    // Si el mensaje no es válido, salir
    if (!msg) return console.log("⛔ No se pudo extraer el mensaje de una sola vista.");

    // Determinar el tipo de mensaje (imagen, video, audio)
    type = Object.keys(msg)[0];
    const mediaType = type.includes('image') ? 'image' :
                      type.includes('video') ? 'video' :
                      type.includes('audio') ? 'audio' : null;

    if (!mediaType) return console.log("⛔ Tipo de mensaje no soportado:", type);

    try {
        console.log(`📥 Descargando ${mediaType}...`);
        let media = await downloadContentFromMessage(msg[type], mediaType);

        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 📤 Enviar el mensaje recuperado
        const description = `*🔓 Mensaje de una sola vista desbloqueado:*`;

        if (mediaType === 'image') {
            await conn.sendFile(m.chat, buffer, 'image.jpg', description, m);
        } else if (mediaType === 'video') {
            await conn.sendFile(m.chat, buffer, 'video.mp4', description, m);
        } else if (mediaType === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        }

        console.log(`✅ ${mediaType} enviado con éxito.`);
    } catch (error) {
        console.error("❌ Error al procesar el mensaje de una sola vista:", error);
    }
};

export default handler;
