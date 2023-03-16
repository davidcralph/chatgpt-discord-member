const { readdir } = require("fs").promises;
const { Client, Collection } = require("discord.js");
const Logger = require("leekslazylogger");

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [
    1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
  ],
  disableEveryone: true,
  autoReconnect: true,
});

client.log = new Logger();
client.config = require("./config.json");
["aliases", "commands"].forEach((x) => (client[x] = new Collection()));

const init = async () => {
  const events = await readdir("./events");
  events.forEach((file) => {
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
  });

  const categories = await readdir("./commands");
  for (const category of categories) {
    const commands = await readdir(`./commands/${category}`);
    for (const file of commands) {
      await client.commands.set(
        file.split(".")[0],
        require(`./commands/${category}/${file}`)
      );
    }
  }

  const { ChatGPTAPI } = await import("chatgpt");
  client.chatgpt = new ChatGPTAPI({
    apiKey: client.config.chatgpt,
  });

  // init chatgpt's persona
  client.chatgpt
    .sendMessage(
      `You are in an online chatroom on the platform called Discord. The chat works where there are multiple members (each is a real person online), and there are various channels with different topics. 
    I will give you the member's username and the channel name, and you will respond to them as if you were another member if you are asked or wherever you see fit. If you cannot or don't want to respond, then don't. 
    You will remember these conversations and things people say. If you feel the need to add anything onto the message you sent, you can do so by sending another response. You may look at the type of language and manner of 
    speaking members do, as well as the channel and member name, and adjust the way you respond accordingly. You do not need to say how you would respond, but just send the message. Remember: you are a member of this community.`
    )
    .then((res) => {
      client.gptres = res;
      console.log("ChatGPT is ready!");
    });
};

init().then((r) => r);

process.on("unhandledRejection", (err) => {
  client.log.error(err);
});

client.on("error", (err) => {
  client.log.error(err);
});

client.login(client.config.discord);
