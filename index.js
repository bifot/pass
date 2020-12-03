#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const {program} = require("commander");
const generate = require("./utils/generate");

const DIR = path.resolve(os.homedir(), ".pass");

program.version("0.0.1");

program
  .command("init")
  .description("init password store")
  .action(() => {
    if (fs.existsSync(DIR)) {
      return console.log("Password manager is already initialized.");
    }

    fs.mkdirSync(DIR);

    console.log("Password manager is successfully initialized.");
  });

program
  .command("generate")
  .option("-u <username>", "username or email")
  .option("-s <size>", "size")
  .description("generate password")
  .action((cmd) => {
    const {u: username} = cmd;
    const [source] = cmd.args;
    const password = generate();

    let dir = path.resolve(DIR, username);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    dir = path.resolve(dir, source);

    if (fs.existsSync(dir)) {
      return console.error("Password is already exists.");
    }

    cp.execSync(`
      echo '${password}' | openssl rsautl -encrypt -pubin -inkey ~/.ssh/id_rsa.pub.pkcs8 -out ${dir}
    `);

    console.log(password);
  });

program
  .command("show")
  .option("-u <username>", "username or email")
  .description("show password")
  .action((cmd) => {
    const {u: username} = cmd;
    const [source] = cmd.args;

    const dir = path.resolve(DIR, username, source);

    if (!fs.existsSync(dir)) {
      return console.error("Password is not exists.");
    }

    const password = cp.execSync(`
      openssl rsautl -decrypt -inkey ~/.ssh/id_rsa -in ${dir}
    `).toString().trim();

    console.log(password);
  });

program.parse();