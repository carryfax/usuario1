import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function before(m, { isAdmin, isBotAdmin, conn }) {
    let chat = db.data.chats[m.chat];
    if (!chat.antiver || chat.isBanned) return;

    let msg;
    console.log(m.mtype)
    // Verificar si es un mensaje de una sola vista
    if (m.mtype === "viewOnceMessageV2" || m.mtype === "viewOnceMessageV2Extension") {
        msg = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessageV2Extension?.message;
    } else if (m.quoted?.mediaMessage?.imageMessage || m.quoted?.mediaMessage?.videoMessage) {
        msg = m.quoted.mediaMessage;
    } else {
        return;
    }

    if (!msg) return console.log("⛔ No se pudo extraer el mensaje de una sola vista.");

    let type = Object.keys(msg)[0]; // Extraer tipo (imageMessage, videoMessage, etc.)
    let mediaType = type.includes('image') ? 'image' :
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

        let caption = msg[type]?.caption || "🔓 Mensaje de una sola vista desbloqueado.";

        // 📤 Enviar el mensaje recuperado
        if (mediaType === 'image') {
            await conn.sendFile(m.chat, buffer, 'image.jpg', caption, m);
        } else if (mediaType === 'video') {
            await conn.sendFile(m.chat, buffer, 'video.mp4', caption, m);
        } else if (mediaType === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        }

        console.log(`✅ ${mediaType} enviado con éxito.`);
    } catch (error) {
        console.error("❌ Error al procesar el mensaje de una sola vista:", error);
    }
}
