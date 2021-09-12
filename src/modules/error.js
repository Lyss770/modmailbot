const Eris = require("eris");

module.exports = bot => {
    bot.registerCommand("error", () => {
        if (! (await utils.messageIsOnInboxServer(msg))) return;
        if (! utils.isStaff(msg.member)) return;
        throw new Error("Never gonna give you up, never gonna let you down, never gonna run around and desert you");
    })
}