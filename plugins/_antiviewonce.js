import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function before(m) {
    //if (m.isBaileys && m.fromMe) return true;
   // if (!m.isGroup) return false;

    // Verificar si el mensaje contiene un archivo "viewOnce"
    if (m.message && m.message.viewOnceMessage) {
        const viewOnceMsg = m.message.viewOnceMessage.message;

        try {
            const mediaType = Object.keys(viewOnceMsg)[0]; // Tipo de archivo, por ejemplo "imageMessage"
            if (!mediaType) return console.log("⛔ No se detectó tipo de archivo");

            const media = viewOnceMsg[mediaType];
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
    } else {
        console.log("⛔ No se detectó un mensaje 'viewOnce'.");
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
