#!/usr/bin/env node

const {program} = require("commander");
const cli = require("./apis/cli");

program
  .name("pass")
  .version("1.0.0");

program
  .command("init")
  .description("init password storage")
  .action(cli.init);

program
  .command("generate")
  .option("-s, --site <site>", "site")
  .option("-u, --username <username>", "username or email")
  .option("-l, --length <length>", "password's length")
  .description("generate password to storage")
  .action((cmd) => {
    const {site, username, length} = cmd;

    if (!site || !username) return cmd.help();

    return cli.generate({
      site,
      username,
      length
    });
  });

program
  .command("show")
  .option("-s, --site <site>", "site")
  .option("-u, --username <username>", "username or email")
  .description("show password from storage")
  .action((cmd) => {
    const {site, username} = cmd;

    if (!site || !username) return cmd.help();

    return cli.show({
      site,
      username
    });
  });

program
  .command("add")
  .option("-s, --site <site>", "site")
  .option("-u, --username <username>", "username or email")
  .option("-p, --password <password>", "password")
  .description("add existing password to storage")
  .action((cmd) => {
    const {site, username, password} = cmd;

    if (!site || !username || !password) return cmd.help();

    return cli.add({
      site,
      username,
      password
    });
  });

program
  .command("rm")
  .option("-s, --site <site>", "site")
  .option("-u, --username <username>", "username or email")
  .description("remove password from storage")
  .action((cmd) => {
    const {site, username} = cmd;

    if (!site || !username) return cmd.help();

    return cli.rm({
      site,
      username
    });
  });

program
  .command("rename")
  .option("-s, --site <site>", "site")
  .option("-o, --old <username>", "old username or email")
  .option("-n, --new <username>", "new username or email")
  .description("rename password in storage")
  .action((cmd) => {
    const {site, old: oldUsername, new: newUsername} = cmd;

    if (!site || !oldUsername || !newUsername) return cmd.help();

    return cli.rename({
      site,
      oldUsername,
      newUsername
    });
  });

program
  .command("list")
  .description("list all passwords from storage")
  .action(cli.list);

program.parse();