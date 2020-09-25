/* Requirements */
const Discord       = require("discord.js");
const CommandClient = require("./CommandClient");
const PlayerHolder  = require("./PlayerHolder");
const Player        = require("./Player");
const Entry         = require("./queue/Entry");

/* Instances */
const Client = CommandClient(new Discord.Client(), "!");

/* Bot Variables */
const Players = new PlayerHolder();

/* Event Handlers */
Client.on("ready", () => {
  Client.user.setActivity("Music", {type: "LISTENING"});
  console.log("booted");
});

/* Commands */
Client.commands.register("play", (args, message) => {
  if(!args[0]){
    message.reply("Please provide a link or title.");
    return;
  }
  
  //if(args[0].indexOf("youtube.com") === -1){
  //  message.reply("only YouTube links are supported at the moment");
  //  return;
  //}
  
  if(!message.member.voiceChannel){
    message.reply("You must be in a voice channel!");
    return;
  }
  
  let player = Players.get(message.guild, true);
  
  
  Entry.fromMessage(Client, args.join(" "), message).then((data) => {
    let {entry, msg} = data;
    
    player.addToQueue(entry);
    
    if(msg !== null) msg.edit(`Added ${entry.getInfo().getTitle()} to the queue`);
    else message.reply(`Added ${entry.getInfo().getTitle()} to the queue`);
    
    if(!message.guild.voiceConnection){
      message.member.voiceChannel.join().then(conn => {
        player.setConnection(conn);
      }).catch(e => {
        player.destroy();
        Players.remove(message.guild);

        message.reply(`Error joining voice channel: ${e}`);
      });
    }
  }).catch(console.error);
});

Client.commands.register("stop", (args, message) => {
  let player;
  if((player = Players.get(message.guild))){
    player.stop();
    message.reply("Player has been stopped!");
  }
});

Client.commands.register("skip", (args, message) => {
  let player;
  if((player = Players.get(message.guild))){
    player.skip();
    message.reply("Song has been skipped!");
  }
});

Client.commands.register("queue", (args, message) => {
  let player;
  if((player = Players.get(message.guild))){
    let embed = new Discord.RichEmbed();
    embed
      .setTitle("Queue")
      .setDescription("There are "+player.getQueue().array().length+" songs in queue.")
      .setFooter("Requested By: "+message.author.username, message.author.avatarURL);
    let i = 1;
    player.getQueue().array().forEach(entry => {
      embed.addField(`Entry: ${i++}`, [
        `**Title:** ${entry.getInfo().getTitle()}`,
        `**Duration:** ${entry.getInfo().getDuration()}`,
        `**Link:** ${entry.getInfo().getUrl()}`,
        `**Requested By:** ${entry.getCreator().username}`
      ].join("\n"));
    });
    message.reply(embed);
  }
});

Client.commands.register("playing", (args, message) => {
  let player;
  if((player = Players.get(message.guild))){
    let info = player.getNowPlaying().getInfo();
    let creator = player.getNowPlaying().getCreator();
    
    let embed = new Discord.RichEmbed();
    embed
      .setTitle("Now Playing")
      .setURL(info.getUrl())
      .setAuthor(creator.username, creator.avatarURL)
      .addField("Title:", info.getTitle(), true)
      .addField("Channel:", info.getChannel(), true)
      .addField("Duration:", info.getDuration(), true)
      .setImage(info.getThumbnail())
      .setFooter("Requested by: "+message.author.username, message.author.avatarURL);
    message.channel.send(embed);
  }else{
    message.reply("Player for this server wasn't found. Are you sure you're listening to music?");
  }
});


Client.login(process.env.BOT_TOKEN);