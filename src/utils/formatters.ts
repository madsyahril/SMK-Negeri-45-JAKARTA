/**
 * Time and date formatters strictly honoring Asia/Jakarta (WIB) timezone.
 */

export function getCurrentJakartaDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Returns YYYY-MM-DD
}

export function getCurrentJakartaTime(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${formatter.format(now).replace(/\./g, ':')} WIB`;
}

export function formatDateIndonesian(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDateIndonesian(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTimeWIB(isoOrTimeStr?: string): string {
  if (!isoOrTimeStr) return '-';
  // If it's already "07:30" or "07:30:00"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(isoOrTimeStr)) {
    return `${isoOrTimeStr.substring(0, 5)} WIB`;
  }
  try {
    const date = new Date(isoOrTimeStr);
    if (isNaN(date.getTime())) return isoOrTimeStr;
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatter.format(date).replace(/\./g, ':')} WIB`;
  } catch {
    return isoOrTimeStr;
  }
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthNumber - 1] || '';
}
