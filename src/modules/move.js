const Eris = require("eris");
const config = require("../config");
const threads = require("../data/threads");
const threadUtils = require("../utils/threadUtils");
const utils = require("../utils/utils");

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  threadUtils.addInboxServerCommand(bot, "move", async (msg, args, thread) => {
    if (! config.allowMove) return;
    if (! thread) return;

    const searchStr = args[0];
    if (! searchStr || searchStr.trim() === "") return;

    /**
     * @type {Eris.CategoryChannel[]}
     */
    const categories = bot.guilds.get(msg.guildID).channels.filter(c => {
      if (config.allowedCategories && config.allowedCategories.length) {
        if (config.allowedCategories.find(id => id === c.id)) {
          return true;
        }

        return false;
      }
      // Filter to categories that are not the thread's current parent category
      return (c instanceof Eris.CategoryChannel) && (c.id !== msg.channel.parentID);
    });

    if (categories.length === 0) return;

    /**
     * @type {Eris.CategoryChannel}
     */
    const targetCategory = categories.find(c =>
      c.id == searchStr ||
      c.name.toLowerCase() === searchStr.toLowerCase() ||
      c.name.toLowerCase().startsWith(searchStr.toLowerCase())
    );

    if (! targetCategory) {
      return utils.postError(thread, "No matching category found.");
    }

    try {
      if(targetCategory.id == config.communityThreadCategoryId) {
        //for specifically moving to the community category
        return threads.moveThread(thread, targetCategory, false);
      }
      if(targetCategory.id == config.supportThreadCategoryId) {
        //for specifically moving to the support category
        return threads.moveThread(thread, targetCategory, false);
      } else {
        threads.moveThread(thread, targetCategory, ! utils.isAdmin(msg.member));
      }
    } catch (err) {
      utils.handleError(err);
      return utils.postError(thread, "Something went wrong while trying to move this thread.");
    }
  });

  bot.registerCommandAlias("m", "move");
};
