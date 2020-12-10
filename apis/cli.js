const fs = require("fs");
const cp = require("child_process");
const path = require("path");
const os = require("os");
const Password = require("./password");
const locales = require("../locales");
const {PASS_DIR, SSH_PRIVATE, SSH_PUBLIC, SSH_PUBLIC_PKCS8} = require("../constants");
const { passInitializedSuccesfully } = require("../locales");

class CLI {
  init() {
    const pass = fs.existsSync(PASS_DIR);

    if (pass) {
      return console.log(locales.passAlreadyInitialized);
    }

    const privateKey = fs.existsSync(SSH_PRIVATE);
    const publicKey = fs.existsSync(SSH_PUBLIC);

    if (!privateKey || !publicKey) {
      return console.error(locales.invalidSshKeys);
    }

    const publicPkcs8Key = fs.existsSync(SSH_PUBLIC_PKCS8);

    if (!publicPkcs8Key) {
      console.log(locales.generatingPkcs8Key);

      cp.execSync(`
        ssh-keygen -e -f ${SSH_PUBLIC} -m PKCS8 > ${SSH_PUBLIC_PKCS8}
      `);
    }

    fs.mkdirSync(PASS_DIR);

    console.log(locales.passInitializedSuccesfully);
  }

  add(options) {
    const {site, username, password} = options;

    const sitePath = path.resolve(PASS_DIR, site);
    const passwordPath = path.resolve(PASS_DIR, site, username);

    if (fs.existsSync(passwordPath)) {
      return console.error(locales.passwordAlreadyExists);
    }

    if (!fs.existsSync(sitePath)) {
      fs.mkdirSync(sitePath);
    }

    Password.encrypt(passwordPath, password);

    console.log(locales.passwordAdded);
  }

  rm(options) {
    const {site, username} = options;

    const sitePath = path.resolve(PASS_DIR, site);
    const passwordPath = path.resolve(PASS_DIR, site, username);

    if (!fs.existsSync(passwordPath)) {
      return console.error(locales.passwordNotExists);
    }

    fs.unlinkSync(passwordPath);

    if (!fs.readdirSync(sitePath).length) {
      fs.rmdirSync(sitePath);
    }

    console.log(locales.passwordRemoved);
  }

  rename(options) {
    const {site, oldUsername, newUsername} = options;

    const oldFilepath = path.resolve(PASS_DIR, site, oldUsername);
    const newFilepath = path.resolve(PASS_DIR, site, newUsername);

    if (!fs.existsSync(oldFilepath)) {
      return console.error(locales.passwordNotExists);
    }

    fs.renameSync(oldFilepath, newFilepath);

    console.log(locales.passwordRenamed);
  }

  generate(options) {
    const {site, username, length} = options;

    const sitePath = path.resolve(PASS_DIR, site);
    const passwordPath = path.resolve(PASS_DIR, site, username);

    if (fs.existsSync(passwordPath)) {
      return console.error(locales.passwordAlreadyExists);
    }

    const password = new Password(length);

    if (!fs.existsSync(sitePath)) {
      fs.mkdirSync(sitePath);
    }

    password.encrypt(passwordPath);
  
    console.log(`${locales.passwordGenerated} ${password.password}`);
  }

  show(options) {
    const {site, username} = options;

    const filepath = path.resolve(PASS_DIR, site, username);

    if (!fs.existsSync(filepath)) {
      return console.error(locales.passwordNotExists);
    }

    console.log(`${locales.passwordDisplayed} ${Password.decrypt(filepath)}`);
  }

  list() {
    const sites = fs.readdirSync(PASS_DIR);

    const passwords = sites
      .filter(item => item !== ".git" && item !== ".DS_Store")
      .map((site) => {
        const content = fs.readdirSync(path.resolve(PASS_DIR, site))
          .map(item => `\n  — ${item}`)
          .join("");

        return `${site}${content}`;
      });

    console.log(`\n${passwords.join("\n\n")}\n`);
  }
}

module.exports = new CLI();