/** Never expose SMTP responses: they can contain addresses or credentials. */
export function classifyEmailFailure(error: unknown): { status: 'failed' | 'uncertain'; notice: string } {
  const failure = error as { code?: string; command?: string; responseCode?: number } | null;
  const code = failure?.code;
  if (code === 'EAUTH') return { status: 'failed', notice: 'Email login was rejected. Ask the administrator to update the SMTP username and password/app password, then try again.' };
  if (code === 'EENVELOPE') return { status: 'failed', notice: 'The email server rejected the sender or recipient. Check the customer email and the configured sender address.' };
  if (code === 'EDNS' || code === 'ETLS' || failure?.command === 'CONN') return { status: 'failed', notice: 'Could not connect securely to the email server. Ask the administrator to check the SMTP host, port and TLS settings.' };
  if (failure?.responseCode && failure.responseCode >= 400) return { status: 'failed', notice: 'The email server rejected this email. Ask the administrator to check the sender permissions and sending limits.' };
  return { status: 'uncertain', notice: 'The email server result is uncertain. Check your provider before sending again.' };
}
