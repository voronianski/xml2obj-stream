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

        it('should have items as objects', function () {
            results.forEach(function (result) {
                result.should.be.an.Object.and.have.keys('name', 'value', 'value-type');
            });
        });
    });

    describe('when parsing xml with custom options', function () {
        var readStream, parserStream, results = [];

        before(function (done) {
            readStream = fs.createReadStream(__dirname + '/example.xml');
            parserStream = new xml2obj.Parser(readStream, {coerce: false});

            parserStream.on('error', done);
            parserStream.on('end', done);

            parserStream.each('column', function (item) {
                results.push(item);
            });
        });

        it('should populate array of results', function () {
            results.should.be.an.Array.and.have.lengthOf(5);
        });

        it('should have items as objects', function () {
            results.forEach(function (result) {
                result.should.be.an.Object.and.have.keys('name', 'value', 'value-type');
            });
        });

        it('should have not coerced properties in objects', function () {
            results[3].value.should.equal('true');
            results[4].value.should.equal('12345');
        });
    });

    describe('when parsing xml with custom transformation', function () {
        var readStream, parserStream, results = [];

        before(function (done) {
            readStream = fs.createReadStream(__dirname + '/example2.xml');
            parserStream = new xml2obj.Parser(readStream);

            parserStream.on('error', done);
            parserStream.on('end', done);

            parserStream.setTransformation(function (_proto) {
                var obj = {};

                mapper(_proto);
                function mapper (o) {
                    for (var attr in o.$attrs) {
                        obj[attr] = o.$attrs[attr];
                    }
                    if (Array.isArray(o.$children)) {
                        o.$children.forEach(mapper);
                    }
                }

                return obj;
            });

            parserStream.each('floor_action', function (item) {
                results.push(item);
            });
        });

        it('should populate array of results', function () {
            results.should.be.an.Array.and.have.lengthOf(1);
        });

        it('should have objects that follow transform rules', function () {
            results.forEach(function (result) {
                result.should.be.an.Object.and.have.keys('act-id', 'update-date-time', 'for-search');
            });
        });

    });
});
