import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }

  @Get('items')
  getItems() {
    return this.appService.getItems();
  }

  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.appService.getItem(Number(id));
  }

  @Post('items')
  createItem(@Body() body: any) {
    return this.appService.createItem(body);
  }

  @Put('items/:id')
  updateItem(@Param('id') id: string, @Body() body: any) {
    return this.appService.updateItem(Number(id), body);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.appService.deleteItem(Number(id));
  }

  @Get('heavy')
  getHeavy() {
    return this.appService.getHeavy();
  }

  @Get('delay/:ms')
  getDelayed(@Param('ms') ms: string) {
    const delay = Math.min(Number(ms), 10000);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ delayed: delay, timestamp: new Date() }), delay);
    });
  }
}
