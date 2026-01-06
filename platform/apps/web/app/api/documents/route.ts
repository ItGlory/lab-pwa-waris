import { NextRequest, NextResponse } from 'next/server';
import documentsData from '@/lib/mock-data/documents.json';

interface Document {
  id: string;
  name: string;
  type: string;
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

const { folders, documents } = documentsData as {
  folders: Folder[];
  documents: Document[];
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');
  const search = searchParams.get('search');
  const type = searchParams.get('type');

  let filteredDocuments = [...documents];

  // Filter by folder
  if (folder && folder !== 'all') {
    filteredDocuments = filteredDocuments.filter((d) => d.folder === folder);
  }

  // Filter by type
  if (type && type !== 'all') {
    filteredDocuments = filteredDocuments.filter((d) => d.type === type);
  }

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredDocuments = filteredDocuments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.author.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by updatedAt descending
  filteredDocuments.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return NextResponse.json({
    success: true,
    data: {
      folders,
      documents: filteredDocuments,
    },
    message: 'Success',
    message_th: 'สำเร็จ',
  });
}
