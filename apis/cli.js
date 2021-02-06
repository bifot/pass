const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const {promisify} = require("util");
const {copy: _copy} = require("copy-paste");
const Git = require("./git");
const Password = require("./password");
const locales = require("../locales");
const {PASS_DIR} = require("../constants");

const copy = promisify(_copy);

class CLI {
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
    Git.save(`Added password ${site}/${username}.`);

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

    Git.save(`Removed password ${site}/${username}.`);

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

    Git.save(`Renamed password ${site}/${newUsername}.`);

    console.log(locales.passwordRenamed);
  }

  async generate(options) {
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

    Git.save(`Generated password ${site}/${username}.`);

    await copy(password.password);
  
    console.log(locales.passwordCopied);
  }

  async show(options) {
    const {site, username} = options;

    const filepath = path.resolve(PASS_DIR, site, username);

    if (!fs.existsSync(filepath)) {
      return console.error(locales.passwordNotExists);
    }

    await copy(Password.decrypt(filepath));

    console.log(locales.passwordCopied);
  }

  list() {
    const sites = fs.readdirSync(PASS_DIR);

    if (!sites.length) {
      return console.log(locales.storeIsEmpty);
    }

    const passwords = sites
      .filter(item => item !== ".git" && item !== ".gitignore" && item !== ".DS_Store")
      .map((site) => {
        const content = fs.readdirSync(path.resolve(PASS_DIR, site))
          .map(item => `\n  — ${item}`)
          .join("");

        return `${site}${content}`;
      });

    console.log(`\n${passwords.join("\n\n")}\n`);
  }

  git({url}) {
    if (!fs.existsSync(path.resolve(PASS_DIR, ".git"))) {
      cp.execSync(`cd ${PASS_DIR} && git init && git remote add origin ${url}`);
    }

    console.log(locales.gitRepositoryInitialized);
  }
}

module.exports = new CLI();
