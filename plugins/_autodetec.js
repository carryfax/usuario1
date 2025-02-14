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
const botIsAdminCommunity = groupMetadata.participants.some(p => p.id === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin'))

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = lenguajeGB.smsAutodetec1(inf, usuario, m)
foto = lenguajeGB.smsAutodetec2(inf, usuario, groupMetadata)
edit = lenguajeGB.smsAutodetec3(inf, usuario, m, groupMetadata)
newlink = lenguajeGB.smsAutodetec4(inf, groupMetadata, usuario)
status = lenguajeGB.smsAutodetec5(inf, groupMetadata, m, usuario)
admingp = lenguajeGB.smsAutodetec6(inf, m, groupMetadata, usuario)
noadmingp = lenguajeGB.smsAutodetec7(inf, m, groupMetadata, usuario)

if (m.messageStubType === 21) { // Anunciar nuevo nombre del grupo
await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] })   
  
} else if (m.messageStubType === 22) { // Nueva foto del grupo
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => gataMenu)
await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] })

} else if (m.messageStubType === 23) { // Nuevo enlace del grupo
await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] })    

} else if (m.messageStubType === 24) { // Detectar una nueva descripción 
let mensaje = `📝 *La descripción del grupo ha sido actualizada. La nueva descripción es:*\n\n${m.messageStubParameters[0]}`
await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender] })

} else if (m.messageStubType === 25) { // Permitir o no configurar el grupo [on/off]
await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] })  
	
} else if (m.messageStubType === 26) { // Cerrar o abrir grupo [on/off]
await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] })  

} else if (m.messageStubType == 29) { // Detectar nuevo admin
await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }) 

} else if (m.messageStubType === 30) { // Detectar revocación de admin
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }) 

} else if (m.messageStubType === 145) {
let status = m.messageStubParameters[0] === 'on' ? 'activado' : 'desactivado';
let mensaje = `🔔 *Modo de aprobación para unirse al grupo ha sido ${status}.*`
await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender] })

} else if (m.messageStubType === 171) {
let all_member_add = m.messageStubParameters[0] === 'all_member_add' ? "✅ *Ahora todos pueden añadir usuarios.*" : "⚠ *Ahora solo los administradores pueden añadir usuarios.*"
await conn.sendMessage(m.chat, { text: all_member_add, mentions: [m.sender] }) 

} else if (m.messageStubType === 172 && botIsAdminCommunity) {
console.log(`Bot: ${botIsAdminCommunity}`)
let usuario = m.messageStubParameters[0]
let metodo = m.messageStubParameters[2] === 'invite_link' ? 'un enlace de invitación' : 'un grupo vinculado a la comunidad'
let mensaje = `🚪 @${usuario.split('@')[0]} ha solicitado unirse mediante ${metodo}.`
await conn.sendMessage(m.chat, { text: mensaje, mentions: [usuario] })
if (!chat.antifake) {
try {
await conn.groupRequestParticipantsUpdate(m.chat, [usuario], 'approve')
await conn.sendMessage(m.chat, { text: `Solicitud de ingreso de @${usuario} aprobada automáticamente ya que el anti fake está desactivado.`, mentions: [usuario] })
} catch (error) {
console.error(`Error al aprobar la solicitud de ${usuario}: `, error)
}}

/*} else if (m.messageStubType === 172 && m.messageStubParameters.length > 0) {
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
}} */

} else {
console.log({ messageStubType: m.messageStubType, messageStubParameters: m.messageStubParameters, type: WAMessageStubType[m.messageStubType] })
}}
