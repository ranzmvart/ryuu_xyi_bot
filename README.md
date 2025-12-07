# ryuu_xyi - WhatsApp Bot (Baileys)

Features:
- AI Chat (OpenAI)
- YouTube Downloader
- Sticker Maker (from replied image)
- Anti-Link (warn)
- Auto Welcome (when someone joins group)

Setup:
1. Copy `.env.example` to `.env` and fill OPENAI_API_KEY.
2. `npm install`
3. (Recommended) install system ffmpeg, or rely on ffmpeg-static.
4. `node index.js` and scan the QR shown in terminal.

Notes about deployment:
- This bot keeps a persistent WebSocket connection and therefore should run on a persistent host (VPS, Railway, Render, Fly.io).
- Serverless platforms like Vercel are not suitable for a persistent socket bot.

Commands (prefix `!`):
- `!ping` - pong
- `!menu` - show menu
- `!ai <prompt>` - chat with OpenAI
- `!download <youtube_url>` - download a YouTube video (mp4), limited by MAX_DOWNLOAD_SIZE_MB
- Reply an image and send `!sticker` to convert to sticker

