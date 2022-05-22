//bot url - https://discord.com/api/oauth2/authorize?client_id=976943479949234196&permissions=3148800&scope=bot

const Discord = require("discord.js");
const { prefix, token } = require("./auth.json");
const operations = require("./operations.js");
const exe = require("./execute.js");

client = new Discord.Client();

global.queue = new Map();

global.commandInProcess = false;

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("ready", () =>{
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'Music Simulator | Precisas de ajuda? ricky ajuda',
        type: 'PLAYING'
    }
  });
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  var userMessage = message.content.toLowerCase();

  if (userMessage.startsWith(`${prefix}play`)){ 
    exe.play(message, serverQueue);
    return;
  } else if (userMessage.startsWith(`${prefix}skip`) || userMessage.startsWith(`${prefix}next`) || userMessage.startsWith(`${prefix}proxima`)) {
    operations.skip(message, serverQueue);
    return;
  } else if (userMessage.startsWith(`${prefix}stop`) || userMessage.startsWith(`${prefix}para`) || userMessage.startsWith(`${prefix}morre`)) {
    operations.stop(message, serverQueue);
    return;  
  } else if (userMessage.startsWith(`${prefix}shuffle`) || userMessage.startsWith(`${prefix}baralha`)){
    operations.shuffle(message, serverQueue);
    return;
  } else if (userMessage.startsWith(`${prefix}help`) || userMessage.startsWith(`${prefix}ajuda`)) {
    return message.channel.send(
      ">>> **Eu sabia que não percebias um caralho disto. Aqui vai o livro de instruções:** \n \n" +
      " `ricky` usas esta merda no começo de todas as coisas que queiras conversar. \n \n" +
      " `ricky play {musica/url/playlist}` para meteres aquele som que ninguem quer ouvir mas es um chato do caralho e vais por na mesma. \n \n" +
      " `ricky skip ou ricky next ou ricky proxima` para passares aquela musica de merda que o teu amigo decidiu por. \n \n" +
      " `ricky stop ou ricky para ou ricky morre` para eu me calar... para sempre :sob: ou pelo menos até me voltares a usar. \n \n" +
      " `ricky shuffle ou ricky baralha` para baralhares a musica toda."
    );
  } else {
    message.channel.send("Ah uhm ah e tal concordo contigo mas não percebo nada. Se es burro e não sabes falar comigo eu tenho um dicionário ricky ajuda ou ricky help se fores ingrês");
  }
});

client.login(token);