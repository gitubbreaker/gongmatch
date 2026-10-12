export function parseSafeDate(dateVal) {
  if (!dateVal) return null;
  try {
    if (dateVal instanceof Date) {
      return isNaN(dateVal.getTime()) ? null : dateVal;
    }
    if (Array.isArray(dateVal)) {
      // Jackson LocalDateTime array: [year, month, day, hour, minute, second]
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
    }
    if (typeof dateVal === 'number') {
      return new Date(dateVal);
    }
    if (typeof dateVal === 'string') {
      if (dateVal.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateVal)) {
        return new Date(dateVal);
      }
      return new Date(dateVal);
    }
    return new Date(dateVal);
  } catch (e) {
    return null;
  }
}

export function formatSafeDate(dateVal, fallback = '') {
  const d = parseSafeDate(dateVal);
  return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : fallback;
}

export function formatSafeDateTime(dateVal, fallback = '') {
  const d = parseSafeDate(dateVal);
  return d && !isNaN(d.getTime()) ? d.toLocaleString() : fallback;
}

export function getSafeTime(dateVal, fallback = 0) {
  const d = parseSafeDate(dateVal);
  return d && !isNaN(d.getTime()) ? d.getTime() : fallback;
}
