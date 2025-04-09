const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(` ${client.user.tag} botu aktif!`);
    
    client.user.setPresence({
      activities: [{ name: 'Ban sistemi aktif', type: 3 }],
      status: 'dnd'
    });

    const logChannel = client.channels.cache.get(client.config.logKanalID);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Bot Aktif!')
        .setDescription(`${client.user.tag} olarak giriş yapıldı`)
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    }
  }
};