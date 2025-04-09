const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "banlist",
  description: "Banlı kullanıcıları listeler ve toplu affa izin verir",
  async execute(message, client) {
    if (!client.config) {
      return message.reply('Sistem ayarları yüklenemedi!');
    }

    const { anaSunucuID, yanSunucuID, logKanalID } = client.config;
    
    try {
      const mainGuild = await client.guilds.fetch(anaSunucuID);
      const secondaryGuild = await client.guilds.fetch(yanSunucuID);
      
      const [mainBans, secondaryBans] = await Promise.all([
        mainGuild.bans.fetch(),
        secondaryGuild.bans.fetch()
      ]);

      const allBans = new Map([...mainBans, ...secondaryBans]);
      
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Ban Listesi')
        .setDescription(`Toplam **${allBans.size}** banlı kullanıcı`)
        .addFields(
          { name: 'Ana Sunucu', value: `${mainBans.size} ban`, inline: true },
          { name: 'Yan Sunucu', value: `${secondaryBans.size} ban`, inline: true }
        );

      const unbanButton = new ButtonBuilder()
        .setCustomId('unban_all')
        .setLabel('Toplu Ban Affı')
        .setStyle(ButtonStyle.Success);
      
      const cancelButton = new ButtonBuilder()
        .setCustomId('cancel_unban')
        .setLabel('İptal')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(unbanButton, cancelButton);

      const sentMessage = await message.reply({ 
        embeds: [embed], 
        components: [row] 
      });

      const collector = sentMessage.createMessageComponentCollector({ 
        time: 10000 
      });

      collector.on('collect', async interaction => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({ 
            content: 'Bu buton sadece komutu kullanan kişi içindir!', 
            ephemeral: true 
          });
        }
        unbanButton.setDisabled(true);
        cancelButton.setDisabled(true);
        await interaction.update({ 
          components: [new ActionRowBuilder().addComponents(unbanButton, cancelButton)] 
        });

        if (interaction.customId === 'unban_all') {
          let unbanCount = 0;
          
          for (const [id] of allBans) {
            try {
              await mainGuild.bans.remove(id);
              await secondaryGuild.bans.remove(id);
              unbanCount++;
            } catch (error) {
              console.error(`Ban kaldırma hatası (${id}):`, error);
            }
          }

          const resultEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Ban Affı Başarılı!')
            .setDescription(`**${unbanCount}** kullanıcının banı kaldırıldı`);

          const logChannel = client.channels.cache.get(logKanalID);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('Toplu Ban Affı')
              .setDescription(`${message.author.tag} tarafından **${unbanCount}** ban kaldırıldı`)
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }

          await interaction.editReply({ 
            embeds: [resultEmbed], 
            components: [] 
          });
        } else {
          await interaction.editReply({ 
            content: 'İşlem iptal edildi', 
            components: [] 
          });
        }
        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          unbanButton.setDisabled(true);
          cancelButton.setDisabled(true);
          sentMessage.edit({ 
            components: [new ActionRowBuilder().addComponents(unbanButton, cancelButton)] 
          }).catch(console.error);
        }
      });

    } catch (error) {
      console.error('Ban listesi hatası:', error);
      await message.reply('Ban listesi alınırken hata oluştu!');
    }
  }
};