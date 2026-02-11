export default class Logger {
  constructor(service) {
    this.service = service;
  }
  info(...data) {
    this.#logWithColor(data, this.reset);
  }
  warn(...data) {
    this.#logWithColor(data, this.yellow);
  }
  error(...data) {
    this.#logWithColor(data, this.red);
  }
  abortWithError(...data) {
    this.error(...data);
    console.log(`${this.red}Aborting...${this.reset}`);
    process.exit();
  }
  #logWithColor(data, color) {
    console.log(`[${this.service}] ${color}${data.join(" ")}${this.reset}`);
  }

  reset = "\x1b[0m";
  yellow = "\x1b[33m";
  red = "\x1b[31m";
  service;
}
