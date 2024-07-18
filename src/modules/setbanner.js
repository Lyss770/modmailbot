const Eris = require("eris");
const superagent = require("superagent");
const utils = require("../utils/utils");
const config = require("../config");

const VALIDATE_IMG = /^http(?:s):\/\/([\w@:%.+~#=-]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-\w()@:%+.~#&/=]*)(?:\?([-\w()@:%+.~#&/=]*))?$/;

/**
 * @param {Eris.CommandClient} bot
 */
module.exports = bot => {
  bot.registerCommand("setbanner", async (msg, args) => {
    let url = args[0];
    if (! VALIDATE_IMG.test(url)) return utils.sendError(msg, "Invalid image URL");
    let response;
    try {
      response = await superagent.get(url).accept("image/*").responseType("arraybuffer");
    } catch (error) {
      if (error.response) { // Server responded with error
        return utils.sendError(msg, `Server responded with: ${error.status} ${error.message}\n${error.response.text || ""}`);
      } // Something happened with request
      return utils.sendError(msg, "Unable to send request: " + error.message);
    }
    const newbanner = `data:${response.headers["content-type"]};base64,${response.body.toString("base64")}`;
    superagent.patch("https://discord.com/api/users/@me")
      .set("Authorization", `Bot ${config.token}`)
      .set("Content-Type", "application/json")
      .send({
        "banner": newbanner
      })
      .then(
        () => utils.sendSuccess(msg, "Successfully changed banner"),
        (e) => utils.sendError(msg, "Unable to change banner: " + e)
      );
  }, {
    requirements: { // TODO Check if promisable void
      custom: (msg) => msg.member.roles.some((r) => ["203040224597508096", "523021576128692239", "851353808785244160"].includes(r))
    }
  });

  bot.registerCommandAlias("banner", "setbanner");
};
