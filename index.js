#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const util = require("util");
const cp = require("child_process");
const {program} = require("commander");
const generate = require("./utils/generate");

const PASS_DIR = path.resolve(os.homedir(), ".pass");

const SSH_PRIVATE = path.resolve(os.homedir(), ".ssh", "id_rsa");
const SSH_PUBLIC = path.resolve(os.homedir(), ".ssh", "id_rsa.pub");
const SSH_PUBLIC_PKCS8 = path.resolve(os.homedir(), ".ssh", "id_rsa.pub.pkcs8");

const GIT_AVAILABLE = fs.existsSync(path.resolve(DIR, ".git"));

const savePassword = async ({source, size, username, password}) => {
  let dir = path.resolve(DIR, username);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  dir = path.resolve(dir, source);

  if (fs.existsSync(dir)) {
    return console.error("Password is already exists.");
  }

  if (!password) {
    password = generate(size);

    console.log(`🔐 Password generated: ${password}`);
  } else {
    console.log("🔐 Password saved.");
  }

  cp.execSync(`
    echo '${password}' | openssl rsautl -encrypt -pubin -inkey ~/.ssh/id_rsa.pub.pkcs8 -out ${dir}
  `);

  if (GIT_AVAILABLE) {
    try {
      await cp.exec(`
          cd ${DIR} && git add ${dir} && git commit -m 'Added password for ${username}/${source}.' && git push origin master
        `);

      console.log("✍️  Successfully pushed password in Git.");
    } catch (e) {
      console.error("⛔️ Failed to push password in Git.");
    }
  }
};

cp.exec = util.promisify(cp.exec);

program.version("0.0.1");

program
  .command("init")
  .description("init password store")
  .action(() => {
    if (!fs.existsSync(SSH_PRIVATE) || !fs.existsSync(SSH_PUBLIC)) {
      return console.error("⛔️ Something wrong with your ssh keys. Check ~/.ssh on your computer.");
    }

    if (!fs.existsSync(SSH_PUBLIC_PKCS8)) {
      console.log("🔧 Generating ~/.ssh/id_rsa.pub.pkcs8 from your public key...");

      cp.execSync(`
        ssh-keygen -e -f ${SSH_PUBLIC} -m PKCS8 > ${SSH_PUBLIC_PKCS8}
      `);
    }

    if (fs.existsSync(DIR)) {
      return console.log("✅ Password manager is already initialized.");
    }

    fs.mkdirSync(DIR);

    console.log("✅ Password manager is successfully initialized.");
  });

program
  .command("generate <source>")
  .option("-u <username>", "username or email")
  .option("-s <size>", "size")
  .description("generate password")
  .action(async (source, cmd) => {
    const {u: username, s: size} = cmd;

    savePassword({
      username,
      size,
      source
    });
  });

program
  .command("show <source>")
  .option("-u <username>", "username or email")
  .description("show password")
  .action((source, cmd) => {
    const {u: username} = cmd;
    const dir = path.resolve(DIR, username, source);

    if (!fs.existsSync(dir)) {
      return console.error("Password is not exists.");
    }

    const password = cp.execSync(`
      openssl rsautl -decrypt -inkey ~/.ssh/id_rsa -in ${dir}
    `).toString().trim();

    console.log(`🔐 Your password: ${password}`);
  });

program
  .command("add <source>")
  .option("-u <username>", "username or email")
  .option("-p <password>", "password")
  .description("add password")
  .action((source, cmd) => {
    const {u: username, p: password} = cmd;

    savePassword({
      username,
      password,
      source
    });
  });

program
  .command("rm <source>")
  .option("-u <username", "username or email")
  .description("delete password")
  .action((source, cmd) => {
    const {u: username} = cmd;
    const dir = path.resolve(DIR, username, source);

    if (!fs.existsSync(dir)) {
      return console.error("Password is not exists.");
    }

    fs.unlinkSync(dir);
  });

program
  .command("list")
  .description("list accounts")
  .action(() => {
    const accounts = fs.readdirSync(DIR).filter(item => item !== ".git");

    const message = accounts.map((account) => {
      let string = account;
      let sources = fs.readdirSync(path.resolve(DIR, account));

      sources.forEach((source) => {
        string += `\n  — ${source}`;
      });

      return string;
    }).join("\n");

    console.log(message);
  });

program.parse();