export default class Transaction {
  /**
   * @param {string} from
   * @param {string} to
   * @param {number} amount
   */
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  /**
   * @type {string}
   */
  from;
  /**
   * @type {string}
   */
  to;
  /**
   * @type {string}
   */
  amount;
}
