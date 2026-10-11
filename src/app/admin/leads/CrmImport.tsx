'use client';

import { useMemo, useRef, useState } from 'react';
import { Upload, X, Download } from 'lucide-react';
import { IMPORT_FIELDS, IMPORT_LIMIT, parseImportCsv, suggestImportField, validateImportLead, type ImportField, type ImportLead } from '@/lib/crm-import';
import styles from './page.module.css';

const labels: Record<ImportField, string> = { name: 'Customer name', phone: 'Phone', email: 'Email', company: 'Company', machineInterest: 'Machine interest', message: 'Notes' };
const EMPTY_TABLE: string[][] = [];

export default function CrmImport({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [sheets, setSheets] = useState<{ name: string; rows: string[][] }[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<Record<ImportField, string>>({ name: '', phone: '', email: '', company: '', machineInterest: '', message: '' });
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const table = sheets[sheetIndex]?.rows || EMPTY_TABLE;
  const headers = table[0] || [];
  const rows = useMemo(() => table.slice(1).filter(row => row.some(cell => cell.trim())).map(row => Object.fromEntries(IMPORT_FIELDS.map(field => [field, mapping[field] === '' ? '' : (row[Number(mapping[field])] || '').trim()])) as ImportLead), [table, mapping]);
  const issues = rows.map((row, index) => ({ row: index + 2, error: validateImportLead(row) })).filter(item => item.error);
  const chooseSheet = (index: number, nextSheets = sheets) => {
    setSheetIndex(index);
    const header = nextSheets[index]?.rows[0] || [];
    setMapping(Object.fromEntries(IMPORT_FIELDS.map(field => [field, (() => { const index = header.findIndex(value => suggestImportField(value) === field); return index < 0 ? '' : String(index); })()])) as Record<ImportField, string>);
    setResult(''); setError('');
  };
  const readFile = async (file?: File) => {
    if (!file || lock.current) return;
    lock.current = true; setBusy(true); setError(''); setResult(''); setSheets([]);
    try {
      if (file.size > 5_000_000) throw new Error('Choose a file smaller than 5 MB.');
      let nextSheets: typeof sheets;
      if (/\.csv$/i.test(file.name)) nextSheets = [{ name: 'CSV', rows: parseImportCsv(await file.text()) }];
      else if (/\.xlsx$/i.test(file.name)) {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        nextSheets = workbook.worksheets.map(sheet => {
          if (sheet.rowCount > IMPORT_LIMIT + 1 || sheet.columnCount > 100) throw new Error(`Sheet "${sheet.name}" exceeds ${IMPORT_LIMIT} data rows or 100 columns. Split the file first.`);
          const rows: string[][] = [];
          sheet.eachRow({ includeEmpty: true }, row => {
            const cells: string[] = [];
            for (let column = 1; column <= sheet.columnCount; column++) {
              const cell = row.getCell(column);
              if (cell.type === ExcelJS.ValueType.Formula) throw new Error('Replace formulas with values before importing.');
              cells.push(cell.text);
            }
            rows.push(cells);
          });
          return { name: sheet.name, rows };
        });
      } else throw new Error('Choose an .xlsx or .csv file. Save older .xls files as .xlsx first.');
      if (!nextSheets.length || nextSheets.every(sheet => !sheet.rows.length)) throw new Error('The file is empty.');
      setSheets(nextSheets); chooseSheet(0, nextSheets);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not read this file.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const submit = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const response = await fetch('/api/crm/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Import failed.');
      setResult(`${data.imported} leads imported. ${data.skipped} duplicates skipped.`);
      setSheets([]); onImported();
    } catch (error) { setError(error instanceof Error ? error.message : 'Import result could not be received. Retry the same file safely.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const downloadTemplate = async () => {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Leads');
    sheet.addRow(['Name', 'Phone', 'Email', 'Company', 'Machine Interest', 'Notes']);
    sheet.columns.forEach(column => { column.width = 25; column.numFmt = '@'; });
    const url = URL.createObjectURL(new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const link = document.createElement('a'); link.href = url; link.download = 'crm-leads-template.xlsx'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <>
    <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}><Upload size={16} /> Import Excel</button>
    {open && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="import-title">
      <header className={styles.modalHeader}><div><h2 id="import-title">Import leads from Excel</h2><p>Upload .xlsx or .csv, match the columns, then import.</p></div><button className={styles.iconButton} disabled={busy} onClick={() => setOpen(false)} aria-label="Close import"><X size={20} /></button></header>
      <div className={styles.importBody}>
        <p>First row must contain headings. Maximum {IMPORT_LIMIT} leads and 5 MB per file. New leads are assigned to you; matching email addresses or phone numbers in your accessible leads are skipped.</p>
        <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => void downloadTemplate().catch(() => setError('Template download failed. Please try again.'))}><Download size={15} /> Download Excel template</button>
        <label>Choose file<input type="file" accept=".xlsx,.csv" disabled={busy} onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ''; }} /></label>
        {sheets.length > 1 && <label>Worksheet<select value={sheetIndex} disabled={busy} onChange={event => chooseSheet(Number(event.target.value))}>{sheets.map((sheet, index) => <option key={index} value={index}>{sheet.name}</option>)}</select></label>}
        {headers.length > 0 && <>
          <div className={styles.importMapping}>{IMPORT_FIELDS.map(field => <label key={field}>{labels[field]}{field === 'name' ? ' *' : ''}<select value={mapping[field]} disabled={busy} onChange={event => setMapping(current => ({ ...current, [field]: event.target.value }))}><option value="">Not included</option>{headers.map((header, index) => <option key={index} value={index}>{header || `Column ${index + 1}`}</option>)}</select></label>)}</div>
          <p>{rows.length} rows found. Preview of first 5:</p>
          <div className={styles.importPreview}><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th></tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={index}><td>{row.name}</td><td>{row.phone}</td><td>{row.email}</td></tr>)}</tbody></table></div>
          {issues.slice(0, 5).map(issue => <p className={styles.inlineWarning} key={issue.row}>Row {issue.row}: {issue.error}</p>)}
          {issues.length > 5 && <p>{issues.length - 5} more rows need correction.</p>}
          {rows.length > IMPORT_LIMIT && <p className={styles.inlineWarning}>Split this file into batches of {IMPORT_LIMIT} rows.</p>}
          <button className="btn btn-primary" disabled={busy || !rows.length || issues.length > 0 || rows.length > IMPORT_LIMIT} onClick={() => void submit()}>{busy ? 'Importing…' : `Import ${rows.length} leads`}</button>
        </>}
        {busy && !headers.length && <p role="status">Processing…</p>}
        {error && <p className={styles.inlineWarning} role="alert">{error}</p>}
        {result && <p className={styles.communicationNotice} role="status">{result}</p>}
      </div>
    </section></div>}
  </>;
}
