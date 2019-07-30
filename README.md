
Event emitters with support for regular expressions. Inherits from Node's
EventEmitter. Written in TypeScript

  - [Installation](#Installation)
  - [Overview](#Overview)
  - [API](#API)
  - [Test](#Test)
  - [Example](#Example)
  - [Contributors](#Contributors)
  - [License](#License)

<a name="Installation"></a>

## Installation

You can install it with 

```bash
  npm i @sfast/pattern-emitter-ts
```

<a name="Overview"></a>

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
import { PatternEmitter } from "@sfast/pattern-emitter-ts";
```

<a name="API"></a>

## API
Run the ```npm run docs``` command to generate a Typedoc under ```docs``` folder.

<a name="Test"></a>


## Test
Run the tests with a simple ```npm run test```  or  simply ```npm t```. 
Currently test coverage is 98%

Type coverage

```
npm i typewiz -g
typewiz coverage tsconfig.json

// ** Jun 22 2019 
881 of 952 types are known.
Your type coverage is: 92.54%

```


<a name="Example"></a>


## Example

```typescript

import { PatternEmitter } from "@sfast/pattern-emitter-ts";

const pe = new PatternEmitter();

pe.on("hi::1", (data) => {
    console.log(`Hi::1 ${data}`);
});

pe.on("hi::2", (data) => {
    console.log(`Hi::2 ${data}`); // this will log
});


pe.on(/^hi/, (data) => {
    console.log(`Hi::(regexp) ${data}`);  // this will log
});


pe.emit("hi::2", "data"); 

```

<a name="Contributors"></a>

### Contributors
* [Artak Vardanyan](https://github.com/artakvg)
* [Armine Gevorgyan](https://github.com/mineyan)

## License
[MIT](https://github.com/sfast/patternemitter/blob/master/LICENSE)
