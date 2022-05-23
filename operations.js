const ytdl = require("ytdl-core");

module.exports = {
    addSongToQueue: async function (serverQueue, song, message, voiceChannel, sendMessage){
        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
    
            global.queue.set(message.guild.id, queueContruct);
            queueContruct.songs.push(song);
    
            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                this.play(message.guild, queueContruct.songs[0]);
                serverQueue = global.queue.get(message.guild.id)
            } catch (err) {
                console.log(err);
                global.queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
    
            if (sendMessage) {
                var rnd = Math.floor(Math.random() * 5);
     
                if (rnd == 0) {
                    return message.channel.send(`Ora bem mais uma musica de merda que ninguem quer ouvir mas pronto. **${song.title}** foi adicionada!`);
                } else if (rnd == 1) {
                    return message.channel.send(`Está vai baaaaaater, no fundo. **${song.title}** foi adicionada, com muito carinho!`);
                } else if (rnd == 2) {
                    return message.channel.send(`Está é a minha favorita. Aqui vai **${song.title}** para a lista!`);
                } else if (rnd == 3) {
                    return message.channel.send(`Fodasse que merda, **${song.title}** adicionada a lista!`);
                } else if (rnd == 4) {
                    return message.channel.send(`:fire: :fire: :fire:. Aqui vai **${song.title}** para a lista!`);
                } else if (rnd == 5) {
                    return message.channel.send(`Está bem, está bem. **${song.title}** para a lista!`);
                } 
            }
        }
    },
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
            return message.channel.send("Não há nada para baralhar, deves ser meio burro.");
        }
    },
    play: function play (guild, song, noMsg) {
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
        
        if(!noMsg){
            var rnd = Math.floor(Math.random() * 5);

            if (rnd == 0) {
                serverQueue.textChannel.send(`Proximo soooom, bota fogo nessa merda: **${song.title}** \n **${song.url}**`);
            } else if (rnd == 1) {
                serverQueue.textChannel.send(`Esta é boa, a tocar: **${song.title}** \n **${song.url}**`);
            } else if (rnd == 2) {
                serverQueue.textChannel.send(`Aqui vai: **${song.title}** \n **${song.url}**`);
            } else if (rnd == 3) {
                serverQueue.textChannel.send(`A pedido do gajo mais chato desta sala: **${song.title}** \n **${song.url}**`);
            } else if (rnd == 4) {
                serverQueue.textChannel.send(`Esta é para por tuda a gente a chorar: **${song.title}** \n **${song.url}**`);
            } else if (rnd == 5) {
                serverQueue.textChannel.send(`Mas que música de merda, aqui vai: **${song.title}** \n **${song.url}**`);
            }
        }
    },
    meme: async function (message, serverQueue){
        //Play random meme
        const voiceChannel = message.member.voice.channel;

        var rnd = Math.floor(Math.random() * 10);
        let song;
        if(rnd = 0){
            //Seu passaro maluco (for some reason starts and stops in 1 sec)
            const songInfo = await ytdl.getInfo("https://www.youtube.com/watch?v=DpQyy2PKeSs")
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };          
        }else{
            //default random meme
            //Eu quero cafeeeeeeeeeee
            const songInfo = await ytdl.getInfo("https://www.youtube.com/watch?v=VxRpkfcXEpA")
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };          
        }

        message.channel.send(":see_no_evil: :hear_no_evil: :speak_no_evil:");

        this.addSongToQueue(serverQueue,song, message, voiceChannel, false);
    },
    
}
