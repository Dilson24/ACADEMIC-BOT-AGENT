import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger'; // <-- 1. Importar ApiBody
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiBody({ schema: { type: 'object' } }) // <-- 2. Le decimos a Swagger que espere un JSON
  create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  @ApiBody({ schema: { type: 'object' } }) // <-- 3. Sirve también para el PATCH
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}