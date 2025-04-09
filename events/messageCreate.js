module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
      if (message.author.bot) return;
      
      if (message.content.toLowerCase() === 'banlist') {
        const command = client.commands.get('banlist');
        if (!command) return;
        
        try {
          console.log(`Komut çalıştırılıyor: ${command.name} (${message.author.tag})`);
          await command.execute(message, client);
        } catch (error) {
          console.error('Komut hatası:', error);
          await message.reply('Komut çalıştırılırken hata oluştu!');
        }
      }
    }
  };