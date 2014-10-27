# xml2object-stream

## Install

## Usage

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
var xml2obj = require('xml2object-stream');
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