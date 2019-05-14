import {PatternEmitter} from "../src/index";

const pe = new PatternEmitter();


pe.on("hi::2", (data) => {
    console.log(`1 ${data}`);
});

pe.on("hi::2", (data) => {
    console.log(`2 ${data}`);
});


pe.on(/^hi/, (data) => {
    console.log(`3 ${data}`);
});

pe.on("hi::2", (data) => {
    console.log(`4 ${data}`);
});

pe.on(/^h.*/, (data) => {
    console.log(`5 ${data}`);
});

console.log("listeners:::::", pe.listeners("hi::2"));
console.log("listenerCount:::", pe.listenerCount("hi::2"));

pe.emit("hi::2", "Vandam");