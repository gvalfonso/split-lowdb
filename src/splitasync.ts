import fs from "fs/promises"; // Use async fs functions
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { StoreOptions } from "./types.js";

export class SplitLowDBAsync<
  T extends Record<string, any> = Record<string, any>
> {
  public baseDir: string;
  public dbs: Map<keyof T, Low<T[keyof T]>>;
  public store: Partial<T>;
  public name: string;
  private initialized: boolean = false;

  constructor(options: StoreOptions) {
    const { name, baseDir = process.cwd() } = options;
    this.name = name;
    this.baseDir = path.join(baseDir, name);
    this.dbs = new Map();
    this.store = {};
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }

    this.initialized = true;
    this.store = await this.getAll();
  }

  private async getDB(key: string): Promise<Low<T[keyof T]>> {
    if (!this.initialized) await this.initialize();

    if (!this.dbs.has(key)) {
      const filePath = path.join(this.baseDir, `${key}.json`);
      const adapter = new JSONFile<T[keyof T]>(filePath);
      const db = new Low<T[keyof T]>(adapter, {} as T[keyof T]);

      await db.read();
      db.data ||= {} as T[keyof T];
      this.dbs.set(key, db);
    }

    return this.dbs.get(key)!;
  }

  async get(key: string): Promise<T[keyof T]> {
    return (await this.getDB(key)).data;
  }

  async set(key: string, value: T[keyof T]): Promise<void> {
    const db = await this.getDB(key);
    db.data = value;
  }

  async write(key: string) {
    const db = await this.getDB(key);
    await db.write();
  }

  async delete(key: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    const filePath = path.join(this.baseDir, `${key}.json`);
    try {
      await fs.unlink(filePath);
      this.dbs.delete(key);
      delete this.store[key];
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err; // Ignore file-not-found errors
    }
  }

  async clear(): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      const files = await fs.readdir(this.baseDir);
      await Promise.all(
        files.map((file) => fs.unlink(path.join(this.baseDir, file)))
      );

      this.dbs.clear();
      this.store = {};
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  get size(): number {
    return Object.keys(this.store).length;
  }

  async getAll(): Promise<Partial<T>> {
    if (!this.initialized) await this.initialize();

    const data: Partial<T> = {};
    try {
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        const key = path.basename(file, ".json");
        data[key as keyof T] = await this.get(key);
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    return data;
  }
}
