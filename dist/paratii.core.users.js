'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreUsers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');

/**
 * Utilities to create and manipulate information about the users on the blockchain.
 * @param {Object} config configuration object to initialize Paratii object
 * @class paratii.core.users
 */

var ParatiiCoreUsers = exports.ParatiiCoreUsers = function () {
  function ParatiiCoreUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreUsers);

    var schema = joi.object({
      'db.provider': joi.string().default(null)
    }).unknown();

    var result = joi.validate(config, schema);
    var error = result.error;
    if (error) throw error;
    this.config = result.value;
    this.paratii = this.config.paratii;
  }
  /**
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {Object}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example
   *            paratii.core.users.create({
   *              id: 'some-user-id',
   *              name: 'A user name',
   *              email: 'some@email.com',
   *              ...
   *             })
   * @memberof paratii.core.users
   */


  (0, _createClass3.default)(ParatiiCoreUsers, [{
    key: 'create',
    value: function create(options) {
      var keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              keysForBlockchain = ['id', 'name', 'email'];
              optionsKeys = (0, _keys2.default)(options);
              optionsBlockchain = {};
              optionsIpfs = {};

              optionsKeys.forEach(function (key) {
                if (keysForBlockchain.includes(key)) {
                  optionsBlockchain[key] = options[key];
                } else {
                  optionsIpfs[key] = options[key];
                }
              });
              _context.next = 7;
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON(optionsIpfs));

            case 7:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context.abrupt('return', this.paratii.eth.users.create(optionsBlockchain));

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * retrieve data about the user
     * @param  {String} id user univocal id
     * @return {Object}    data about the user
     * @example paratii.core.users.get('some-user-id')
     * @memberof paratii.core.users
    */

  }, {
    key: 'get',
    value: function get(id) {
      return this.paratii.db.users.get(id);
    }
    /**
     * Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.
     * @param  {String}  userId  user univocal id
     * @param  {Object}  options updated data i.e. { name: 'A new user name' }
     * @return {Promise}         updated data about the user
     * @example paratii.core.users.update('some-user-id', {name: 'A new user name'})
     * @memberof paratii.core.users
     */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var schema, result, error, data, key;
      return _regenerator2.default.async(function update$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                name: joi.string().default(null),
                email: joi.string().default(null)
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context2.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              _context2.next = 8;
              return _regenerator2.default.awrap(this.get(userId));

            case 8:
              data = _context2.sent;

              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              data['id'] = userId;

              _context2.next = 13;
              return _regenerator2.default.awrap(this.create(data));

            case 13:
              return _context2.abrupt('return', data);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCoreUsers;
}();