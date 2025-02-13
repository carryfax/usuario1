export async function before(m) {
   // if (m.isBaileys && m.fromMe) return true;
    //if (!m.isGroup) return false;

    // Depuración para verificar todo el contenido del mensaje
    console.log(m);

    if (m.mtype === "imageMessage") {
        const imageMessage = m.message.imageMessage;
        if (imageMessage.viewOnce) {
            console.log("⛔ El mensaje es de tipo 'viewOnce'.");

            try {
                const mediaType = "image"; // Sabemos que es una imagen
                const stream = await downloadContentFromMessage(imageMessage, mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const fileSize = formatFileSize(imageMessage.fileLength);
                const timestamp = getMakassarTimestamp(imageMessage.mediaKeyTimestamp);
                const description = `🚫 *Anti-ViewOnce*\n📁 *Tipo:* ${mediaType}\n📝 *Caption:* ${imageMessage.caption || "N/A"}\n📏 *Tamaño:* ${fileSize}\n⏰ *Hora:* ${timestamp}\n👤 *Enviado por:* @${m.sender.split("@")[0]}`;

                // ✅ Enviar la imagen recuperada
                await this.sendFile(m.chat, buffer, "image.jpg", description, m, false, { mentions: [m.sender] });

                console.log(`✅ Imagen enviada con éxito.`);
            } catch (error) {
                console.error("❌ Error al procesar el mensaje 'viewOnce' de imagen:", error);
            }
        } else {
            console.log("⛔ El mensaje no tiene el flag 'viewOnce'.");
        }
    } else {
        console.log("⛔ El mensaje no es de tipo 'imageMessage'.");
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
