// Service de notification (placeholder)
// Objectif: centraliser l'envoi d'emails / SMS / push.
// Implémentation future: intégrer un provider (SendGrid, Twilio, etc.)

export interface NotifiableTarget {
  // Peut être enrichi (email, phone, deviceToken, etc.)
  _id?: string;
  email?: string;
}

export async function sendNotification(target: NotifiableTarget | string, message: string) {
  // Pour l'instant simple console.log
  const id = typeof target === 'string' ? target : (target._id || target.email || 'unknown-user');
  console.log(`[NOTIFICATION] -> ${id}: ${message}`);
  return true;
}

export async function sendBatch(notifs: Array<{ target: NotifiableTarget | string; message: string }>) {
  for (const n of notifs) {
    // eslint-disable-next-line no-await-in-loop
    await sendNotification(n.target, n.message);
  }
  return notifs.length;
}