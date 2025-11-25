import Dexie, { Table } from 'dexie';
import { ARProject } from './types';

class WebARDatabase extends Dexie {
  projects!: Table<ARProject>;

  constructor() {
    super('WebARStudioDB');
  }
}

export const db = new WebARDatabase();

db.version(1).stores({
  projects: '++id, name, createdAt'
});