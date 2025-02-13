import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function before(m) {
    // Verificar si el mensaje proviene del bot para evitar loops
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    let msg = null;

    // Caso 1: Mensaje de una sola vista directamente en `m`
    if (m.mtype && m.msg && m.msg.hasOwnProperty("viewOnce")) {
        msg = m.msg;
    } 
    // Caso 2: Mensaje de una sola vista dentro de `m.quoted`
    else if (m.quoted?.mediaMessage?.imageMessage || m.quoted?.mediaMessage?.videoMessage) {
        msg = m.quoted.mediaMessage.imageMessage || m.quoted.mediaMessage.videoMessage;
    } 
    // Si no se encuentra un mensaje de una sola vista, salir
    else {
        return console.log("⛔ No es un mensaje de una sola vista.");
    }

    try {
        const type = msg.mimetype?.split("/")[0] || "unknown";
        const mediaType = type === "image" ? "image" :
                          type === "video" ? "video" :
                          type === "audio" ? "audio" : null;

        if (!mediaType) return console.log("⛔ Tipo de media no soportado:", type);

        // 📥 Descargar contenido
        console.log(`📥 Descargando ${mediaType}...`);
        const media = await downloadContentFromMessage(msg, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 📏 Obtener información del archivo
        const fileSize = formatFileSize(msg.fileLength);
        const timestamp = getMakassarTimestamp(msg.mediaKeyTimestamp);
        const description = `🚫 *Anti-ViewOnce*\n📁 *Tipo:* ${mediaType}\n📝 *Caption:* ${msg.caption || "N/A"}\n📏 *Tamaño:* ${fileSize}\n⏰ *Hora:* ${timestamp}\n👤 *Enviado por:* @${m.sender.split("@")[0]}`;

        // 📤 Enviar el mensaje recuperado
        if (mediaType === "image") {
            await this.sendFile(m.chat, buffer, "image.jpg", description, m, false, { mentions: [m.sender] });
        } else if (mediaType === "video") {
            await this.sendFile(m.chat, buffer, "video.mp4", description, m, false, { mentions: [m.sender] });
        } else if (mediaType === "audio") {
            await this.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mpeg", ptt: true }, { quoted: m });
        }

        console.log(`✅ ${mediaType} enviado con éxito.`);
    } catch (error) {
        console.error("❌ Error al procesar el mensaje de una sola vista:", error);
    }
}

// 📏 Función para formatear el tamaño del archivo
function formatFileSize(bytes) {
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 +
        " " +
        ["Bytes", "KB", "MB", "GB", "TB", "PB", "TY", "EY"][i]
    );
}

// ⏰ Función para convertir timestamp a formato legible
function getMakassarTimestamp(timestamp) {
    return new Date(1e3 * timestamp).toLocaleString("es-ES", {
        timeZone: "America/Guayaquil",
    });
}
