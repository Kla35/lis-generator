# lol-lockfile-parser
A parser for lockfile files from League of Legends.

## Download
lol-lockfile-parser is installable via:

- [GitHub](https://github.com/Pupix/lol-lockfile-parser) `git clone https://github.com/Pupix/lol-lockfile-parser.git`
- [yarn](https://yarnpkg.com/): `yarn add lol-lockfile-parser`
- [npm](https://www.npmjs.com/): `npm install lol-lockfile-parser`

## Usage example

```js
var Parser = require('lol-lockfile-parser'),
    parser = new Parser();

    
    parser.read('lockfile').then(data => {
        console.log(data);
        //  {
        //    process: 'LeagueClient',
        //    PID: 6608,
        //    port: 18633,
        //    password: H9y4kOYVkmjWu_5mVIg1qQ,
        //    protocol: https
        //  }
    });

```

## Available methods

### parse(path)

It will roughly parse a lockfile file from the given path.

**Parameters**

1. **path {string|Buffer}** A path to where the file to parse resides.

### read(path)

It will read a lockfile file from the given path, casting all the data into the right variable type.

**Parameters**

1. **path {string|Buffer}** A path to where the file to read resides.

### extract(input, output)

It will extract a lockfile and extract the result on disk.

**Parameters**

1. **input {string|Buffer}** A path to where the file to read resides.
2. **output {string}** The path where the file should be stored.
