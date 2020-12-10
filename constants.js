const os = require("os");
const path = require("path");

module.exports.PASS_DIR = path.resolve(os.homedir(), ".pass");

module.exports.SSH_PRIVATE = path.resolve(os.homedir(), ".ssh", "id_rsa");
module.exports.SSH_PUBLIC = path.resolve(os.homedir(), ".ssh", "id_rsa.pub");
module.exports.SSH_PUBLIC_PKCS8 = path.resolve(os.homedir(), ".ssh", "id_rsa.pub.pkcs8");