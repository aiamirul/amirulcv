/**
 * Utility to parse and sort resume dates (e.g., employment, education spans)
 */

export const parseTimelineDate = (dateStr: string | undefined | null): number => {
  if (!dateStr) return 0;
  const normalized = dateStr.trim().toLowerCase();
  
  // Handle ongoing dates
  if (
    normalized === 'present' || 
    normalized === 'current' || 
    normalized === 'ongoing' || 
    normalized === 'now' || 
    normalized === 'active' ||
    normalized === ''
  ) {
    return Infinity; // Ongoing sits at the top
  }
  
  // Try standard JS Date parsing (handles ISO "2024-06", full date formats etc.)
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  // Custom fallback: search for a 4-digit year (e.g., "2024")
  const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    // Determine month if mentioned
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let monthIdx = 11; // Default to end of year
    for (let i = 0; i < months.length; i++) {
      if (normalized.includes(months[i])) {
        monthIdx = i;
        break;
      }
    }
    return new Date(year, monthIdx, 28).getTime();
  }
  
  return Date.now(); // fallback to current instant
};

/**
 * Sorts an array of items containing startDate and endDate in descending order (newest first).
 */
export function sortTimelineItems<T extends { startDate?: string; endDate?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const endDiff = parseTimelineDate(b.endDate) - parseTimelineDate(a.endDate);
    if (endDiff !== 0) return endDiff;
    
    // Fallback to start date comparison if end dates are the same
    return parseTimelineDate(b.startDate) - parseTimelineDate(a.startDate);
  });
}
