let WAMessageStubType = (await import(global.baileys)).default

export async function before(m, { conn, participants, groupMetadata }) {
console.log({ messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})
	
let chat = global.db.data.chats[m.chat] 
let usuario = `@${m.sender.split`@`[0]}`
let inf = lenguajeGB['smsAvisoIIG']()
	
if (!m.messageStubType || !m.isGroup || !chat.detect) return
	
const fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net"}  
let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => gataMenu)
//let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './src/grupos.jpg'  

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = lenguajeGB.smsAutodetec1(inf, usuario, m)
foto = lenguajeGB.smsAutodetec2(inf, usuario, groupMetadata)
edit = lenguajeGB.smsAutodetec3(inf, usuario, m, groupMetadata)
newlink = lenguajeGB.smsAutodetec4(inf, groupMetadata, usuario)
status = lenguajeGB.smsAutodetec5(inf, groupMetadata, m, usuario)
admingp = lenguajeGB.smsAutodetec6(inf, m, groupMetadata, usuario)
noadmingp = lenguajeGB.smsAutodetec7(inf, m, groupMetadata, usuario)

if (m.messageStubType === 21) {
await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: null })   

} else if (m.messageStubType === 145) {
let status = m.messageStubParameters[0] === 'on' ? 'activado' : 'desactivado';
let mensaje = `🔔 *Modo de aprobación para unirse al grupo ha sido ${status}.*`
await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender] })
console.log(mensaje)
  
} else if (m.messageStubType === 22) {
await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })

} else if (m.messageStubType === 23) {
await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })    

} else if (m.messageStubType === 25) {
await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  
	
} else if (m.messageStubType === 26) {
await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  

} else if (m.messageStubType == 29) {
await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak }) 
	
} else if (m.messageStubType === 172 && m.messageStubParameters.length > 0) {
const rawUser = m.messageStubParameters[0]
const users = rawUser.split('@')[0]
const prefijosProhibidos = ['91', '92', '222', '93', '265', '61', '62', '966', '229', '40', '49', '20', '963', '967', '234', '210', '212'];
const usersConPrefijo = users.startsWith('+') ? users : `+${users}`

if (chat.antifake) {
if (prefijosProhibidos.some(prefijo => usersConPrefijo.startsWith(prefijo))) {
try {
await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'reject');
console.log(`Solicitud de ingreso de @${users} rechazada automáticamente por tener un prefijo prohibido.`);
} catch (error) {
console.error(`Error al rechazar la solicitud de ${usersConPrefijo}:`, error);
}} else {
try {
await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'approve');
console.log(`Solicitud de ingreso de @${users} aprobada automáticamente.`);
} catch (error) {
console.error(`Error al aprobar la solicitud de ${usersConPrefijo}:`, error);
}}} else {
try {
await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'approve');
console.log(`Solicitud de ingreso de @${users} aprobada automáticamente ya que #antifake está desactivado.`);
} catch (error) {
console.error(`Error al aprobar la solicitud de ${usersConPrefijo}:`, error);
}}
	
} else if (m.messageStubType === 30) {
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })  

} else {
console.log({ messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})
}}
