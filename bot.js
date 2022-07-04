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

client.on("error", err => { throw err; });

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
  const devID = '282642563414884355';

  if (message.content.includes("DJ RICKY SPAM") && (message.author.id == devID || message.author.bot)) { operations.spam(message, false); return };
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  var userMessage = message.content.toLowerCase();
  var userMessageArray = userMessage.split(' ');

  if (userMessageArray.length < 2) {
    return message.channel.send("Ora diga o que o senhor deseja. Faço tudo... quase tudo...")
  }

  //prefix + command
  switch (userMessageArray[0].concat(userMessageArray[1])) {
    //play song
    case `${prefix}play`:
    case `${prefix}mete`:
      exe.play(message, serverQueue);
      break;
    //skip song
    case `${prefix}skip`:
    case `${prefix}next`:
    case `${prefix}proxima`:
      operations.skip(message, serverQueue);
      break;
    //stop song
    case `${prefix}stop`:
    case `${prefix}para`:
    case `${prefix}morre`:
      operations.stop(message, serverQueue);
      break;
    //shuffle song
    case `${prefix}shuffle`:
    case `${prefix}baralha`:
      operations.shuffle(message, serverQueue);
      break;
    //play a meme song
    case `${prefix}meme`:
      operations.meme(message,serverQueue);
      break;
    //bot commands message
    case `${prefix}help`:
    case `${prefix}ajuda`:
      message.channel.send(
        ">>> **Eu sabia que não percebias um caralho disto. Aqui vai o livro de instruções:** \n \n" +
        " `ricky` usas esta merda no começo de todas as coisas que queiras conversar. \n \n" +
        " `ricky play ou ricky mete {musica/url/playlist}` para meteres aquele som que ninguem quer ouvir mas es um chato do caralho e vais por na mesma. \n \n" +
        " `ricky skip ou ricky next ou ricky proxima` para passares aquela musica de merda que o teu amigo decidiu por. \n \n" +
        " `ricky stop ou ricky para ou ricky morre` para eu me calar... para sempre :sob: ou pelo menos até me voltares a usar. \n \n" +
        " `ricky shuffle ou ricky baralha` para baralhares a musica toda. \n \n" +
        " `ricky meme` só a uma maneira de saberes o que faz :robot:"
      );
      break;
    case `${prefix}spam`:
      if(!(message.author.id == devID)) { message.channel.send("Nope não conheço, não sei do que falas, isso é de comer? "); break; }
      message.channel.send("Nem sei como começar... será que te digo como parar? Ou será tarde demais... É só escreveres ricky ...");
      setTimeout(() => { operations.spam(message, true) }, 2000)
      break;
    default:
      message.channel.send("Ah uhm ah e tal concordo contigo mas não percebo nada. Se es burro e não sabes falar comigo eu tenho um dicionário ricky ajuda ou ricky help se fores ingrês");
      break;
  }

  return;
});

client.login(token);