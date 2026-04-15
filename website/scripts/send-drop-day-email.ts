// Drop-day email script.
// Run manually on launch day after flipping LAUNCH_STATE to 'live' and deploying.
// Requires SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY in env.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const resend = new Resend(process.env.RESEND_API_KEY!);

const SUBJECT = 'Ronki ist da.';
const BODY = `Hallo,

Ronki ist ab heute verfügbar. Du kannst ihn direkt im Browser ausprobieren — keine App Store nötig:

https://ronki.de

Das war die einzige E-Mail, die du von uns bekommst. Danke, dass du gewartet hast.

— Marc
`;

async function main() {
  const { data: subscribers, error } = await supabase
    .from('waitlist')
    .select('id, email')
    .is('notified_at', null);

  if (error) throw error;
  if (!subscribers || subscribers.length === 0) {
    console.log('No subscribers to notify.');
    return;
  }

  console.log(`Sending to ${subscribers.length} subscribers...`);

  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from: 'Ronki <hallo@ronki.de>',
        to: sub.email,
        subject: SUBJECT,
        text: BODY,
      });
      await supabase
        .from('waitlist')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', sub.id);
      console.log(`Sent to ${sub.email}`);
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
