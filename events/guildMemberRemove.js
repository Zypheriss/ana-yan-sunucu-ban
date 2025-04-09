const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    if (!client.config) {
      console.error('Config yüklenmedi!');
      return;
    }

    const { anaSunucuID, yanSunucuID, banSebep, dmMesaj, logKanalID } = client.config;
    
    if (member.guild.id !== anaSunucuID) return;

    const logChannel = client.channels.cache.get(logKanalID);
    const user = member.user;

    try {
      const yanSunucu = await client.guilds.fetch(yanSunucuID);
      const yanSunucuUyesi = await yanSunucu.members.fetch(user.id).catch(() => null);

      if (yanSunucuUyesi) {
        await Promise.all([
          member.guild.bans.create(user.id, { reason: banSebep }),
          yanSunucu.bans.create(user.id, { reason: banSebep })
        ]);

        try {
          await user.send(dmMesaj);
        } catch (dmError) {
          console.log(`${user.tag} kullanıcısına DM gönderilemedi`);
        }

        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⛔ Otomatik Ban')
            .setDescription(`${user.tag} (${user.id}) yasaklandı`)
            .addFields(
              { name: 'Sebep', value: banSebep },
              { name: 'Sunucular', value: `${member.guild.name}\n${yanSunucu.name}` }
            )
            .setTimestamp();
          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Ban hatası:', error);
      if (logChannel) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Ban Sistemi Hatası')
          .setDescription(`**Kullanıcı:** ${user.tag}\n**Hata:** ${error.message}`)
          .setTimestamp();
        await logChannel.send({ embeds: [errorEmbed] });
      }
    }
  }
};