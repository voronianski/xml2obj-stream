# xml2obj-stream

[![build status](http://img.shields.io/travis/voronianski/xml2obj-stream.svg?style=flat)](https://travis-ci.org/voronianski/xml2obj-stream)
[![npm version](http://img.shields.io/npm/v/xml2obj-stream.svg?style=flat)](https://www.npmjs.org/package/xml2obj-stream)

> Interface to iterate through XML resources and map them into JavaScript objects (allows custom transformations).

## Install

```bash
npm install xml2obj-stream --save
```

## API

### `new xml2obj.Parser(readStream, [options])`

Create an instance of parser to read from any [`readStream`](http://nodejs.org/api/stream.html#stream_class_stream_readable).

### Options:

- `coerce` - make type coercion (e.g. numbers and booleans present in attributes and element values are converted from string to its correspondent data types), default `true`
- `trim` - remove leading and trailing whitespaces as well as line terminators in attributes and element values, default `true`
- `sanitize` - sanitizes the such characters as `<, >, (, ), #, &, ", '` present in element values, default `false`

### `each('element', iterator)`

Executes `iterator` function on every `'element'` inside XML resource. Iterator receives an element that is already tranformed into object.

**Default transformation produces an object that follows such rules:**

- each `<tag>` becomes **1 object** (including it's children, their attributes etc.), e.g. `<tag><child><id>12345</id><name>foo</name></child></tag>` turns to `{id: 12345, name: 'foo'}`
- element's attributes like `<tag foo="bar">text</tag>` become properties of the object prefixed with element's name - `{'tag': 'text', 'tag-foo': 'bar'}`

### `setTransformation(func)`

You're able to manage custom transform on the element if default one doesn't suit you. Provided `func` receives **proto** object as the only argument. It has the following structure, example:

```xml
<column>
    <name>dodo</name>
    <value type="string">bird</value>
</column>
```

Check proto object of the `<value>` tag:

```javascript
{
    $name: 'value', // name of the element
    $text: 'bird', // content of the element

    // hash-map of attributes if they are present
    $attrs: { 
        type: 'string' 
    },

    // parent element object
    $parent: {
        $name: 'column',

        // array of children objects if they are present
        $children: [{
            $name: 'name',
            $text: 'dodo'
        }, {
            $name: 'value',
            $text: 'bird',
            $attrs: { 
                type: 'string' 
            }
        }]
    }
}
```

It's required for transform function to return some value. It will be used as an argument for [each](https://github.com/voronianski/xml2obj-stream#eachelement-iterator) iterator function.

### `on('event', callback)`

Bind `callback` function to one of the following read stream events - `'error', 'end', 'close'`.

### `pause()`

Pause the read stream.

### `resume()`

Resume the read stream.

## Examples

### Default

**resource.xml**

```xml
<doc>
    <column><name>dodo</name><value type="string">bird</value></column>
    <column><name>mighty</name><value type="string">boosh</value></column>
    <column><name>crack</name><value type="string">fox</value></column>
    <column><name>foo</name><value type="boolean">true</value></column>
    <column><name>uid</name><value type="number">12345</value></column>
</doc>
```

**app.js**

```javascript
var xml2obj = require('xml2obj-stream');
var fs = require('fs');

var readStream = fs.createReadStream('resource.xml');
var parseStream = new xml2obj.Parser(readStream);

var results = [];
parseStream.each('column', function (item) {
    // do something with item
    results.push(item);
});

parseStream.on('end', function () {
    console.dir(results);
    // outputs ->
    // [ 
    //   { name: 'dodo', value: 'bird', 'value-type': 'string' },
    //   { name: 'mighty', value: 'boosh', 'value-type': 'string' },
    //   { name: 'crack', value: 'fox', 'value-type': 'string' },
    //   { name: 'foo', value: true, 'value-type': 'boolean' },
    //   { name: 'uid', value: 12345, 'value-type': 'number' } 
    // ]
});
```

### Custom transformation

**resource.xml**

```xml
<actions>
    <floor_action act-id="H38310" update-date-time="20130628T11:24">
        <action_time for-search="20130628T11:22:19">11:22:19 A.M. -</action_time>
        <action_item>H.R. 2231</action_item>
        <action_description>Motion to reconsider laid on the table Agreed to without objection.</action_description>
    </floor_action>
</actions>
```

**app.js**

```javascript
var xml2obj = require('xml2obj-stream');
var request = require('request');

var readStream = request('http://example.com/api/resource.xml');
var parseStream = new xml2obj.Parser(readStream);

var results = [];
parseStream.setTransformation(function (_proto) {
    // map `_proto` to your needs here
    // e.g. take only attributes of every tag
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
parseStream.each('floor_action', function (item) {
    results.push(item);
});

parseStream.on('end', function () {
    console.dir(results);
    // outputs ->
    // [{ 
    //  'act-id': 'H38310',
    //  'update-date-time': '20130628T11:24',
    //  'for-search': '20130628T11:22:19' 
    // }]
});
```

## Issues

If you're on Windows and have problems with instalation please check this troubleshoot links of [`node-expat`](http://node-xmpp.github.io/doc/nodeexpat.html):

- dependencies for node-gyp https://github.com/TooTallNate/node-gyp#installation

- see https://github.com/node-xmpp/node-expat/issues/78 if you are getting errors about not finding `nan.h`.

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
