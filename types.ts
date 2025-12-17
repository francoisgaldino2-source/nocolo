
export interface BabyProfile {
  name: string;
  birthDate: Date;
  gender: 'boy' | 'girl';
}

export enum LogType {
  FEEDING = 'Amamentação',
  DIAPER = 'Fralda',
  SLEEP = 'Sono',
  MOOD = 'Humor',
  MEDICINE = 'Remédio',
}

export interface LogEntry {
  id: string;
  type: LogType;
  timestamp: Date;
  endTime?: Date;
  details: string;
  value?: number;
}

export interface GrowthRecord {
  id: string;
  date: Date;
  weight: number;
  ageInMonths: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface CommunityMessage {
  id: string;
  authorName: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  avatarColor?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  category: string;
  link?: string;
}

export interface UserData {
  profile: BabyProfile | null;
  logs: LogEntry[];
  growthRecords: GrowthRecord[];
  messages: ChatMessage[];
  createdAt: string;
}

export enum View {
  WELCOME = 'WELCOME',
  ADMIN = 'ADMIN',
  DASHBOARD = 'DASHBOARD',
  DIARY = 'DIARY',
  GUIDE = 'GUIDE',
  GROWTH = 'GROWTH',
  RELAX = 'RELAX',
  CHAT = 'CHAT',
  NUTRITION = 'NUTRITION',
}
