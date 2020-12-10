const cp = require("child_process");
const {SSH_PRIVATE, SSH_PUBLIC_PKCS8} = require("../constants");

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
    return cp.execSync(`
      echo '${password}' | openssl rsautl -encrypt -pubin -inkey ${SSH_PUBLIC_PKCS8} -out ${filepath}
    `).toString();
  }

  static decrypt(filepath) {
    return cp.execSync(`
      openssl rsautl -decrypt -inkey ${SSH_PRIVATE} -in ${filepath}
    `).toString().trim();
  }
}

module.exports = Password;