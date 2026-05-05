import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private items: any[] = [];
  private counter = 0;

  getHello(): string {
    return 'API DDoS Test Lab - Running';
  }

  getStatus() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      requests: this.counter++,
    };
  }

  getItems() {
    return this.items;
  }

  getItem(id: number) {
    return this.items.find((item) => item.id === id);
  }

  createItem(data: any) {
    const item = { id: Date.now(), ...data, createdAt: new Date() };
    this.items.push(item);
    return item;
  }

  updateItem(id: number, data: any) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
    return null;
  }

  deleteItem(id: number) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }

  getHeavy() {
    // Simula procesamiento pesado para pruebas de carga
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i);
    }
    return { result, processed: true };
  }
}
