export const IMPORT_LIMIT = 200;
export const IMPORT_FIELDS = ['name', 'phone', 'email', 'company', 'machineInterest', 'message'] as const;
export type ImportField = typeof IMPORT_FIELDS[number];
export type ImportLead = Record<ImportField, string>;

export function suggestImportField(header: string): ImportField | '' {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases: Record<ImportField, string[]> = {
    name: ['name', 'customername', 'fullname', 'contactname', 'leadname'],
    phone: ['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contactnumber', 'telephone'],
    email: ['email', 'emailaddress', 'emailid'],
    company: ['company', 'companyname', 'business', 'businessname'],
    machineInterest: ['machine', 'machineinterest', 'product', 'productinterest', 'requirement'],
    message: ['message', 'notes', 'description', 'remarks'],
  };
  return IMPORT_FIELDS.find(field => aliases[field].includes(normalized)) || '';
}

export function importContactKeys(lead: { email?: string | null; phone?: string | null }) {
  let phone = (lead.phone || '').replace(/\D/g, '');
  if (phone.length === 10) phone = `91${phone}`;
  return [lead.email?.trim() ? `email:${lead.email.trim().toLowerCase()}` : '', phone ? `phone:${phone}` : ''].filter(Boolean);
}

export function validateImportLead(lead: ImportLead): string {
  if (!lead.name.trim()) return 'Customer name is required.';
  if (!lead.phone.trim() && !lead.email.trim()) return 'Add a phone number or email.';
  if (lead.email && !/^[^\s@<>;,?&#]+@[^\s@<>;,?&#]+\.[^\s@<>;,?&#]+$/.test(lead.email)) return 'Invalid email address.';
  if (lead.phone && !/^\+?[\d\s().-]+$/.test(lead.phone)) return 'Invalid phone number; use digits and country code.';
  if (lead.phone && !/^\d{8,15}$/.test(lead.phone.replace(/\D/g, ''))) return 'Phone must contain 8–15 digits.';
  for (const field of IMPORT_FIELDS) if (lead[field].length > (field === 'message' ? 2000 : 200)) return `${field} is too long.`;
  return '';
}

/** Quoted commas, embedded newlines, BOM and Excel's CRLF are supported. */
export function parseImportCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index++;
      rows.push([...row, cell]); row = []; cell = '';
    } else cell += character;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field. Save it again from Excel.');
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}
