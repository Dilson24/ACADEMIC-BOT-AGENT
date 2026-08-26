import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

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

@Injectable()
export class IngestionService {
  constructor(private prisma: PrismaService) {}

  async processCsv(fileBuffer: Buffer) {
    // 1. PARSER
    const rawRows = await this.parseCsv(fileBuffer);
    if (rawRows.length === 0) {
      throw new BadRequestException('El archivo CSV está vacío');
    }

    const results = {
      totalRows: rawRows.length,
      createdTasks: 0,
      createdCourses: 0,
      skippedDuplicates: 0,
    };

    for (const row of rawRows) {
      // 2. NORMALIZER
      const normalized = this.normalizeRow(row);

      // 3. VALIDATOR
      if (!this.isValid(normalized)) {
        console.warn('Fila descartada por título vacío. Objeto leído:', row);
        continue; // Descarta filas incompletas o sin título
      }

      // 4 & 5. MAPPER & DATABASE
      let courseId: number | null = null;

      if (normalized.courseTitle) {
        let course = await this.prisma.course.findFirst({
          where: { title: { equals: normalized.courseTitle, mode: 'insensitive' } },
        });

        if (!course) {
          // Busca el primer usuario o lo crea en automático si la tabla está vacía
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

      // Evitar duplicados: Tarea con mismo título en el mismo curso
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

      // Crear Tarea
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

  // --- FASE 1: PARSER ---
  private parseCsv(buffer: Buffer): Promise<RawCsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: RawCsvRow[] = [];
      const content = buffer.toString('utf-8');

      // Evaluamos SOLO la primera línea (los encabezados) para contar separadores
      const firstLine = content.split(/\r?\n/)[0] || '';
      const semicolons = (firstLine.match(/;/g) || []).length;
      const commas = (firstLine.match(/,/g) || []).length;
      const separator = semicolons > commas ? ';' : ',';

      const parseEngine = typeof csvParser === 'function' ? csvParser : (csvParser as any).default;
      const stream = Readable.from(buffer);

      stream
        .pipe(parseEngine({ separator }))
        .on('data', (data: RawCsvRow) => rows.push(data))
        .on('end', () => resolve(rows))
        .on('error', (error: Error) => reject(error));
    });
  }

  // --- FASE 2: NORMALIZER ---
  private normalizeRow(row: RawCsvRow): ProcessedTask {
    const keys = Object.keys(row);
    // Limpia caracteres invisibles BOM (\ufeff) y comillas residuales
    const cleanKey = (k: string) => k.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim();

    const titleKey =
      keys.find((k) =>
        /t[ií]tulo|title|tarea|nombre|item|task|actividad|asunto|descripci[oó]n|trabajo/i.test(
          cleanKey(k),
        ),
      ) || keys[0];
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

  private normalizeStatus(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('complet') || s.includes('hecho') || s === 'done') return 'COMPLETED';
    if (s.includes('progreso') || s.includes('proceso') || s === 'in_progress') return 'IN_PROGRESS';
    return 'PENDING';
  }

  private normalizePriority(priority: string): string {
    const p = priority.toLowerCase();
    if (p.includes('alt') || p === 'high' || p === '1') return 'HIGH';
    if (p.includes('med') || p === 'medium' || p === '2') return 'MEDIUM';
    if (p.includes('baj') || p === 'low' || p === '3') return 'LOW';
    return 'HIGH';
  }

  private normalizeDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  // --- FASE 3: VALIDATOR ---
  private isValid(task: ProcessedTask): boolean {
    return task.title.length > 0;
  }
}