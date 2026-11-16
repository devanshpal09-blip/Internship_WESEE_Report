import type { Client } from 'pg';

export interface Migration {
  up(client: Client): Promise<void>;
  down(client: Client): Promise<void>;
}