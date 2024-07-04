const Eris = require("eris");
const threadUtils = require("../utils/threadUtils");
const { getSelfUrl, regEscape, sendError } = require("../utils/utils");

const DISCORD_REGEX = /(https:\/\/(canary\.|beta\.)?discord(app)?\.com\/channels\/\d{17,19}\/\d{17,19}\/)?\d{17,19}/g;
/**
 * @param {String} str
 */
const REPLACE_REGEX = (str) => new RegExp(regEscape(str), "g");
/**
 * @param {String} str
 */
const ATTACHMENT_REGEX = (str) => new RegExp(`${regEscape(str)}(?:(?! ).)*`, "g");
/**
 * @param {String} str
 */
const DISCORD_ATTACHMENT_REGEX = (str) => new RegExp(str, "g");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "img", async (msg, args, thread) => {
    if (! thread) return;
    const [selfURL, dmChannel] = await Promise.all([getSelfUrl("attachments"), thread.getDMChannel()]);
    if (! dmChannel) return;

    const discordURLsRegex = msg.content.match(DISCORD_REGEX);
    if (! args.length || ! discordURLsRegex) return sendError(msg, "Provide message or attachment URL(s)");
    const discordURLs = await Promise.all(msg.content.match(DISCORD_REGEX).map(async url => {
      const asArray = url.split("/");
      const messageID = asArray[asArray.length - 1];
      try {
        const { content } = await bot.getMessage(msg.channel.id, messageID);
        return [url, content];
      } catch (error) {
        return null;
      }
    }));
    discordURLs.filter((value, index, self) => value && self.findIndex(i => i[0] === value[0]) !== -1).forEach(s => {
      const [url, content] = s;
      msg.content = msg.content.replace(REPLACE_REGEX(url), content);
    });

    const attachments = msg.content.match(ATTACHMENT_REGEX(selfURL));
    if (! attachments || ! attachments.length) return sendError(msg, "Could not find an attachment");
    const urls = attachments.join("\n").replace(DISCORD_ATTACHMENT_REGEX(selfURL), `https://cdn.discordapp.com/attachments/${dmChannel.id}`);
    bot.createMessage(msg.channel.id, urls);
  });

  bot.registerCommandAlias("att", "img");
};
