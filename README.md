# split-lowdb

A simple way to split lowdb into multiple files.

```
npm install split-lowdb
```

## Sync Usage

```js
import { SplitLowDBSync } from "split-lowdb";
const splitDB = new SplitLowDBSync({
  name: "lists", // Folder name
  // baseDir: "" - Defaults to process.cwd()
});
splitDB.name; // "lists"

splitDB.set("names", ["Aaren", "Aarika"]); // saves in lists/names.json
splitDB.get("names"); // ["Aaren", "Aarika"]
splitDB.size; // +1
splitDB.store; // {"names": ["Aaren", "Aarika"]}
splitDB.delete("names"); // Deletes lists/names.json file and removes it's key.
splitDB.clear(); // Deletes all json files and keys.
```

## Async Usage

```js
import { SplitLowDBAsync } from "split-lowdb";
const splitDB = new SplitLowDBAsync({
  name: "lists", // Folder name
  // baseDir: "" - Defaults to process.cwd()
});
splitDB.name; // "lists"

await splitDB.set("names", ["Aaren", "Aarika"]); // saves in lists/names.json
await splitDB.get("names"); // ["Aaren", "Aarika"]
splitDB.size; // +1
splitDB.store; // {"names": ["Aaren", "Aarika"]}
await splitDB.delete("names"); // Deletes lists/names.json file and removes it's key.
await splitDB.clear(); // Deletes all json files and keys.
```

## License

MIT
