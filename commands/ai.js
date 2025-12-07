import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default {
  name: 'ai',
  description: 'Chat with OpenAI',
  execute: async ({ sock, from, args }) => {
    const prompt = args.join(' ');
    if (!prompt) return await sock.sendMessage(from, { text: 'Kirim pertanyaan, contoh: !ai siapa presiden indonesia?' });
    try {
      await sock.sendMessage(from, { text: 'Sedang memproses AI...' });
      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600
      });
      const answer = resp.choices?.[0]?.message?.content || 'Maaf, tidak ada jawaban.';
      await sock.sendMessage(from, { text: answer });
    } catch (err) {
      console.error('OpenAI error', err);
      await sock.sendMessage(from, { text: 'Terjadi kesalahan saat menghubungi OpenAI.' });
    }
  }
};
