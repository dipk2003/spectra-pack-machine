import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ProviderEvent } from './integration-types';

export const secureEqual = (a: string, b: string) => {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
};
export const verifyMetaSignature = (raw: string, signature: string, secret: string) =>
  Boolean(secret) && secureEqual(signature, `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`);

export async function readWebhookBody(req: Request) {
  const limit = 256000;
  if (Number(req.headers.get('content-length') || 0) > limit) throw new Error('BODY_TOO_LARGE');
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('BODY_TOO_LARGE'); }
      chunks.push(part.value);
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally { reader.releaseLock(); }
}

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const list = (value: unknown): Array<Record<string, unknown>> => Array.isArray(value) ? value.map(record) : [];
const phone = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : '';
};
const timestamp = (value: unknown) => {
  const date = new Date(Number(value) * 1000);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid event timestamp');
  return date.toISOString();
};

export function parseWhatsAppEvents(payload: unknown, phoneNumberId: string): ProviderEvent[] {
  const root = record(payload);
  if (root.object !== 'whatsapp_business_account') return [];
  const events: ProviderEvent[] = [];
  for (const entry of list(root.entry)) for (const change of list(entry.changes)) {
    const value = record(change.value);
    if (String(record(value.metadata).phone_number_id || '') !== phoneNumberId) continue;
    for (const message of list(value.messages)) {
      if (typeof message.id !== 'string' || !message.id || message.id.length > 200) continue;
      const type = String(message.type || 'unknown');
      const interactive = record(message.interactive);
      const content = type === 'text' ? record(message.text).body
        : type === 'button' ? record(message.button).text
        : type === 'interactive' ? record(interactive.button_reply).title || record(interactive.list_reply).title
        : `[${type} message: media remains in WhatsApp]`;
      events.push({ provider: 'whatsapp', event_key: `message:${message.id}`, external_id: message.id,
        phone: phone(message.from), direction: 'inbound', kind: 'message', status: 'received', body: String(content || '').slice(0, 4000),
        occurred_at: timestamp(message.timestamp), metadata: { message_type: type.slice(0, 40), phone_number_id: phoneNumberId },
      });
    }
    for (const status of list(value.statuses)) {
      if (typeof status.id !== 'string' || !status.id || status.id.length > 180 || typeof status.status !== 'string' || !['sent','delivered','read','failed','deleted'].includes(status.status)) continue;
      events.push({ provider: 'whatsapp', event_key: `status:${status.id}:${status.status}:${status.timestamp}`, external_id: status.id,
        phone: phone(status.recipient_id), direction: 'outbound', kind: 'delivery_status', status: status.status,
        body: `WhatsApp message ${status.status}.`, occurred_at: timestamp(status.timestamp), metadata: { phone_number_id: phoneNumberId },
      });
    }
  }
  return events;
}

export function parseTwilioEvent(params: Record<string, string>): ProviderEvent | null {
  if (!/^CA[a-f0-9]{32}$/i.test(params.CallSid || '')) return null;
  const direction = params.Direction?.startsWith('outbound') ? 'outbound' : params.Direction === 'inbound' ? 'inbound' : 'unknown';
  const kind = params.TranscriptionSid ? 'transcription' : params.RecordingSid ? 'recording_status' : 'call_status';
  const status = params.TranscriptionStatus || params.RecordingStatus || params.CallStatus || 'unknown';
  const external = params.TranscriptionSid || params.RecordingSid || params.CallSid;
  if (!/^[A-Z]{2}[a-f0-9]{32}$/i.test(external)) return null;
  const duration = Math.max(0, Math.min(86400, Number(params.CallDuration || params.RecordingDuration) || 0));
  const metadata: Record<string, string | number> = { call_sid: params.CallSid, duration_seconds: duration };
  if (/^RE[a-f0-9]{32}$/i.test(params.RecordingSid || '')) metadata.recording_sid = params.RecordingSid;
  return { provider: 'twilio', event_key: `${kind}:${external}:${status}:${params.SequenceNumber || ''}`.slice(0, 250), external_id: external,
    phone: direction === 'unknown' ? '' : phone(direction === 'outbound' ? params.To : params.From), direction, kind, status: status.slice(0, 60),
    body: kind === 'transcription' ? String(params.TranscriptionText || 'Transcription unavailable.').slice(0, 4000)
      : kind === 'recording_status' ? `Recording ${status}; audio is retained by the calling provider.`
      : `Call ${status}; duration ${duration} seconds.`,
    occurred_at: params.Timestamp && Number.isFinite(Date.parse(params.Timestamp)) ? new Date(params.Timestamp).toISOString() : new Date().toISOString(), metadata,
  };
}
