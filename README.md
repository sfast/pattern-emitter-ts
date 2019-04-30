### Overview

### API
Run the ```npm run doc``` command to generate a Typedoc under ```tsdoc``` folder.

### Test
Run the script ```npm run test```

### Type coverage

```
typewiz coverage tsconfig.json

// ** April 30 2019 check
// 347 of 357 types are known.
// Your type coverage is: 97.20%

```



### Examples
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