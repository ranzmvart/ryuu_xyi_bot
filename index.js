import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  downloadContentFromMessage 
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const config = (await import('./config.js')).default;

const commands = new Map();
const listeners = [];

const commandsPath = path.join('./commands');
if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath)) {
    if (file.endsWith('.js')) {
      const mod = await import(path.join(process.cwd(), 'commands', file));
      if (mod.default?.name) commands.set(mod.default.name, mod.default);
      else if (mod.name) commands.set(mod.name, mod);
    }
  }
}

const listenersPath = path.join('./listeners');
if (fs.existsSync(listenersPath)) {
  for (const file of fs.readdirSync(listenersPath)) {
    if (file.endsWith('.js')) {
      const mod = await import(path.join(process.cwd(), 'listeners', file));
      listeners.push(mod.default || mod);
    }
  }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state
  });

  // 📌 FIX QR CODE — INI BAGIAN PENTING
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n=== SCAN QR DI BAWAH INI ===\n");
      qrcode.generate(qr, { small: true });
      console.log("\n============================\n");
    }

    if (connection === 'open') console.log(`Bot ${config.botName} online!`);

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed, reconnecting?', shouldReconnect);
      if (shouldReconnect) start();
      else console.log('Logged out — delete auth_info to re-scan');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || msg.key.remoteJid === 'status@broadcast') return;
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = (isGroup ? msg.key.participant : from) || from;

      // run listeners
      for (const l of listeners) {
        try { 
          if (typeof l === 'function') 
            await l({ sock, msg, from, isGroup, sender }); 
        } catch(e) { console.error('listener error', e); }
      }

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      if (!text) return;

      if (!text.startsWith(config.prefix)) return;
      const args = text.slice(config.prefix.length).trim().split(/\s+/);
      const cmdName = args.shift().toLowerCase();

      const command = commands.get(cmdName);
      if (!command) return await sock.sendMessage(from, { text: 'Perintah tidak ditemukan. Ketik !menu' });

      await command.execute({ sock, msg, from, args, text, sender, downloadContentFromMessage });
    } catch (err) {
      console.error('message handler error', err);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    for (const l of listeners) {
      if (typeof l.onGroupParticipantsUpdate === 'function') {
        try { 
          await l.onGroupParticipantsUpdate({ sock, update }); 
        } catch(e) { console.error(e); }
      }
    }
  });

  console.log('Bot running...');
}

start();
