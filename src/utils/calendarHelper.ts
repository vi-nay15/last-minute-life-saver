import { ScheduleItem } from '../types';

/**
 * Helper utilities for parsing schedule time blocks and exporting to standard iCalendar (.ics) format
 */

export function parseTimeBlockToDateTimes(timeRangeStr: string): { start: Date; end: Date } {
  const today = new Date();
  
  // Default fallback is today, starting now, for 1 hour
  const defaultStart = new Date(today);
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 1);

  try {
    const parts = timeRangeStr.split('-');
    if (parts.length !== 2) {
      return { start: defaultStart, end: defaultEnd };
    }

    const parsePart = (timeStr: string): Date => {
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) {
        throw new Error(`Invalid format: ${timeStr}`);
      }

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }

      const d = new Date(today);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const start = parsePart(parts[0]);
    let end = parsePart(parts[1]);

    // Handle cross-midnight case (e.g., 11:00 PM - 01:00 AM)
    if (end.getTime() < start.getTime()) {
      end.setDate(end.getDate() + 1);
    }

    return { start, end };
  } catch (error) {
    console.warn("Failed to parse time range, using default fallback:", timeRangeStr, error);
    return { start: defaultStart, end: defaultEnd };
  }
}

/**
 * Formats a Date object to standard iCalendar UTC string: YYYYMMDDTHHMMSSZ
 */
function formatICSDate(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generates plain-text content of an .ics file from the list of schedule items
 */
export function generateICSContent(schedule: ScheduleItem[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Last-Minute Life Saver//Schedule Exporter//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const nowStr = formatICSDate(new Date());

  schedule.forEach((item) => {
    const { start, end } = parseTimeBlockToDateTimes(item.time);
    const startStr = formatICSDate(start);
    const endStr = formatICSDate(end);
    
    // Clean strings to be safe in ICS format (escape commas, semi-colons, backslashes, and replace newlines with \n)
    const cleanSummary = item.title
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
      
    const cleanDescription = `${item.description}\n\nCategory: ${item.type.toUpperCase()}\nPriority: ${item.priority.toUpperCase()}`
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:lmls-${item.id}-${startStr}@lastminutelifesaver.app`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${startStr}`);
    lines.push(`DTEND:${endStr}`);
    lines.push(`SUMMARY:${cleanSummary}`);
    lines.push(`DESCRIPTION:${cleanDescription}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Triggers a web browser download of the generated .ics file
 */
export function downloadICSFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
