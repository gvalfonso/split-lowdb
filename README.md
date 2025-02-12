# split-lowdb

A simple way to split lowdb into multiple files.

```
npm install split-lowdb
```

## Usage

```js
import { SplitLowDB } from "split-lowdb";
const splitDB = new SplitLowDB({
  name: "lists", // Folder name
});
splitDB.name; // "lists"

splitDB.set("names", ["Aaren", "Aarika"]); // saves in lists/names.json
splitDB.get("names"); // ["Aaren", "Aarika"]
splitDB.size; // +1
splitDB.store; // {"names": ["Aaren", "Aarika"]}
splitDB.delete("names"); // Deletes lists/names.json file and removes it's key.
splitDB.clear(); // Deletes all json files and keys.
```

## License

MIT
