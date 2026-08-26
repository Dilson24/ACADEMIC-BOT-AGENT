import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: Date | null;
        userId: number | null;
        courseId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: Date | null;
        userId: number | null;
        courseId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(body: any): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: Date | null;
        userId: number | null;
        courseId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, body: any): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: Date | null;
        userId: number | null;
        courseId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: number;
        title: string;
        status: string;
        priority: string;
        dueAt: Date | null;
        userId: number | null;
        courseId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
