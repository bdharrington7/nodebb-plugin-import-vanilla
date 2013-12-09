'use strict';

var utils = require('../../../public/src/utils.js'),
	_ = require('underscore'),
	async = require('async'),
	fs = require('fs-extra'),
	mysql = require('mysql'),
	path = require('path'),
	http = require('http'),
	argv = require('optimist').argv,
	storage = require('node-persist'),
	Logger = require('tiny-logger'),


	Import = function (config) {

		this.config = _.extend({}, {
				log: 'info,warn,error,debug',
				storageDir: path.join(__dirname,  '../storage'),
				// ubb mysql db access configs
				db: {
					host: "localhost",
					user: "ubb_user",
					password: "password",
					database: "ubb_test"
				},
				// ubb default, I think
				tablePrefix: 'ubbt_',

				// Limit ubb queries to certain time frames
				// DO NOT USE IN PRODUCTION
				// timestamp in SECONDS
				// this is potentially problematic,
				// since you can't migrate a topic or post that was created by a user who you wish not to migrate
				// I wouldn't use that, maybe for testing .. such as limiting your migration to pre 2004 or something to test it out quick, like I do
				timeMachine: {
					// using 'after' is very problematic, since dependencies may not exits, such as a parent topic to a post, a user to a topic, or even a category to a topic
					users: {
						after: null,
						before: null
					},
					categories: {
						after: null,
						before: null
					},
					topics: {
						after: null,
						before: null
					},
					posts: {
						after: null,
						before: null
					}
				}
			},
			config
		);

		this.init();
	};

Import.prototype = {

	init: function() {
		var _self = this;
		//init logger
		this.logger = Logger.init(this.config.log, '[import]');
		this.logger.debug('init()');

		// find storage dir
		this.config.storageDir = path.resolve(this.config.storageDir);
		if(!fs.existsSync(this.config.storageDir)) {
			fs.mkdirsSync(this.config.storageDir);
		} else if (!fs.lstatSync(this.config.storageDir).isDirectory()){
			return new Error(this.config.storageDir + ' is not a directory');
		}
		this.logger.info("Storage directory is: " + this.config.storageDir);
		storage.clear();

		// init storage module
		storage.initSync({dir: this.config.storageDir});
	},

	start: function() {
		var _self = this;
		this.logger.debug('start()');

		async.series([
			function(next){
				_self.setup(next);
			},
			function(next) {
				_self.logger.info('\n\nExporting Categories ...\n\n');
				_self.exportCategories(next);
			},
			function(next) {
				_self.logger.info('\n\nExporting Users ...\n\n');
				_self.exportUsers(next);
			},
			function(next) {
				_self.logger.info('\n\nExporting Topics ...\n\n');
				_self.exportTopics(next);
			},
			function(next) {
				_self.logger.info('\n\nExporting Posts ...\n\n');
				_self.exportPosts(next);
			},
			function(next) {
				_self.report(next);
			},
			function(){
				_self.exit();
			}
		]);
	},

	exportCategories: function (next) {
		var _self = this,
			prefix = this.config.tablePrefix,
			query = 'SELECT '
				+ prefix + 'FORUMS.FORUM_ID as _cid, '
				+ prefix + 'FORUMS.FORUM_TITLE as _name, '
				+ prefix + 'FORUMS.FORUM_DESCRIPTION as _description, '
				+ prefix + 'FORUMS.FORUM_CREATED_ON as _timestamp '
				+ 'FROM ' + prefix + 'FORUMS '
				+ 'WHERE 1 = 1 '
				+ (this.config.timeMachine.categories.before ?
				'AND ' + prefix + 'FORUMS.FORUM_CREATED_ON < ' + this.config.timeMachine.categories.before : ' ')
				+ (this.config.timeMachine.categories.after ?
				'AND ' + prefix + 'FORUMS.FORUM_CREATED_ON >= ' + this.config.timeMachine.categories.after : ' ');

		this.c.query(query,
			function(err, rows){
				if (err) throw err;
				_self.logger.info('Forums query came back with ' + rows.length + ' records, now preparing, please be patient.');
				_self.mem._cids = this._normalizeCategories(rows);
				next();
			});
	},

	_normalizeCategories: function (rows) {

	},

	exportUsers: function (next) {

	},

	_normalizeUsers: function (rows) {

	},

	exportTopics: function (next) {

	},

	_normalizeTopics: function (rows) {

	},

	exportPosts: function (next) {

	},

	_normalizePosts: function (rows) {

	},

	setup: function(next) {
		this.logger.debug('setup()');
		// temp memory
		this.mem = {
			_cids: [],
			_uids: [],
			_tids: [],
			_pids: []
		};

		if (!this.config.db) throw new Error('config.db needs to be set');

		// mysql connection to ubb database
		this.c = mysql.createConnection(this.config.db);
		this.c.connect();

		this.mem.startTime = +new Date();
		next();
	},

	report: function(next) {
		var logger = this.logger;

		logger.raw('\n\n====  REMEMBER:\n'
			+ '\n\t*-) Email all your users their new passwords, after the import'
			+ '\n\t*-) All the content is still in HTML');

		logger.raw('\n\nFind a gazillion file to use with nodebb-plugin-import (google it) ' + this.config.storageDir + '\n');
		logger.raw('These files have a pattern u.[_uid], c.[_cid], t.[_tid], p.[_pid], \'cat\' one of each to view the structure.\n');
		logger.info('DONE, Took ' + ((+new Date() - this.mem.startTime) / 1000 / 60).toFixed(2) + ' minutes.');
		next();
	},

	exit: function(code, msg){
		code = this._isNumber(code) ? code : 0;
		this.logger.info('Exiting ... code: ' + code + ( msg ? ' msg: ' + msg : '') );
		process.exit(code);
	},

	// which of the values is falsy
	_whichIsFalsy: function(arr){
		for (var i = 0; i < arr.length; i++) {
			if (!arr[i])
				return i;
		}
		return null;
	},

	_truncateStr : function (str, len) {
		if (typeof str != 'string') return str;
		len = this._isNumber(len) && len > 3 ? len : 20;
		return str.length <= len ? str : str.substr(0, len - 3) + '...';
	},

	_isNumber : function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
};

module.exports = Import;