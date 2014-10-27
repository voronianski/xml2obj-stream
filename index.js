var expat = require('node-expat');
var events = require('events');

function Parser (readStream, options) {
	var parser = new expat.Parser('UTF-8');

	readStream.on('data', function (data) {
		parser.parse(data.toString());
	});
	readStream.on('end', function () {

	});
}

Parser.prototype = {
	each: function (nodeName, nodeFunc) {
		var elemObj = {};
		var elemName;

		parser.on('error', function () {

		});
		parser.on('startElement', function (name, attrs) {
			elemName = name;
		});
		parser.on('text', function () {

		});
		parser.on('endElement', function () {
			eachNodeDelayed(elemObj);
		});

		function eachNodeDelayed (node) {
			process.nextTick(function () {
				nodeFunc(node);
			});
		}
	},

	_coerce: function (value) {
		if (!options.coerce || value.trim() === '') {
			return value;
		}

		value = Number(value);
		if (!isNaN(value)) {
			return value;
		}

		value = value.toLowerCase();
		if (value == 'true') {
			return true;
		}
		if (value == 'false') {
			return false;
		}

		return value;
	}
};

exports.Parser = Parser;
