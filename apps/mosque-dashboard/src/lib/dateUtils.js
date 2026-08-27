/**
 * Utility functions for date parsing and relative time formatting.
 * Provides safe date parsing and accurate Indonesian relative time strings for notifications.
 */

/**
 * Safely parse any date input (ISO string, SQL datetime string, Date object, timestamp number).
 * Handles cross-browser discrepancies (such as Safari parsing of SQL date strings).
 * 
 * @param {string|number|Date} input 
 * @returns {Date|null}
 */
export const parseSafeDate = (input) => {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Convert SQL datetime format "YYYY-MM-DD HH:mm:ss" to ISO "YYYY-MM-DDTHH:mm:ss"
    let normalized = trimmed;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
      normalized = trimmed.replace(' ', 'T');
    }

    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Fallback standard parse
    const fallback = new Date(trimmed);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  return null;
};

/**
 * Format notification timestamp into natural, accurate relative Indonesian time.
 * Prevents future estimation phrases (e.g. "dalam X menit/detik") caused by minor clock skews.
 * 
 * @param {string|number|Date} dateInput 
 * @param {Date} [now] Optional reference time (defaults to current time)
 * @returns {string} Formatted relative time string
 */
export const formatNotificationTime = (dateInput, now = new Date()) => {
  const date = parseSafeDate(dateInput);
  if (!date) return '-';

  const diffMs = now.getTime() - date.getTime();

  // If timestamp is slightly in the future (due to server-client clock drift) or within last 60 seconds
  if (diffMs < 60 * 1000) {
    return 'Baru saja';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than 1 hour: "X menit yang lalu"
  if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  }

  // Less than 24 hours: "X jam yang lalu"
  if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  }

  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace('.', ':');

  // Check if yesterday
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round((nowDate - itemDate) / (24 * 60 * 60 * 1000));

  if (dayDifference === 1) {
    return `Kemarin, ${timeStr}`;
  }

  // Within 7 days: "X hari yang lalu"
  if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  }

  // 7 days or older: Format as readable date (e.g. "27 Agu, 16:30" or "27 Agu 2025, 16:30")
  const sameYear = date.getFullYear() === now.getFullYear();
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[date.getMonth()];

  if (sameYear) {
    return `${day} ${month}, ${timeStr}`;
  }

  return `${day} ${month} ${date.getFullYear()}, ${timeStr}`;
};

/**
 * Format full date and time for tooltips / title attributes.
 * Example: "27 Agustus 2026, 16:38"
 * 
 * @param {string|number|Date} dateInput 
 * @returns {string}
 */
export const formatFullDateTime = (dateInput) => {
  const date = parseSafeDate(dateInput);
  if (!date) return '-';

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace('.', ':');
};
