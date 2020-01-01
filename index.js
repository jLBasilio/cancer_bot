import dotenv from 'dotenv'
import Discord from 'discord.js';
import commands from './commands';
dotenv.config();

const client = new Discord.Client();

client.once('ready', () => { 
  console.log('Bot is ready')
})

client.login(process.env.TOKEN);

client.on('message', message => {
  if (message.author.username === process.env.BOT_NAME) return;

  const opts = message.content.split(' ');
  const prefix = opts[0].substring(0, 3);
  const command = opts[0].substring(3);
  const params = opts.slice(1);

  if (prefix === '!cb'
    && commands.hasOwnProperty(command)) {
    commands[command](message, params);
  }
});
