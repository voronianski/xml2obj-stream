var expat = require('node-expat');
var events = require('events');

function Parser (readStream, options) {
	var self = this;

	self.readStream = readStream;
	self.parser = new expat.Parser('UTF-8');
	self.emmiter = new events.EventEmitter();

	self.options = options || {};

	self.ancestors = [];
	self.elemObj = null;
	self.elemName = null;
	self.nodeName = null;

	readStream.on('data', function (data) {
		self.parser.parse(data.toString());
	});
	readStream.on('end', function () {
		process.nextTick(function () {
			self.emmiter.emit('end');
		});
	});
	readStream.on('error', function (err) {
		self.emmiter.emit('error', err);
	});
	readStream.on('close', function () {
		self.emmiter.emit('close');
	});
}

Parser.prototype = {
	each: function (nodeName, nodeFunc) {
		var self = this;

		self.parser.on('error', function (err) {
			self.emmiter.emit('error', err);
		});
		self.parser.on('startElement', function (name, attrs) {
			if (name === nodeName || self.elemObj) {
				self.elemObj = {};
				self.elemName = name;

				console.log('START', name, attrs);
				// if (name !== nodeName || !self.elemObj) {
				// 	return;
				// }

				if (self.options.coerce) {
					for (var key in attrs) {
						attrs[key] = self._coerce(attrs[key]);
					}
				}

				if (!(name in self.elemObj)) {
					if (self.options.arrayNotation) {
						self.elemObj[name] = [attrs];
					} else {
						self.elemObj[name] = attrs;
					}
				} else if (!Array.isArray(self.elemObj[name])) {
					var newArray = [self.elemObj[name]];
					newArray.push(attrs);
					self.elemObj[name] = newArray;
				} else {
					self.elemObj[name].push(attrs);
				}

				self.ancestors.push(self.elemObj);

				if (Array.isArray(self.elemObj[name])) {
					self.elemObj = self.elemObj[name][self.elemObj[name].length - 1];
				} else {
					self.elemObj = self.elemObj[name];
				}

				// console.log('---');
				// console.log(self.elemObj);
			}

		});

		self.parser.on('text', function (data) {
			if (!self.elemObj) {
				return;
			}
			console.log('TEXT', data);

			if (self.options.trim) {
				data = data.trim();
			}
			if (self.options.sanitize) {
				data = self._sanitize(data);
			}

			self.elemObj.$t = self._coerce((self.elemObj.$t || '') + data);
		});

		self.parser.on('endElement', function (name) {
			if (!self.elemObj) {
				return;
			}
			console.log('END', name);
			console.log(self.elemObj);

			if (self.elemName !== name) {
				delete self.elemObj.$t;
			}

			var ancestor = self.ancestors.pop();
			if (('$t' in self.elemObj) && (Object.keys(self.elemObj).length === 1)) {
				if (Array.isArray(ancestor[name])) {
					ancestor[name].push(ancestor[name].pop().$t);
				} else {
					ancestor[name] = self.elemObj.$t;
				}
			}

			self.elemObj = ancestor;

			if (nodeName === self.elemName) {
				eachNodeDelayed(self.elemObj);
			}
		});

		function eachNodeDelayed (node) {
			process.nextTick(function () {
				nodeFunc(node);
			});
		}
	},

	on: function (e, callback) {
		return this.emmiter.on(e, callback);
	},

	pause: function () {
		this.readStream.pause();
	},

	resume: function () {
		this.readStream.resume();
	},

	_chars: {
		'<': '&lt;',
		'>': '&gt;',
		'(': '&#40;',
		')': '&#41;',
		'#': '&#35;',
		'&': '&amp;',
		'"': '&quot;',
		'\'': '&apos;'
	},

	_sanitize: function (value) {
		if (typeof value !== 'string') {
			return value;
		}

		var self = this;
		Object.keys(self._chars).forEach(function (key) {
			value = value.replace(key, self._chars[key]);
		});

		return value;
	},

	_coerce: function (value) {
		if (!this.options.coerce || value.trim() === '') {
			return value;
		}

		value = Number(value);
		if (!isNaN(value)) {
			return value;
		}

		value = value.toLowerCase();
		if (value === 'true') {
			return true;
		}
		if (value === 'false') {
			return false;
		}

		return value;
	}
};

exports.Parser = Parser;
