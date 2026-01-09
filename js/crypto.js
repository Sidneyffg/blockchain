import { createHash, randomBytes } from "crypto";

export default class Crypto {
  static SHA256Buf(data) {
    return createHash("sha256").update(data).digest();
  }
  static SHA256Hex(data) {
    return createHash("sha256").update(data).digest("hex");
  }
  /*static RIPEMD160Buf(data) {
    return createHash("ripemd160").update(data).digest();
  }
  static hash160Buf(data) {
    return this.RIPEMD160Buf(this.SHA256Buf(data));
  }*/
  static randomBytes(bytes) {
    return randomBytes(bytes);
  }
}
