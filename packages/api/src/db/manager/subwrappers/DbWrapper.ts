/**
 *  Parent class designed to provide common functions
 *  to DB wrappers. Not intended to be instantiated on its own.
 */

interface KnexRowCount {
  count: string;
}

export class DbWrapper {
  knex: any;
  tableName: string;

  constructor(knex: any, tableName: string) {
    this.knex = knex;
    this.tableName = tableName;
  }

  count() {
    return this.knex(this.tableName)
      .count("id")
      .then((rows: KnexRowCount[]) => {
        return parseInt(rows[0].count);
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  all(criteria: any) {
    if (!criteria) {
      return this.knex(this.tableName);
    } else {
      return this.knex(this.tableName).where(criteria);
    }
  }

  // can be overridden in individual wrapper that require
  // their own destruction logic, such as destroying a queue
  // that is internal to the wrapper
  async destroy() {
    return true;
  }

  /* TODO
  all(criteria) {
  }

  findOne(criteria) {
  }
  */
}
