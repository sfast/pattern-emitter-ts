pattern-emitter
===============


Event emitters with support for regular expressions. Inherits from Node's
EventEmitter. Written in TypeScript

* [Installation](#installation)
* [Overview](#overview)
* [API](#api)
* [Test](#test)
* [Example](#example)
* [Contributing](#contributing)
* [Have a question?](#askmongoManager)
* [License](#license)


## Installation

You can install it with 

```bash
    npm i @sfast/patternemitter

```

## Overview

The PatternEmitter class both extends and is backwards compatible with
EventEmitter when dealing with string event types. However, when registering
a listener to a RegExp, it has the added benefit of listening to all events
matching the expression, rather than that particular object. In addition, it
exposes a new set of methods on top of the existing API for requesting details
on those patterns and their listeners. As a result, getting started with this
library is as simple as replacing instances of:

``` javascript
import { EventEmitter } from "events"
```

with:

``` javascript
import { PatternEmitter } from "@sfast/pattern-emitter";
```

## API
Run the ```npm run docs``` command to generate a Typedoc under ```docs``` folder.

## Test
Run the tests with a simple ```npm run test```  or  simply ```npm t```.

### Type coverage

```
typewiz coverage tsconfig.json

// ** April 30 2019 check
// 347 of 357 types are known.
// Your type coverage is: 97.20%

```



## Example

```typescript

import { PatternEmitter } from ""@sfast/pattern-emitter"";

const pe = new PatternEmitter();


pe.on("hi::1", (data) => {
    console.log(`Hi::1 ${data}`);
});

pe.on("hi::2", (data) => {
    console.log(`Hi::2 ${data}`);
});


pe.on(/^hi/, (data) => {
    console.log(`Hi::(regexp) ${data}`);
});


pe.emit("hi::2", "data");


```



## Still have a question ?
We'll be happy to answer your questions. Try to reach out us on mongoManager gitter chat [<img src="https://img.shields.io/gitter/room/nwjs/nw.js.svg">](https://gitter.im/npm-patternemitter/Lobby) <br/>



## Contributing
Contributions are always welcome! <br/>
Please read the [contribution guidelines](https://github.com/sfast/patternemitter/blob/master/CONTRIBUTING.md) first.


### Contributors
* [Artak Vardanyan](https://github.com/artakvg)

## License
[MIT](https://github.com/sfast/patternemitter/blob/master/LICENSE)
