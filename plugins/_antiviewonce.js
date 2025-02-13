import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function before(m) {
    //if (m.isBaileys && m.fromMe) return true;
    //if (!m.isGroup) return false;

    let msg = null;
console.log(m.mediaMessage.imageMessage?.viewOnce)
console.log(m.mediaMessage)
    // ✅ Verificar si el mensaje contiene un archivo "ver una vez"
    if (m.message && m.message.viewOnceMessageV2 && m.message.viewOnceMessageV2.message) {
        msg = m.message.viewOnceMessageV2.message;
    } 
    // ✅ Verificar si el mensaje citado contiene un archivo "ver una vez"
    else if (m.quoted && m.quoted.mediaMessage && m.quoted.mediaMessage.imageMessage?.viewOnce) {
        msg = m.quoted.mediaMessage;
    } 
    // ❌ Si no es un mensaje "ver una vez", salir
    else {
        return console.log("⛔ No es un mensaje de 'ver una vez'.");
    }

    try {
        const mediaType = Object.keys(msg)[0]; // "imageMessage" o "videoMessage"
        if (!mediaType) return console.log("⛔ Tipo de media no detectado");

        const media = msg[mediaType];
        if (!media.viewOnce) return console.log("⛔ No es un mensaje de 'ver una vez'.");

        const type = mediaType.includes("image") ? "image" : mediaType.includes("video") ? "video" : null;
        if (!type) return console.log("⛔ Tipo de archivo no soportado");

        console.log(`📥 Descargando ${type}...`);
        const stream = await downloadContentFromMessage(media, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const fileSize = formatFileSize(media.fileLength);
        const timestamp = getMakassarTimestamp(media.mediaKeyTimestamp);
        const description = `🚫 *Anti-ViewOnce*\n📁 *Tipo:* ${type}\n📝 *Caption:* ${media.caption || "N/A"}\n📏 *Tamaño:* ${fileSize}\n⏰ *Hora:* ${timestamp}\n👤 *Enviado por:* @${m.sender.split("@")[0]}`;

        // ✅ Enviar la imagen o video recuperado
        if (type === "image") {
            await this.sendFile(m.chat, buffer, "image.jpg", description, m, false, { mentions: [m.sender] });
        } else if (type === "video") {
            await this.sendFile(m.chat, buffer, "video.mp4", description, m, false, { mentions: [m.sender] });
        }

        console.log(`✅ ${type} enviado con éxito.`);
    } catch (error) {
        console.error("❌ Error al procesar el mensaje de 'ver una vez':", error);
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
