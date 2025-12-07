export default async function listener({ sock, msg, from, isGroup, sender }) {
  try {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    if (isGroup && text) {
      const urlRegex = /(https?:\/\/|www\.)[\w\-\.]+\.[a-z]{2,}([\w\-\.\/?=&%]*)/i;
      if (urlRegex.test(text)) {
        await sock.sendMessage(from, { text: `@${sender.split('@')[0]} Jangan kirim link di sini.`, mentions: [sender] });
      }
    }
  } catch (e) { console.error('antilink listener error', e); }
}
