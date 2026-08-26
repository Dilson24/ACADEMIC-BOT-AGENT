import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { CoursesModule } from './courses/courses.module';
import { CommonModule } from './common/common.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [TasksModule, CoursesModule, CommonModule, IngestionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
