module.exports = async (client, msg) => {
  if (msg.author.bot || !msg.guild) {
    return;
  }

  client.gptres = await client.chatgpt.sendMessage(
    `A message has been sent by ${msg.author.username} in the channel ${msg.channel.name}. The message is as follows: ${msg.content}}`,
    {
      parentMessageId: client.gptres.id,
      onProgress: (progress) => {
        msg.channel.sendTyping();
      },
    }
  );

  msg.channel.send(client.gptres.text);
};
