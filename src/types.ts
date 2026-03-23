import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  type: 'local' | 'remote' | 'tts';
  duration?: number;
  createdAt: number;
}

export interface Schedule {
  id: string;
  time: string; // HH:mm
  audioId: string;
  label: string;
  days: number[]; // 0-6 (Sun-Sat)
  enabled: boolean;
  section: 'morning' | 'afternoon';
}

export interface Announcement {
  id: string;
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  createdAt: number;
}

export interface SystemSettings {
  volume: number;
  autoPlay: boolean;
  timezone: string;
  language: 'vi' | 'en';
  darkMode: boolean;
  pin: string;
}

export const VOICES = [
  { id: 'Kore', name: 'Nữ - Miền Bắc', gender: 'female', region: 'north' },
  { id: 'Puck', name: 'Nam - Miền Bắc', gender: 'male', region: 'north' },
  { id: 'Charon', name: 'Nữ - Miền Nam', gender: 'female', region: 'south' },
  { id: 'Fenrir', name: 'Nam - Miền Nam', gender: 'male', region: 'south' },
  { id: 'Zephyr', name: 'Nữ - Miền Trung', gender: 'female', region: 'central' },
];
