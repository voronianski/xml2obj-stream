# xml2obj-stream

> Interface to easily traverse through XML resources stream while mapping data to easy manageable JavaScript objects.

## Install

```bash
npm install xml2obj-stream --save
```

## Example

**resource.xml**

```xml
<root>
    <collection>
        <item>...</item>
        <item>...</item>
        <item>...</item>
        <item>...</item>
        <item>...</item>
    </collection>
</root>
```

**app.js**

```javascript
var xml2obj = require('xml2obj-stream');
var request = require('request');

var readStream = request('http://example.com/api/resource.xml');
var parseStream = new xml2obj.Parser(readStream, {coerce: true});

var results = [];
parseStream.each('item', function (item) {
    results.push(item);
});
```

## API

### `new xml2obj.Parser(readStream, [options])`

## References

- [node-expat](http://node-xmpp.github.io/doc/nodeexpat.html)
- [xml2json](https://github.com/buglabs/node-xml2json)
- [xml-object-stream](https://github.com/idottv/xml-object-stream)

## License

MIT Licensed

Copyright (c) 2014 Dmitri Voronianski [dmitri.voronianski@gmail.com](mailto:dmitri.voronianski@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.