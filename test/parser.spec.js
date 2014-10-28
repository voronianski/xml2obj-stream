require('should');

var fs = require('fs');
var xml2obj = require('../');

describe('xml2obj parser', function () {
	it('should be available', function () {
		xml2obj.should.be.ok;
	});

	describe('when parsing xml with default options', function () {
		var readStream, parserStream, results = [];

		before(function (done) {
			readStream = fs.createReadStream(__dirname + '/example2.xml');
			parserStream = new xml2obj.Parser(readStream, {coerce: false});

			parserStream.on('error', done);
			parserStream.on('end', done);

			parserStream.each('floor_action', function (item) {
				console.dir('+++++++++++++');
				results.push(item);
			});
		});

		it('should populate array of results', function () {
			results.should.be.an.Array.and.have.lengthOf(0);
		});

		it('should have nice items as objects', function () {
			console.log(results);
			results.forEach(function (result) {
				console.log(result);
				result.should.be.an.Object.and.have.keys('name', 'value');
			});
		});
	});
});