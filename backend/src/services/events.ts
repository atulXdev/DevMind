import { Response } from 'express';

interface SSEClient {
  id: string;
  response: Response;
}

let clients: SSEClient[] = [];

export const eventService = {
  addClient(id: string, response: Response) {
    clients.push({ id, response });
    console.log(`SSE: Client ${id} connected. Total clients: ${clients.length}`);
  },

  removeClient(id: string) {
    clients = clients.filter(c => c.id !== id);
    console.log(`SSE: Client ${id} disconnected. Total clients: ${clients.length}`);
  },

  broadcast(type: string, data: any) {
    console.log(`SSE: Broadcasting event of type "${type}" to ${clients.length} clients.`);
    const payload = JSON.stringify({ type, data });
    clients.forEach(client => {
      client.response.write(`data: ${payload}\n\n`);
    });
  },
};
