const fs = require("fs");
const cp = require("child_process");
const {PASS_DIR} = require("../constants");

class Git {
  static save(message) {
    cp.execSync(`
      cd ${PASS_DIR} &&
      git add . &&
      git commit -m '${message}' &&
      git push origin master
    `);
  }
}

module.exports = Git;