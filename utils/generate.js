const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const STRING = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "!@#$%^&*()/\"|:;№%:,.;"
].join("");

module.exports = (length = 16) => {
  return Array.from({length}, () => {
    return STRING[random(0, STRING.length - 1)];
  }).join("");
};