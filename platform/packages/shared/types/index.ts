/**
 * WARIS Shared Types
 * Common TypeScript types used across the platform
 */

// DMA (District Metered Area) Types
export interface DMA {
  id: string;
  name: string;
  nameTh: string;
  region: string;
  branch: string;
  meterCount: number;
  pipeLength: number; // km
  createdAt: Date;
  updatedAt: Date;
}

// Water Loss Reading Types
export interface WaterLossReading {
  id: string;
  dmaId: string;
  readingTime: Date;
  systemInput: number; // m³
  authorizedConsumption: number; // m³
  waterLoss: number; // m³
  lossPercentage: number; // %
  nrwPercentage: number; // Non-Revenue Water %
}

// Alert Types
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  dmaId: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  messageTh: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

// Report Types
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  titleTh: string;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  filePath: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  messageTh: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

// Chat/Q&A Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  nameTh: string;
  role: 'admin' | 'operator' | 'viewer';
  branch: string;
  isActive: boolean;
  createdAt: Date;
}
