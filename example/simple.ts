import {PatternEmitter} from "../src/index";

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