 /* Check for environment variables */
void function(){
  let variables = ["BOT_TOKEN", "YOUTUBE_API_TOKEN"];
  let missing = [];
  variables.forEach(k=> {
    let v = process.env[k];
    if(v === undefined || v === null || v === ""){
      missing.push(k);
    }
  });
  if(missing.length > 0){
    throw new Error("Missing the following environment variable(s): "+missing.join(", "));
  }
}();

require("./web/WebServer");
require("./bot/Bot");