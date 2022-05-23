const operations = require("./operations.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");

const maxLinesPlaylist = 10;

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
            
            operations.addSongToQueue(serverQueue, song, message, voiceChannel, true);
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

                operations.addSongToQueue(global.queue.get(message.guild.id), song, message, voiceChannel, false);
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

            operations.addSongToQueue(serverQueue, song, message, voiceChannel, true);
        }
    }
}
