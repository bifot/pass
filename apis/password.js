const fs = require("fs");
const encryptor = require("simple-encryptor");
const {SSH_PRIVATE} = require("../constants");

const key = fs.readFileSync(SSH_PRIVATE, "utf8").trim();
const {encrypt, decrypt} = encryptor(key);

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const STRING = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "!@#$%^&*()/\"|:;№%:,.;"
].join("");

class Password {
  constructor(length = 16) {
    this.length = length;
  }

  get password() {
    if (!this._password) {
      this._password = Array.from({length: this.length}, () => {
        return STRING[random(0, STRING.length - 1)];
      }).join("");
    }

    return this._password;
  }

  encrypt(filepath, password = this.password) {
    return Password.encrypt(filepath, password);
  }

  static encrypt(filepath, password) {
    fs.writeFileSync(filepath, encrypt(password));
  }

  static decrypt(filepath) {
    return decrypt(fs.readFileSync(filepath, "utf8"));
  }
}

module.exports = Password;