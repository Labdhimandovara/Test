import type { Profile } from '../types/profile';

/**
 * Robust CSV parser that handles:
 * - Commas within quoted fields ("Doe, John")
 * - Escaped double-quotes (""hello"")
 * - Windows CRLF and Unix LF line endings
 * - UTF-8 Byte Order Mark (BOM)
 */
export function parseCsv(csvText: string): Record<string, string>[] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip LF in CRLF
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Final field & row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const rawHeaders = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const record: Record<string, string> = {};
    rawHeaders.forEach((header, index) => {
      record[header] = row[index] !== undefined ? row[index].trim() : '';
    });
    return record;
  });
}

/**
 * Serializes an array of Profiles into CSV format with proper quote escaping.
 */
export function exportToCsv(profiles: Profile[]): string {
  const headers = [
    'id',
    'name',
    'linkedinUrl',
    'instagramHandle',
    'instagramUrl',
    'sourceUrl',
    'dataStatus',
    'participationStatus',
    'approvedPreferences',
    'approvedInterests',
    'createdAt',
    'notes',
  ];

  const escapeField = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.join(',');
  const rowLines = profiles.map(p => {
    return [
      escapeField(p.id),
      escapeField(p.name),
      escapeField(p.linkedinUrl),
      escapeField(p.instagramHandle),
      escapeField(p.instagramUrl),
      escapeField(p.sourceUrl || ''),
      escapeField(p.dataStatus),
      escapeField(p.participationStatus),
      escapeField(p.approvedPreferences ? JSON.stringify(p.approvedPreferences) : ''),
      escapeField(p.approvedInterests ? p.approvedInterests.join(';') : ''),
      escapeField(p.createdAt),
      escapeField(p.notes || ''),
    ].join(',');
  });

  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Returns a downloadable standard CSV template with supported column headers.
 */
export function getSampleCsvTemplate(): string {
  return [
    'name,linkedinUrl,instagramHandle,instagramUrl,sourceUrl,notes',
    '"Priya Sharma","https://www.linkedin.com/in/priya-sharma-sample/","priya_sharma","https://www.instagram.com/priya_sharma/","https://research.example.org/batch3","Research candidate batch 3"',
    '"Rohan Mehta","https://www.linkedin.com/in/rohan-mehta-sample/","rohan_m","","https://research.example.org/batch3","Handle provided, URL unverified"',
  ].join('\r\n');
}

/**
 * Returns a downloadable standard JSON example.
 */
export function getSampleJsonTemplate(): string {
  return JSON.stringify(
    [
      {
        name: "Priya Sharma",
        linkedinUrl: "https://www.linkedin.com/in/priya-sharma-sample/",
        instagramHandle: "priya_sharma",
        instagramUrl: "https://www.instagram.com/priya_sharma/",
        sourceUrl: "https://research.example.org/batch3",
        notes: "Research candidate batch 3",
      },
      {
        fullName: "Rohan Mehta",
        linkedin: "https://www.linkedin.com/in/rohan-mehta-sample/",
        instagramUsername: "rohan_m",
        source: "https://research.example.org/batch3",
        notes: "Handle provided; URL will be constructed and marked unverified",
      },
    ],
    null,
    2
  );
}
