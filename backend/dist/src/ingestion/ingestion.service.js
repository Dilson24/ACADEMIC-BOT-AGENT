"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
const csvParser = __importStar(require("csv-parser"));
const stream_1 = require("stream");
let IngestionService = class IngestionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCsv(fileBuffer) {
        const rawRows = await this.parseCsv(fileBuffer);
        if (rawRows.length === 0) {
            throw new common_1.BadRequestException('El archivo CSV está vacío');
        }
        const results = {
            totalRows: rawRows.length,
            createdTasks: 0,
            createdCourses: 0,
            skippedDuplicates: 0,
        };
        for (const row of rawRows) {
            const normalized = this.normalizeRow(row);
            if (!this.isValid(normalized)) {
                console.warn('Fila descartada por título vacío. Objeto leído:', row);
                continue;
            }
            let courseId = null;
            if (normalized.courseTitle) {
                let course = await this.prisma.course.findFirst({
                    where: { title: { equals: normalized.courseTitle, mode: 'insensitive' } },
                });
                if (!course) {
                    let firstUser = await this.prisma.user.findFirst();
                    if (!firstUser) {
                        firstUser = await this.prisma.user.create({
                            data: {
                                email: 'usuario@sistema.local',
                                name: 'Usuario Sistema',
                            },
                        });
                    }
                    course = await this.prisma.course.create({
                        data: {
                            title: normalized.courseTitle,
                            userId: firstUser.id,
                        },
                    });
                    results.createdCourses++;
                }
                courseId = course.id;
            }
            const existingTask = await this.prisma.task.findFirst({
                where: {
                    title: { equals: normalized.title, mode: 'insensitive' },
                    courseId: courseId ?? null,
                },
            });
            if (existingTask) {
                results.skippedDuplicates++;
                continue;
            }
            await this.prisma.task.create({
                data: {
                    title: normalized.title,
                    status: normalized.status,
                    priority: normalized.priority,
                    dueAt: normalized.dueAt,
                    courseId: courseId ?? null,
                },
            });
            results.createdTasks++;
        }
        return results;
    }
    parseCsv(buffer) {
        return new Promise((resolve, reject) => {
            const rows = [];
            const content = buffer.toString('utf-8');
            const firstLine = content.split(/\r?\n/)[0] || '';
            const semicolons = (firstLine.match(/;/g) || []).length;
            const commas = (firstLine.match(/,/g) || []).length;
            const separator = semicolons > commas ? ';' : ',';
            const parseEngine = typeof csvParser === 'function' ? csvParser : csvParser.default;
            const stream = stream_1.Readable.from(buffer);
            stream
                .pipe(parseEngine({ separator }))
                .on('data', (data) => rows.push(data))
                .on('end', () => resolve(rows))
                .on('error', (error) => reject(error));
        });
    }
    normalizeRow(row) {
        const keys = Object.keys(row);
        const cleanKey = (k) => k.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim();
        const titleKey = keys.find((k) => /t[ií]tulo|title|tarea|nombre|item|task|actividad|asunto|descripci[oó]n|trabajo/i.test(cleanKey(k))) || keys[0];
        const statusKey = keys.find((k) => /estado|status|state|estatus/i.test(cleanKey(k)));
        const priorityKey = keys.find((k) => /prioridad|priority/i.test(cleanKey(k)));
        const dueAtKey = keys.find((k) => /fecha|due|vencimiento|deadline/i.test(cleanKey(k)));
        const courseKey = keys.find((k) => /curso|course|materia|subject/i.test(cleanKey(k)));
        const rawTitle = titleKey ? row[titleKey]?.trim() : '';
        const rawStatus = statusKey ? row[statusKey]?.trim() : '';
        const rawPriority = priorityKey ? row[priorityKey]?.trim() : '';
        const rawDueAt = dueAtKey ? row[dueAtKey]?.trim() : '';
        const rawCourse = courseKey ? row[courseKey]?.trim() : '';
        return {
            title: rawTitle,
            status: this.normalizeStatus(rawStatus),
            priority: this.normalizePriority(rawPriority),
            dueAt: this.normalizeDate(rawDueAt),
            courseTitle: rawCourse || undefined,
        };
    }
    normalizeStatus(status) {
        const s = status.toLowerCase();
        if (s.includes('complet') || s.includes('hecho') || s === 'done')
            return 'COMPLETED';
        if (s.includes('progreso') || s.includes('proceso') || s === 'in_progress')
            return 'IN_PROGRESS';
        return 'PENDING';
    }
    normalizePriority(priority) {
        const p = priority.toLowerCase();
        if (p.includes('alt') || p === 'high' || p === '1')
            return 'HIGH';
        if (p.includes('med') || p === 'medium' || p === '2')
            return 'MEDIUM';
        if (p.includes('baj') || p === 'low' || p === '3')
            return 'LOW';
        return 'HIGH';
    }
    normalizeDate(dateStr) {
        if (!dateStr)
            return null;
        const parsedDate = new Date(dateStr);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    isValid(task) {
        return task.title.length > 0;
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map