export default async function listener({ sock, msg, from, isGroup, sender }) {
  try {
    // nothing on each message; welcome handled in group update
  } catch (e) { console.error('welcome listener error', e); }
}

export async function onGroupParticipantsUpdate({ sock, update }) {
  try {
    const { id, participants, action } = update;
    if (action === 'add') {
      for (const p of participants) {
        const pushname = p.split('@')[0];
        const welcomeText = `Selamat datang @${pushname}! Perkenalkan diri ya. — dari *ryuu_xyi*`;
        await sock.sendMessage(id, { text: welcomeText, mentions: [p] });
      }
    }
  } catch (e) { console.error('welcome error', e); }
}
