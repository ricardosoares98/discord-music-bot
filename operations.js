const ytdl = require("ytdl-core");

module.exports = {
    name: "Available operations",
    description: "All available operations for the music bot",
    skip: function (message, serverQueue) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "Quem queres foder? Entra no canal se queres passar está merda a frente."
            );
        if (!serverQueue)
            return message.channel.send("Passa passa, não sei o que mas passa.");
        serverQueue.connection.dispatcher.end();
    },
    stop: function (message, serverQueue) {
        if (!message.member.voice.channel)
            return message.channel.send(
                "Quem queres foder? Entra no canal se queres parar está merda."
            );

        if(global.commandInProcess){
            return message.channel.send("Aguenta aí os cavalos que eu ainda não acabei o meu trabalho.");
        }

        if (!serverQueue)
            return message.channel.send("AI PARA.... Afinal não há nada para parar...");

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    },
    shuffle: function (message, serverQueue) {
        if (serverQueue) {
            var currentIndex = serverQueue.songs.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = serverQueue.songs[currentIndex];
                serverQueue.songs[currentIndex] = serverQueue.songs[randomIndex];
                serverQueue.songs[randomIndex] = temporaryValue;
            }
            return message.channel.send(".Ta feito, baralhada merda está, sempre volta, Ok");
        } else {
            return message.channel.send("Ñão há nada para baralhar, deves ser meio burro.");
        }
    },
    play: function play (guild, song) {
        const serverQueue = queue.get(guild.id);
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on("finish", () => {
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

        var rnd = Math.floor(Math.random() * 5);

        if (rnd == 0) {
            serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
        } else if (rnd == 1) {
            serverQueue.textChannel.send(`Esta é boa, a tocar: **${song.title}** \n **${song.url}**`);
        } else if (rnd == 2) {
            serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
        } else if (rnd == 3) {
            serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
        } else if (rnd == 4) {
            serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
        } else if (rnd == 5) {
            serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
        }
    },
    meme: function (){
        //Play a meme song
    },
    
}
