/** Display / parse purchase dates as DD.MM.YYYY (day.month.year). */

export function formatPurchaseDateDdMmYyyy(ms: number): string {
  const dt = new Date(ms);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function parsePurchaseDateInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dotted) {
    const d = Number(dotted[1]);
    const mo = Number(dotted[2]) - 1;
    const y = Number(dotted[3]);
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
      return null;
    }
    dt.setHours(12, 0, 0, 0);
    return dt.getTime();
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]) - 1;
    const d = Number(iso[3]);
    const dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
      return null;
    }
    dt.setHours(12, 0, 0, 0);
    return dt.getTime();
  }

  return null;
}
