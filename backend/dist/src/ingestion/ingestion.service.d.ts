import { PrismaService } from '../common/prisma.service';
export interface RawCsvRow {
    [key: string]: string;
}
export interface ProcessedTask {
    title: string;
    status: string;
    priority: string;
    dueAt: Date | null;
    courseTitle?: string;
}
export declare class IngestionService {
    private prisma;
    constructor(prisma: PrismaService);
    processCsv(fileBuffer: Buffer): Promise<{
        totalRows: number;
        createdTasks: number;
        createdCourses: number;
        skippedDuplicates: number;
    }>;
    private parseCsv;
    private normalizeRow;
    private normalizeStatus;
    private normalizePriority;
    private normalizeDate;
    private isValid;
}
