import { openDB, DBSchema, IDBPDatabase } from 'idb';

import { Client } from '../client';
import { ClientKeyPaires, Web3MQDBValue } from '../types';

interface Web3MQDB extends DBSchema {
  chat_history: {
    key: string;
    value: Web3MQDBValue;
    indexes: { roomId: string };
  };
}

export class Storage {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  dbName: string;
  db: IDBPDatabase<Web3MQDB> | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.db = null;
    this.dbName = 'Web3MQ_table';
    this.createDB();
  }

  async createDB() {
    const db = await openDB<Web3MQDB>(this.dbName, 1, {
      upgrade(db) {
        const store = db.createObjectStore('chat_history');
        store.createIndex('roomId', 'from');
      },
    });

    this.db = db;
    console.log('indexDB init success');
  }

  async setData(key: string, data: Web3MQDBValue) {
    if (!this.db) {
      throw new Error('indexDB is not initialized');
    }
    await this.db.put('chat_history', data, key);
  }
}
