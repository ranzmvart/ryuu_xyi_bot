import config from '../config.js';
export default {
  name: 'menu',
  description: 'show menu',
  execute: async ({ sock, from }) => {
    const text = `╭──〔 *${config.botName}* 〕
│ Prefix: ${config.prefix}
│ Owner : ${config.ownerName}
╰────────────────
• !ping
• !menu
• !ai [pertanyaan]
• !download [youtube_url]
• Reply gambar lalu !sticker
`;
    await sock.sendMessage(from, { text });
  }
};
