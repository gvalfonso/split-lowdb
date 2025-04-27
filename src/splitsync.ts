import fs from "fs";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import path from "path";
import { StoreOptions } from "./types.js";

export class SplitLowDBSync<
  T extends Record<string, any> = Record<string, any>
> {
  public baseDir: string;
  public dbs: Map<keyof T, LowSync<T[keyof T]>>;
  public store: Partial<T>;
  public name: string;

  constructor(options: StoreOptions) {
    const { name, baseDir = process.cwd() } = options;
    this.name = name;

    this.baseDir = path.join(baseDir, name);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    this.dbs = new Map();
    this.store = this.getAll();
  }

  private getDB(key: string): LowSync<T[keyof T]> {
    if (!this.dbs.has(key as keyof T)) {
      const filePath = path.join(this.baseDir, `${key}.json`);
      const adapter = new JSONFileSync<T[keyof T]>(filePath);
      const db = new LowSync<T[keyof T]>(adapter, {} as T[keyof T]);
      db.read();
      db.data ||= {} as T[keyof T];
      this.dbs.set(key as keyof T, db);
    }
    return this.dbs.get(key as keyof T)!;
  }

  get(key: string): T[keyof T] {
    return this.getDB(key as string).data;
  }

  set(key: string, value: T[keyof T]): void {
    const db = this.getDB(key as string);
    db.data = value;
  }

  write(key: string) {
    const db = this.getDB(key);
    db.write();
  }

  delete(key: string): void {
    const filePath = path.join(this.baseDir, `${String(key)}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.dbs.delete(key);
      delete this.store[key];
    }
  }

  clear(): void {
    fs.readdirSync(this.baseDir).forEach((file) => {
      fs.unlinkSync(path.join(this.baseDir, file));
    });
    this.dbs.clear();
    this.store = {} as Partial<T>;
  }

  get size(): number {
    return Object.keys(this.store).length;
  }

  getAll(): Partial<T> {
    const data: Partial<T> = {};
    fs.readdirSync(this.baseDir).forEach((file) => {
      const key: string = path.basename(file, ".json");
      data[key as keyof T] = this.get(key);
    });
    return data;
  }
}
