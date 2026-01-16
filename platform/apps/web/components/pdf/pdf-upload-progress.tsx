'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Scissors,
  Sparkles,
  Database,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export type ProcessingStage = 'extract' | 'chunk' | 'embed' | 'store';

export interface StageProgress {
  stage: ProcessingStage;
  percent: number;
  message: string;
  message_th: string;
  stats?: Record<string, number>;
}

export interface ProcessingStats {
  pages_extracted: number;
  chunks_created: number;
  vectors_stored: number;
  processing_time_ms: number;
}

interface PDFUploadProgressProps {
  filename: string;
  currentStage: ProcessingStage | null;
  stageProgress: Record<ProcessingStage, number>;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
  stats?: ProcessingStats;
}

const STAGES: {
  id: ProcessingStage;
  label: string;
  labelTh: string;
  icon: typeof FileText;
}[] = [
  { id: 'extract', label: 'Extract', labelTh: 'แยกข้อความ', icon: FileText },
  { id: 'chunk', label: 'Chunk', labelTh: 'แบ่งส่วน', icon: Scissors },
  { id: 'embed', label: 'Embed', labelTh: 'สร้าง Vector', icon: Sparkles },
  { id: 'store', label: 'Store', labelTh: 'บันทึก', icon: Database },
];

function getStageStatus(
  stageId: ProcessingStage,
  currentStage: ProcessingStage | null,
  stageProgress: Record<ProcessingStage, number>,
  isComplete: boolean
): 'pending' | 'active' | 'completed' {
  const stageIndex = STAGES.findIndex((s) => s.id === stageId);
  const currentIndex = currentStage
    ? STAGES.findIndex((s) => s.id === currentStage)
    : -1;

  if (isComplete) return 'completed';
  if (stageProgress[stageId] === 100) return 'completed';
  if (stageId === currentStage) return 'active';
  if (stageIndex < currentIndex) return 'completed';
  return 'pending';
}

export function PDFUploadProgress({
  filename,
  currentStage,
  stageProgress,
  isComplete,
  isError,
  errorMessage,
  stats,
}: PDFUploadProgressProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          <span className="truncate">{filename}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 4-Stage Progress */}
        <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => {
            const status = getStageStatus(
              stage.id,
              currentStage,
              stageProgress,
              isComplete
            );
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                      status === 'completed' &&
                        'border-green-500 bg-green-500 text-white',
                      status === 'active' &&
                        'border-primary bg-primary/10 text-primary',
                      status === 'pending' &&
                        'border-muted-foreground/30 bg-muted text-muted-foreground'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="h-5 w-5" />
                    ) : status === 'active' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium',
                      status === 'completed' && 'text-green-600',
                      status === 'active' && 'text-primary',
                      status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {stage.labelTh}
                  </span>
                  {status === 'active' && stageProgress[stage.id] > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {stageProgress[stage.id]}%
                    </span>
                  )}
                </div>

                {/* Connector Line */}
                {index < STAGES.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 w-8 transition-all duration-300',
                      status === 'completed' ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error State */}
        {isError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{errorMessage || 'เกิดข้อผิดพลาด'}</span>
          </div>
        )}

        {/* Completion Stats */}
        {isComplete && stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="หน้า"
              value={stats.pages_extracted}
              icon={FileText}
            />
            <StatCard
              label="Chunks"
              value={stats.chunks_created}
              icon={Scissors}
            />
            <StatCard
              label="Vectors"
              value={stats.vectors_stored}
              icon={Database}
            />
            <StatCard
              label="เวลา"
              value={`${(stats.processing_time_ms / 1000).toFixed(1)}s`}
              icon={Sparkles}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof FileText;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
