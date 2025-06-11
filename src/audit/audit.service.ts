import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(logEntry: Partial<AuditLog>): Promise<void> {
    try {
      const newLog = this.auditRepo.create(logEntry);
      await this.auditRepo.save(newLog);
    } catch (error) {
      console.error('Failed to write to audit log:', error);
    }
  }
}
