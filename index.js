var expat = require('node-expat');
var events = require('events');

function Parser (readStream, options) {
	var self = this;

	self.readStream = readStream;
	self.parser = new expat.Parser('UTF-8');
	self.emmiter = new events.EventEmitter();

	self.options = {
		trim: true,
		sanitize: false,
		coerce: true
	};
	for (var opt in options) {
		self.options[opt] = options[opt];
	}

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

		self.elemObj = null;
		self.elemName = null;

		self.parser.on('error', function (err) {
			self.emmiter.emit('error', err);
		});

		self.parser.on('startElement', function (name, attrs) {
			var isSelectedElem = (name === nodeName);

			if (isSelectedElem || self.elemObj) {
				if (isSelectedElem) {
					self.elemName = name;
				}

				if (self.options.coerce) {
					for (var key in attrs) {
						attrs[key] = self._coerce(attrs[key]);
					}
				}

				self.elemObj = {
					$name: name,
					$attrs: attrs,
					$parent: self.elemObj
				};
			}
		});

		self.parser.on('text', function (data) {
			if (!self.elemObj || !data) {
				return;
			}

			if (self.options.trim) {
				data = data.trim();
			}
			if (self.options.sanitize) {
				data = self._sanitize(data);
			}
			self.elemObj.$text = self._coerce(data);
		});

		self.parser.on('endElement', function (name) {
			if (!self.elemObj) {
				return;
			}

			if (self.elemName === name) {
				var result = self._transformObject(self.elemObj);
				eachNodeDelayed(result);
			}

			var parent = self.elemObj.$parent;
			if (parent) {
				delete self.elemObj.$parent;
				if (!parent.$children) {
					parent.$children = [];
				}
				parent.$children.push(self.elemObj);
			}

			self.elemObj = parent;
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

	setTransform: function (func) {
		this._transformObject = func;
	},

	_transformObject: function (obj) {
		var result = {};

		mapper(obj);
		obj.$children.forEach(mapper);

		function mapper (o) {
			if (o.$text) {
				result[o.$name] = o.$text;
			}
			for (var attr in o.$attrs) {
				result[o.$name+'-'+attr] = o.$attrs[attr];
			}
		}

		return result;
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

		var num = Number(value);
		if (!isNaN(value)) {
			return num;
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
