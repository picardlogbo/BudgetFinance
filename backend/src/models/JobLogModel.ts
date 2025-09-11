import { Schema, model, Document } from 'mongoose';

// Journalisation des tâches planifiées (cron) pour dashboard admin.
export interface IJobLog extends Document {
  type: string;                // ex: 'factures-overdue', 'factures-reminder'
  startedAt: Date;
  durationMs: number;
  matched: number;             // éléments ciblés
  modified: number;            // éléments modifiés
  success: boolean;
  error?: string | null;
  createdAt: Date;
}

const JobLogSchema = new Schema<IJobLog>({
  type: { type: String, required: true, index: true },
  startedAt: { type: Date, required: true },
  durationMs: { type: Number, required: true },
  matched: { type: Number, required: true },
  modified: { type: Number, required: true },
  success: { type: Boolean, required: true },
  error: { type: String, default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });

JobLogSchema.index({ type: 1, startedAt: -1 });

const JobLog = model<IJobLog>('JobLog', JobLogSchema);
export default JobLog;