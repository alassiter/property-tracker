import Dexie, { Table } from 'dexie';

export interface PropertyRecord {
  id?: number;
  originalAddress: string;
  processedData: any; // Will store PubRec API response
  dateProcessed: Date;
  status: 'pending' | 'processed' | 'error';
  errorMessage?: string;
}

export class PropertyDatabase extends Dexie {
  properties!: Table<PropertyRecord>;

  constructor() {
    super('PropertyDatabase');
    this.version(1).stores({
      properties: '++id, originalAddress, dateProcessed, status'
    });
  }
}

export const db = new PropertyDatabase();