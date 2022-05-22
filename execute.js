const operations = require("./operations.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");
const sfpl = require("spotify-api.js")

const maxLinesPlaylist = 10;

async function addSongToQueue(serverQueue, song, message, voiceChannel, randomMsg){
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
            operations.play(message.guild, queueContruct.songs[0]);
            serverQueue = global.queue.get(message.guild.id)
        } catch (err) {
            console.log(err);
            global.queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);

        if (randomMsg) {
            var rnd = Math.floor(Math.random() * 6);

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
                return message.channel.send(`Está é a minha favorita. Aqui vai **${song.title}** para a lista!`);
            } else if (rnd == 6) {
                return message.channel.send(`Está é a minha favorita. Aqui vai **${song.title}** para a lista!`);
            }
        }
    }
}

module.exports = {
    play: async function execute(message, serverQueue) {
        const args = message.content.split(" ");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
        return message.channel.send(
            "Oh Morcão, para onde vamos curtir está musica? Entra num canal pah!"
        );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send(
                "Não consigo tocar musica fodasse, inutéis. Quero permissões **JÁ**"
            );
        }

        let song;
        //Validate URL YT Video
        if (ytdl.validateURL(args[2])) {
            //Search song by URL
            const songInfo = await ytdl.getInfo(args[2]);
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };
            
            addSongToQueue(serverQueue, song, message, voiceChannel, true);
        //Validate ID YT Playlist
        } else if(ytpl.validateID(args[2])) {
            const playlist = await ytpl(args[2]);
            global.commandInProcess = true;
            //Playlist is empty
            if (playlist.items.length == 0) {
                return message.channel.send(
                    "Essa merda não tem musica nenhum, queres que cante?"
                );
            }

            //Save song names in string so you can tell user what songs have been added (max 10 cause of spam)
            let songTitles = "";           
            for (let i = 0; i < playlist.items.length; i++) {
                const element = playlist.items[i];

                const songInfo = await ytdl.getInfo(element.url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
                };

                if (i <= maxLinesPlaylist) {
                    songTitles = songTitles + " **" + song.title + "** \n";
                } else if (i == maxLinesPlaylist + 1) { //If more then X just count and add one line at the end
                    songTitles = songTitles + " e **" + (playlist.items.length - maxLinesPlaylist) + "** outras.";
                }

                addSongToQueue(global.queue.get(message.guild.id), song, message, voiceChannel, false);
            }
            
            global.commandInProcess = false;

            //Send final success message
            return message.channel.send(
                "Ta feito, tens ai musica para caralho, não me chateies tão cedo. \n" +
                "Músicas adicionadas: \n" +
                songTitles
            );
        } else {
            //Search song by Title
            const { videos } = await yts(args.slice(2).join(" "));

            if (!videos.length) return message.channel.send("Fodasse, não procuro mais essa merda não existe.");
            song = {
                title: videos[0].title,
                url: videos[0].url
            };

            addSongToQueue(serverQueue, song, message, voiceChannel, true);
        }
    }
}
