export default {
  name: 'ping',
  description: 'balas pong',
  execute: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: 'pong' });
  }
};
