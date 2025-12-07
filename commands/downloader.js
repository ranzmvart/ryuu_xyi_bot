import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
ffmpeg.setFfmpegPath(ffmpegPath);

import config from '../config.js';

export default {
  name: 'download',
  description: 'Download YouTube video',
  execute: async ({ sock, from, args }) => {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) return await sock.sendMessage(from, { text: 'Berikan URL YouTube yang valid. Contoh: !download https://youtu.be/...' });

    const tmpDir = path.join('tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const out = path.join(tmpDir, `video_${Date.now()}.mp4`);
    try {
      await sock.sendMessage(from, { text: 'Memulai download, mohon tunggu...' });
      const stream = ytdl(url, { quality: 'highestvideo' });

      await new Promise((resolve, reject) => {
        ffmpeg(stream)
          .format('mp4')
          .outputOptions('-movflags frag_keyframe+empty_moov')
          .save(out)
          .on('end', resolve)
          .on('error', reject);
      });

      const stats = fs.statSync(out);
      const maxMB = config.maxDownloadMB || 35;
      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB > maxMB) {
        fs.unlinkSync(out);
        return await sock.sendMessage(from, { text: `Ukuran file ${sizeMB.toFixed(1)}MB melebihi batas ${maxMB}MB.` });
      }

      const buffer = fs.readFileSync(out);
      await sock.sendMessage(from, { video: buffer, caption: 'Berikut video hasil download' });
      fs.unlinkSync(out);
    } catch (err) {
      console.error('download error', err);
      if (fs.existsSync(out)) fs.unlinkSync(out);
      await sock.sendMessage(from, { text: 'Gagal mendownload video.' });
    }
  }
};
