import { IngestionService } from './ingestion.service';
export declare class IngestionController {
    private readonly ingestionService;
    constructor(ingestionService: IngestionService);
    uploadCsv(file: {
        buffer: Buffer;
    }): Promise<{
        totalRows: number;
        createdTasks: number;
        createdCourses: number;
        skippedDuplicates: number;
    }>;
}
