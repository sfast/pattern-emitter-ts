### Overview

### API
Run the ```npm run doc``` command to generate a Typedoc under ```tsdoc``` folder.

### Test
Run the tests with a simple ```npm t``` .
Run in watch mode with ```npm t -- --watch```.
Run test for coverage with ```npm test:coverage```
Run test and check coverage with ```npm test:cover```

### Type coverage

```
typewiz coverage tsconfig.json

// ** April 30 2019 check
// 347 of 357 types are known.
// Your type coverage is: 97.20%

```



### Examplesnpm run test:coverage

```typescript

import { PatternEmitter } from "pattern-emitter-ts";

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


pe.emit("hi::2", "Vandam");


```

### Contribute

###License

Steadfast LLC 