require('should');

var fs = require('fs');
var xml2obj = require('../');

var readStream, parserStream, results = [];

describe('xml2obj parser', function () {
	it('should be available', function () {
		xml2obj.should.be.ok;
	});

	describe('when parsing xml with default options', function () {
		before(function (done) {
			readStream = fs.createReadStream(__dirname + '/example.xml');
			parserStream = new xml2obj.Parser(readStream);

			parserStream.on('error', done);
			parserStream.on('end', done);

			parserStream.each('column', function (item) {
				results.push(item);
			});
		});

		it('should populate array of results', function () {
			results.should.be.an.Array.and.have.lengthOf(5);
		});

		it('should have nice items as objects', function () {
			results.forEach(function (result) {
				result.should.be.an.Object.and.have.keys('name', 'value', 'value-type');
			});
		});
	});
});
