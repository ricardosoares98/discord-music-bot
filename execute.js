const operations = require("./operations.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");
const SpotifyWebApi = require("spotify-web-api-node");
const { clientId, clientSecret } = require("./auth.json");

const maxLinesPlaylist = 10;

module.exports = {
    play: async function execute(message, serverQueue) {
        const args = message.content.split(" ");

        const voiceChannel = message.member.voice.channel;
        let isValid = validateVoice(message, voiceChannel);
        if(isValid != "") {return;}

        let song;
        //Validate URL YT Video
        if (ytdl.validateURL(args[2])) {

            //Search song by URL
            try {
                const songInfo = await ytdl.getInfo(args[2]);

                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
                };

                operations.addSongToQueue(serverQueue, song, message, voiceChannel, true);
            }
            catch (ex) {
                return message.channel.send(
                    "Lamento informar mas o maninho do Youtube não me deixa tocar essa merda."
                );
            }

            //Validate ID YT Playlist
        } else if (ytpl.validateID(args[2])) {
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


                try {
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
                catch (ex) {
                    continue;
                }
            }

            global.commandInProcess = false;

            //Send final success message
            return message.channel.send(
                "Ta feito, tens ai musica para caralho, não me chateies tão cedo. \n" +
                "Músicas adicionadas: \n" +
                songTitles
            );
        } else {          
            ytTitle(message, voiceChannel, args.slice(2).join(" "), true);   
        }
    },
    spotify: async function (message, serverQueue){
        const voiceChannel = message.member.voice.channel;
        let isValid = validateVoice(message, voiceChannel);
        if(isValid != "") {return;}

        const args = message.content.split(" ");

        var playlistID = "";

        if (args.length == 4 && args[2].toUpperCase() == "TOP" && args[3].toUpperCase() == "50") {
            playlistID = "37i9dQZEVXbMDoHDwVN2tF";
        }
        else if(args.length == 5 && args[2].toUpperCase() == "TOP" && args[3].toUpperCase() == "50" && args[4].toUpperCase() == "PORTUGAL"){
            playlistID = "37i9dQZEVXbKyJS56d1pgi";
        }
        else {
            playlistID = args[2].substring(
                args[2].lastIndexOf("/") + 1, 
                args[2].lastIndexOf("?")
            );
        }

        if(playlistID == ""){return;}

        var spotifyApi = new SpotifyWebApi({
            clientId: `${clientId}`,
            clientSecret: `${clientSecret}`,
            redirectUri: 'http://localhost:8080'
          });

        message.channel.send(
            "A adicionar música, espera um pouco que esta merda não é fácil de fazer fodasse \n" +
            "Vou-me tossir um pouco no inicio, mas esta merda não é Covid podes ter calma"
        );

        spotifyApi.clientCredentialsGrant().then(async function(dataClient){
            spotifyApi.setAccessToken(dataClient.body.access_token);

            spotifyApi.getPlaylist(playlistID)
                .then(async function(data) {
                    data.body.tracks.items.forEach(el => {

                        let trackId = el.track.id; 
                        global.commandInProcess = true;

                        spotifyApi.getTrack(trackId).then(async function(trackData){
                            var ytSearch = "";
                            trackData.body.artists.forEach(artist => {
                                ytSearch = ytSearch.concat(" ", artist.name);
                            });    

                            ytSearch = ytSearch.concat(" ", trackData.body.name); 
                                
                            const result = await ytTitle(message, voiceChannel, ytSearch, false);  
                            global.commandInProcess = false;                            
                        }) 
                    });
                },function(err) {
                    console.log('Something went wrong!', err);
                    global.commandInProcess = false;
                });
        });
    },
}

async function ytTitle (message, voiceChannel, ytSearch, sendMessage){
    let song;
    //Search song by Title
    const { videos } = await yts(ytSearch);

    if (!videos.length) return message.channel.send("Fodasse, não procuro mais essa merda não existe.");
    song = {
        title: videos[0].title,
        url: videos[0].url
    };

    try {
        //used to test if bot can play song
        const songInfo = await ytdl.getInfo(song.url);

        operations.addSongToQueue(global.queue.get(message.guild.id), song, message, voiceChannel, sendMessage);              
    } catch (error) {
        if(sendMessage){
            return message.channel.send(
                "Lamento informar mas o maninho do Youtube não me deixa tocar essa merda."
            );
        }else{
            console.log("ytTitle error: ".concat(error));
        }    
    }  
}

function validateVoice(message, voiceChannel){
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

    return "";
}
