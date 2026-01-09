import crypto from "crypto";

export default class Crypto {
  static SHA256(data) {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
  }
}
