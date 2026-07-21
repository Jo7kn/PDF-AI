// lib/csv.ts
//
// Parser/serializzatore CSV minimale, senza dipendenze esterne. Condiviso tra
// Data AI (analisi) e File Converter (CSV <-> JSON) per evitare di duplicare
// la stessa logica di parsing in due moduli.

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      pushField()
    } else if (char === '\n') {
      pushRow()
    } else if (char === '\r') {
      // ignora, gestito da \n
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) pushRow()

  const nonEmptyRows = rows.filter((r) => !(r.length === 1 && r[0] === ''))
  const [headers, ...dataRows] = nonEmptyRows

  return { headers: headers || [], rows: dataRows }
}

export function csvRowsToObjects(parsed: ParsedCsv): Record<string, string>[] {
  return parsed.rows.map((row) => {
    const obj: Record<string, string> = {}
    parsed.headers.forEach((header, i) => {
      obj[header] = row[i] ?? ''
    })
    return obj
  })
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function objectsToCsv(objects: Record<string, unknown>[]): string {
  if (objects.length === 0) return ''
  const headers = Array.from(objects.reduce((set, obj) => {
    Object.keys(obj).forEach((k) => set.add(k))
    return set
  }, new Set<string>()))

  const lines = [headers.map(escapeCsvField).join(',')]
  for (const obj of objects) {
    lines.push(headers.map((h) => escapeCsvField(String(obj[h] ?? ''))).join(','))
  }
  return lines.join('\n')
}

export function isNumericColumn(parsed: ParsedCsv, columnIndex: number): boolean {
  const values = parsed.rows.map((r) => r[columnIndex]).filter((v) => v !== undefined && v !== '')
  if (values.length === 0) return false
  return values.every((v) => !Number.isNaN(Number(v)))
}
