import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Gets the current ISO week number
 */
export function getCurrentWeekNumber(): number {
  const date = new Date();
  // Copy date so we don't modify original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Gets the Monday of the current week
 */
export function getCurrentWeekMonday(): Date {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const offsetToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so offset is 6
  const monday = new Date(date);
  monday.setDate(date.getDate() - offsetToMonday);
  return monday;
}

/**
 * Gets the Sunday of the current week
 */
export function getCurrentWeekSunday(): Date {
  const monday = getCurrentWeekMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Formats a date as MMdd (e.g., Nov17)
 */
export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(' ', '');
}

/**
 * Gets the current week folder name (e.g., Week_47_Nov17-Nov23)
 */
export function getCurrentWeekFolderName(): string {
  const weekNum = getCurrentWeekNumber();
  const monday = getCurrentWeekMonday();
  const sunday = getCurrentWeekSunday();
  const startLabel = formatDateLabel(monday);
  const endLabel = formatDateLabel(sunday);
  return `Week_${weekNum}_${startLabel}-${endLabel}`;
}

/**
 * Gets the current week folder path
 */
export function getCurrentWeekPath(basePath?: string): string {
  const base = basePath || process.env.TARGET_PATH || `${process.env.HOME}/Documents/Artifacts`;
  const year = new Date().getFullYear();
  const weekFolder = getCurrentWeekFolderName();
  return join(base, year.toString(), weekFolder);
}

/**
 * Gets available categories from the current week folder
 */
export async function getCurrentWeekCategories(basePath?: string): Promise<string[]> {
  const weekPath = getCurrentWeekPath(basePath);
  
  try {
    const entries = await fs.readdir(weekPath, { withFileTypes: true });
    const categories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.')) // Filter out hidden directories
      .sort();
    
    return categories;
  } catch (error) {
    // If week folder doesn't exist, return default categories
    console.warn(`Week folder not found: ${weekPath}. Using default categories.`);
    return [
      '1-Code',
      '2-Terminal', 
      '3-Performance',
      '4-Architecture',
      '5-AI_Agents',
      '6-Product',
      '7-Client_Work',
      '8-Random'
    ];
  }
}

/**
 * Ensures the current week folder exists with all category subdirectories
 */
export async function ensureCurrentWeekStructure(basePath?: string): Promise<string> {
  const weekPath = getCurrentWeekPath(basePath);
  const categories = await getCurrentWeekCategories(basePath);
  
  // Create week folder
  await fs.mkdir(weekPath, { recursive: true });
  
  // Create category subdirectories
  for (const category of categories) {
    const categoryPath = join(weekPath, category);
    await fs.mkdir(categoryPath, { recursive: true });
  }
  
  return weekPath;
}