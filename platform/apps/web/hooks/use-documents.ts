'use client';

import { useQuery } from '@tanstack/react-query';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'image' | 'folder';
  size?: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  description?: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
}

interface DocumentsFilters {
  folder?: string;
  search?: string;
  type?: string;
}

interface DocumentsResponse {
  folders: Folder[];
  documents: Document[];
}

async function fetchDocuments(
  filters?: DocumentsFilters
): Promise<DocumentsResponse> {
  const params = new URLSearchParams();

  if (filters?.folder) params.set('folder', filters.folder);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.type) params.set('type', filters.type);

  const response = await fetch(`/api/documents?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  const result = await response.json();
  return result.data;
}

export function useDocuments(filters?: DocumentsFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
  });
}

export type { Document, Folder, DocumentsFilters, DocumentsResponse };
