/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assertOptions} = require('assert-options');

const npm = {
    utils: require('../utils'),
    formatting: require('../formatting')
};

/**
 * @class helpers.TableName
 * @description
 *
 * **Alternative Syntax:** `TableName({table, [schema]})` &#8658; {@link helpers.TableName}
 *
 * Prepares and escapes a full table name that can be injected into queries directly.
 *
 * This is a read-only type that can be used wherever parameter `table` is supported.
 *
 * It supports $[Custom Type Formatting], which means you can use the type directly as a formatting
 * parameter, without specifying any escaping.
 *
 * @param {string|object} table
 * Table name details, depending on the type:
 *
 * - table name, if `table` is a string
 * - object `{table, [schema]}`
 *
 * @param {string} [schema]
 * Database schema name.
 *
 * When `table` is passed in as `{table, [schema]}`, this parameter is ignored.
 *
 * @property {string} name
 * Formatted/escaped full table name, based on properties `schema` + `table`.
 *
 * @property {string} table
 * Table name.
 *
 * @property {string} schema
 * Database schema name.
 *
 * It is `undefined` when no schema was specified (or if it was an empty string).
 *
 * @returns {helpers.TableName}
 *
 * @see
 * {@link helpers.TableName#toPostgres toPostgres}
 *
 * @example
 *
 * const table = new pgp.helpers.TableName('my-table', 'my-schema');
 * console.log(table);
 * //=> "my-schema"."my-table"
 *
 * // Formatting the type directly:
 * pgp.as.format('SELECT * FROM $1', table);
 * //=> SELECT * FROM "my-schema"."my-table"
 *
 */
function TableName(table, schema) {

    if (typeof table !== 'string') {
        table = assertOptions(table, ['table', 'schema']);
        schema = table.schema;
        table = table.table;
    }

    if (!npm.utils.isText(table)) {
        throw new TypeError('Table name must be a non-empty text string.');
    }

    if (!npm.utils.isNull(schema)) {
        if (typeof schema !== 'string') {
            throw new TypeError('Invalid schema name.');
        }
        if (schema.length > 0) {
            this.schema = schema;
        }
    }

    this.table = table;
    this.name = npm.formatting.as.name(table);

    if (this.schema) {
        this.name = npm.formatting.as.name(schema) + '.' + this.name;
    }

    this[npm.formatting.as.ctf.rawType] = true; // do not format the content when used as a formatting value
}

/**
 * @method helpers.TableName#toPostgres
 * @description
 * $[Custom Type Formatting], based on $[Symbolic CTF], i.e. the actual method is available only via {@link external:Symbol Symbol}:
 *
 * ```js
 * const ctf = pgp.as.ctf; // Custom Type Formatting symbols namespace
 * const fullName = tn[ctf.toPostgres]; // tn = an object of type TableName
 * ```
 *
 * This is a raw formatting type (`rawType = true`), i.e. when used as a query-formatting parameter, type `TableName`
 * injects full table name as raw text.
 *
 * @param {helpers.TableName} [self]
 * Optional self-reference, for ES6 arrow functions.
 *
 * @returns {string}
 * Escaped full table name that includes optional schema name, if specified.
 */
TableName.prototype[npm.formatting.as.ctf.toPostgres] = function (self) {
    self = this instanceof TableName && this || self;
    return self.name;
};

/**
 * @method helpers.TableName#toString
 * @description
 * Creates a well-formatted string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @returns {string}
 */
TableName.prototype.toString = function () {
    return this.name;
};

npm.utils.addInspection(TableName, function () {
    return this.toString();
});

module.exports = TableName;