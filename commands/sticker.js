import sharp from 'sharp';
export default {
  name: 'sticker',
  description: 'Buat sticker dari gambar (reply gambar lalu !sticker)',
  execute: async ({ sock, from, msg, downloadContentFromMessage }) => {
    try {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return await sock.sendMessage(from, { text: 'Reply gambar yang ingin dijadikan sticker.' });

      const image = quoted.imageMessage;
      if (!image) return await sock.sendMessage(from, { text: 'Yang di-reply bukan gambar.' });

      // download content
      const stream = await downloadContentFromMessage(quoted, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const webp = await sharp(buffer).resize(512, 512, { fit: 'inside' }).webp().toBuffer();
      await sock.sendMessage(from, { sticker: webp });
    } catch (err) {
      console.error('sticker error', err);
      await sock.sendMessage(from, { text: 'Gagal membuat sticker.' });
    }
  }
};
