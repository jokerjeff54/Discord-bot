/**
* CommandClient
* have custom commands for your bot
* @author eDroid
*/

const Discord = require("discord.js");

class CommandClient {
  constructor(client, prefix = "/"){
    this.client = client;
    this.prefix = prefix;
    this._commands = new Map();
    this._init();
  }

  _init(){
    this.client.on("message", message => {
      this._handle(message);
    });
  }

  _handle(message){
    if(!message.content.startsWith(this.prefix)) return;
    let args = message.content.split(" ");
    let cmd = args.shift().substr(1).toLowerCase();
    if(!this._commands.has(cmd)) return;
    let command = this._commands.get(cmd);
    if((typeof command.options.runIf === "function" && command.options.runIf(message)) || command.options.runIf === undefined) command.cb(args, message);
  }

  register(name, callable, opts = {}){
    if((typeof name !== "string") || (typeof callable !== "function")) return false;
    if(typeof opts !== "object") opts = {};
    if(this._commands.has(name)) return false;
    this._commands.set(name, {cb: callable, options: opts});
    return true;
  }

  unregister(name){
    return this._commands.delete(name);
  }

  setHelpCommand(options){
    return this.register("help", (args, msg) => {
      msg.channel.startTyping();
      let embed = new Discord.RichEmbed();
      embed
      .setColor(options.color ? options.color : "#000000")
      .setTitle(`Help for ${options.name ? options.name : this.client.user.username}:`)
      .setDescription(options.description ? options.description : "[arg] = optional, <arg> = required")
      .setFooter(options.footer ? (options.footer.text ? options.footer.text : this.client.user.username) : this.client.user.username, options.footer ? (options.footer.icon ? options.footer.icon : this.client.user.avatarURL) : this.client.user.avatarURL);

      let fields = [];
      new Map([...this._commands.entries()].sort()).forEach((command, name) => {
        if(command.options.showHelp === false) return;

        fields.push({
          name: `${this.prefix}${name}`,
          value: [
            command.options.description ? command.options.description : "No Description",
            command.options.usage       ? `**Usage:** ${command.options.usage.replace(/{cmd}/g, `${this.prefix}${name}`)}` : "No Usage",
            command.options.example     ? `**Example:** ${command.options.example.replace(/{cmd}/g, `${this.prefix}${name}`)}` : "No Example"
            ].join("\n")
        });
      });

      if(fields.length === 0){
        fields.push({
          name: "Whoops!",
          value: "No commands found!"
        });
      }

      embed.fields = fields;

      msg.channel.send(embed).then(m => m.channel.stopTyping()).catch(console.error);
    }, {
      showHelp: false
    });
  }
}

module.exports = function(client, prefix){
  client.commands = new CommandClient(client, prefix);
  return client;
};