import cron from "node-cron";
import Facture from "../models/factureModel.js";
import JobLog from '../models/JobLogModel.js';
import { sendNotification } from '../services/notificationService.js';

/**
 * Cron: Marque les factures en retard chaque jour à minuit (Europe/Paris)
 * - Ne touche pas aux factures déjà Payée ou En_retard
 * - Compare uniquement la date (pas l'heure)
 * - Logs détaillés pour suivi et diagnostic
 */

// Normalise une date à minuit local (évite les heures résiduelles)
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function markOverdueFactures() {
  const startedAt = Date.now();
  const today = startOfDay(new Date());
  console.log(`[#CRON][Factures][OVERDUE] Début job - today=${today.toISOString().slice(0,10)}`);

  let modified = 0;
  let matched = 0;
  let error: any = null;

  try {
    const filter = { status: 'En_attente', dateEcheance: { $lt: today } } as const;
    matched = await Facture.countDocuments(filter);
    if (matched === 0) {
      console.log('[#CRON][Factures][OVERDUE] Aucune facture à mettre En_retard.');
    } else {
      const updateResult = await Facture.updateMany(filter, {
        $set: { status: 'En_retard', updatedAt: new Date() },
        $push: { statusHistory: { to: 'En_retard', changedAt: new Date() } }
      });
      modified = updateResult.modifiedCount || 0;
      console.log(`[#CRON][Factures][OVERDUE] Modifiées: ${modified}/${matched}`);
      const overdue = await Facture.find({ status: 'En_retard', dateEcheance: { $lt: today } }).limit(modified);
      for (const f of overdue) {
        // eslint-disable-next-line no-await-in-loop
        await sendNotification(String(f.user), `Facture en retard: ${f.title}`);
      }
    }
  } catch (err) {
    error = err;
    console.error('[#CRON][Factures][OVERDUE][ERREUR]', err);
  } finally {
    const duration = Date.now() - startedAt;
    console.log(`[#CRON][Factures][OVERDUE] Fin job (${duration} ms)`);
  await JobLog.create({ type: 'factures-overdue', startedAt: new Date(startedAt), durationMs: duration, matched, modified, success: !error, error: error?.message });
  }
}

// Rappel J-1 : notifie les utilisateurs que la facture arrive à échéance demain
async function remindUpcomingFactures() {
  const startedAt = Date.now();
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log(`[#CRON][Factures][REMINDER] Début job J-1 (${tomorrow.toISOString().slice(0,10)})`);

  let count = 0; let error: any = null;
  try {
    const toRemind = await Facture.find({ status: 'En_attente', dateEcheance: { $eq: tomorrow } });
    count = toRemind.length;
    if (count === 0) {
      console.log('[#CRON][Factures][REMINDER] Aucune facture pour demain.');
    } else {
      for (const f of toRemind) {
        // eslint-disable-next-line no-await-in-loop
        await sendNotification(String(f.user), `Rappel: facture "${f.title}" due le ${f.dateEcheance.toLocaleDateString()}`);
      }
      console.log(`[#CRON][Factures][REMINDER] Rappels planifiés: ${count}`);
    }
  } catch (err) {
    error = err;
    console.error('[#CRON][Factures][REMINDER][ERREUR]', err);
  } finally {
    const duration = Date.now() - startedAt;
    console.log(`[#CRON][Factures][REMINDER] Fin job (${duration} ms)`);
  await JobLog.create({ type: 'factures-reminder', startedAt: new Date(startedAt), durationMs: duration, matched: count, modified: 0, success: !error, error: error?.message });
  }
}

// Planification des tâches cron
export function scheduleOverdueFacturesJob() {
  console.log('[#CRON] Planification jobs factures (0 0 * * *)');
  // Overdue @ 00:00
  cron.schedule('0 0 * * *', () => { void markOverdueFactures(); }, { timezone: 'Europe/Paris' });
  // Reminder J-1 @ 08:00 (exemple) → adapter selon besoin
  cron.schedule('0 8 * * *', () => { void remindUpcomingFactures(); }, { timezone: 'Europe/Paris' });
}

// Optionnel: export manuel si besoin d'appeler depuis un endpoint admin
export const runOverdueFacturesNow = markOverdueFactures;
export const runReminderFacturesNow = remindUpcomingFactures;
