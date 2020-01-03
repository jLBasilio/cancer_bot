import axios from 'axios';
import helpCommands from './help';

const error_command = (message) => message.channel.send('Incomplete command.');
const commands = {
  'greet': (message) => {
    message.channel.send('@everyone Hello');
  },
  'leaguemh': async (message, params) => {
    if (!params.length) {
      error_command();
      return;
    }
    const findChamp = (champs, id) => {        
      for (const key in champs) {
        if (id === parseInt(champs[key].key, 10)) return champs[key].name
      }
    }
    try {
      const user = params.join(' ');
      const [
        { data: { data: champs } },
        { data: { accountId } }
      ] = await Promise.all([
        axios.get(process.env.LEAGUE_CHAMPS),
        axios.get(`${process.env.LEAGUE_PLAYER}?name=${encodeURI(user)}&region=PH`)
      ]);
      const { data: { games: { games } } } = await axios.get(`${process.env.LEAGUE_HISTORY}/${accountId}?beginIndex=0&endIndex=10`);
      message.channel.send(`${user}'s last 10 games`)
      let toSend = "";
      games.reverse().forEach(game => {
        toSend += ('\n====\n')
        toSend += (`CHAMPION ID: ${parseInt(game.participants[0].championId, 10)}\n`)
        toSend += (`CHAMPION: ${findChamp(champs, parseInt(game.participants[0].championId, 10))}\n`)
        toSend += (`STATUS: ${game.participants[0].stats.win ? 'VICTORY' : 'DEFEAT'}\n`)
        toSend += (`MODE: ${game.gameMode}\n`)
      })
      message.channel.send(toSend);
    } catch (err) {
      console.log(err)
      return new Error(err);
    }
  },
  'delete': async (message) => {
    message.channel.send('Deleting cancer_bot messages and commands...');
    let messages = [...(await message.channel.fetchMessages({ limit: 99 }))]
      .filter(m => m[1].channel.name === message.channel.name
        && (m[1].author.username === process.env.BOT_NAME
          || m[1].content.startsWith('!cb')
        )
      );
    messages.forEach(m => m[1].delete())
  },
  'disappear': async (message, params) => {
    if (!params.length) {
      error_command();
      return;
    }
    await message.delete()
    const indexS = params.indexOf('-s')
    let reply = null;
    if (indexS > 0 && params.length > indexS+1) {
      reply = await message.reply(` said: ${params.slice(0, indexS).join(' ')}\t\t[ Disappears in ${params[indexS+1] <= 20 ? params[indexS+1] : '20' }s ]`)
      setTimeout(() => reply.delete(), (params[indexS+1] <= 20 ? params[indexS+1] : 20) * 1000);
    } else {
      reply = await message.reply(` said: ${params.join(' ')}\t\t[ Disappears in 5s ]`)
      setTimeout(() => reply.delete(), 5000);
    }
  },
  'memst': (message) => {
    const minutes = stamp => String((Date.now() - Date.parse(stamp.start)) / 60000).split('.')[0]
    const type = {
      0: 'playing',
      1: 'streaming',
      2: 'listening',
      3: 'watching'
    }
    let toSend = `\n\n${message.channel.guild.name} Players:\n\n`
    const { presences: [...presences], members: [...members] } = message.channel.guild;
    const presentMems = members.filter(m => presences.some(p => p[0] === m[0]));
    presentMems
      .reduce((pms, pm) => {
          const presence = presences.find(p => p[0] === pm[0])
          const user = {};
          user.username = pm[1].user.username
          user.status = `${presence[1].clientStatus.web || 'offline'} (web), ${presence[1].clientStatus.desktop || 'offline'} (desktop), ${presence[1].clientStatus.mobile || 'offline'} (mobile)`
          user.activity = presence[1].game
            ? `Currently ${presence[1].game.type < 3
              ? `${type[presence[1].game.type]}: ${presence[1].game.name}, ${presence[1].game.details} ${presence[1].game.timestamps && presence[1].game.timestamps.start
                ? `for ${minutes(presence[1].game.timestamps)} minute(s)`
                : ''}`
              : 'playing'}`
            : 'N/A'
          return [...pms, user];
        }, [])
      .sort((a, b) => a.username - b.username)
      .forEach(m => {
        toSend += `\`User:\` ${m.username}\n`
        toSend += `\`Status:\` ${m.status}\n`
        toSend += `\`Activity:\` ${m.activity}\n`
        toSend += '===\n'
      });
    message.channel.send(toSend)
  },
  'help': (message) => {
    let toSend = 'Made by @jeff_\n===\n'
    helpCommands.forEach(c => toSend += `\`${c.name}:\`  ${c.desc}\n`)
    message.channel.send(toSend);
  }
}

export default commands;
