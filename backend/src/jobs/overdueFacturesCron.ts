import cron from "node-cron";
import Facture from "../models/factureModel.js";

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
  console.log(`[#CRON][Factures] Début job - today=${today.toISOString().slice(0,10)}`);

  try {
    const filter = {
      status: "En_attente",
      dateEcheance: { $lt: today },
    } as const;

    const countBefore = await Facture.countDocuments(filter);
    if (countBefore === 0) {
      console.log("[#CRON][Factures] Aucune facture à mettre En_retard.");
      return;
    }

    const updateResult = await Facture.updateMany(filter, {
      $set: { status: "En_retard", updatedAt: new Date() },
    });

    console.log(
      `[#CRON][Factures] Modifiées: ${updateResult.modifiedCount}/${countBefore} (matched=${updateResult.matchedCount ?? 'n/a'})`
    );
  } catch (err) {
    console.error("[#CRON][Factures][ERREUR]", err);
  } finally {
    console.log(`[#CRON][Factures] Fin job (${Date.now() - startedAt} ms)`);
  }
}

export function scheduleOverdueFacturesJob() {
  console.log("[#CRON] Planification job factures (0 0 * * *)");
  cron.schedule(
    "0 0 * * *",
    () => {
      void markOverdueFactures();
    },
    { timezone: "Europe/Paris" }
  );
}

// Optionnel: export manuel si besoin d'appeler depuis un endpoint admin
export const runOverdueFacturesNow = markOverdueFactures;
