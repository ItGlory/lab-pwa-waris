'use client';

import * as React from 'react';
import {
  GraduationCap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Target,
  Settings2,
  Download,
  Upload,
  Calendar,
  Timer,
  Layers,
  Database,
  Brain,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles,
  Award,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Interfaces
interface TrainingJob {
  id: string;
  model_id: string;
  model_name: string;
  model_name_th: string;
  status: 'running' | 'completed' | 'failed' | 'queued' | 'cancelled';
  progress: number;
  current_epoch: number;
  total_epochs: number;
  started_at: string;
  completed_at?: string;
  duration?: string;
  metrics: {
    train_loss: number;
    val_loss: number;
    best_metric: number;
    metric_name: string;
  };
  config: {
    learning_rate: number;
    batch_size: number;
    epochs: number;
    optimizer: string;
  };
  dataset: {
    name: string;
    train_samples: number;
    val_samples: number;
  };
  resources: {
    gpu_usage: number;
    memory_usage: number;
    gpu_memory: number;
  };
  triggered_by: string;
  version: string;
}

interface ModelConfig {
  id: string;
  name: string;
  name_th: string;
  type: 'anomaly' | 'pattern' | 'classification' | 'timeseries';
  current_version: string;
  last_trained: string;
  status: 'ready' | 'training' | 'outdated';
  default_config: {
    learning_rate: number;
    batch_size: number;
    epochs: number;
    optimizer: string;
  };
  metrics: {
    name: string;
    current: number;
    target: number;
  };
}

interface TrainingStats {
  total_jobs: number;
  running: number;
  completed: number;
  failed: number;
  avg_training_time: string;
  total_gpu_hours: number;
}

// Mock data
const mockTrainingJobs: TrainingJob[] = [
  {
    id: 'job-001',
    model_id: 'anomaly-detection',
    model_name: 'Anomaly Detection',
    model_name_th: 'ตรวจจับความผิดปกติ',
    status: 'running',
    progress: 65,
    current_epoch: 13,
    total_epochs: 20,
    started_at: '2026-01-15T08:00:00Z',
    metrics: {
      train_loss: 0.0342,
      val_loss: 0.0415,
      best_metric: 0.87,
      metric_name: 'F1-Score',
    },
    config: {
      learning_rate: 0.001,
      batch_size: 64,
      epochs: 20,
      optimizer: 'Adam',
    },
    dataset: {
      name: 'DMA Water Loss 2025',
      train_samples: 185000,
      val_samples: 45000,
    },
    resources: {
      gpu_usage: 85,
      memory_usage: 72,
      gpu_memory: 38,
    },
    triggered_by: 'สมชาย มั่งมี',
    version: '2.4.0',
  },
  {
    id: 'job-002',
    model_id: 'time-series',
    model_name: 'Time Series Forecasting',
    model_name_th: 'พยากรณ์อนุกรมเวลา',
    status: 'queued',
    progress: 0,
    current_epoch: 0,
    total_epochs: 30,
    started_at: '2026-01-15T10:00:00Z',
    metrics: {
      train_loss: 0,
      val_loss: 0,
      best_metric: 0,
      metric_name: 'MAPE',
    },
    config: {
      learning_rate: 0.0005,
      batch_size: 32,
      epochs: 30,
      optimizer: 'AdamW',
    },
    dataset: {
      name: 'Historical Water Loss',
      train_samples: 280000,
      val_samples: 70000,
    },
    resources: {
      gpu_usage: 0,
      memory_usage: 0,
      gpu_memory: 0,
    },
    triggered_by: 'System (Scheduled)',
    version: '2.1.0',
  },
  {
    id: 'job-003',
    model_id: 'classification',
    model_name: 'Water Loss Classification',
    model_name_th: 'จำแนกประเภทน้ำสูญเสีย',
    status: 'completed',
    progress: 100,
    current_epoch: 25,
    total_epochs: 25,
    started_at: '2026-01-14T14:00:00Z',
    completed_at: '2026-01-14T17:30:00Z',
    duration: '3h 30m',
    metrics: {
      train_loss: 0.0125,
      val_loss: 0.0189,
      best_metric: 0.89,
      metric_name: 'AUC-ROC',
    },
    config: {
      learning_rate: 0.001,
      batch_size: 128,
      epochs: 25,
      optimizer: 'Adam',
    },
    dataset: {
      name: 'Classification Dataset v2',
      train_samples: 75000,
      val_samples: 18000,
    },
    resources: {
      gpu_usage: 0,
      memory_usage: 0,
      gpu_memory: 0,
    },
    triggered_by: 'สุภาพร วงศ์ไพศาล',
    version: '3.1.0',
  },
  {
    id: 'job-004',
    model_id: 'pattern-recognition',
    model_name: 'Pattern Recognition',
    model_name_th: 'จดจำรูปแบบ',
    status: 'failed',
    progress: 45,
    current_epoch: 9,
    total_epochs: 20,
    started_at: '2026-01-13T09:00:00Z',
    completed_at: '2026-01-13T11:15:00Z',
    duration: '2h 15m',
    metrics: {
      train_loss: 0.0856,
      val_loss: 0.1245,
      best_metric: 0.72,
      metric_name: 'Accuracy',
    },
    config: {
      learning_rate: 0.01,
      batch_size: 256,
      epochs: 20,
      optimizer: 'SGD',
    },
    dataset: {
      name: 'Pattern Dataset v1',
      train_samples: 120000,
      val_samples: 30000,
    },
    resources: {
      gpu_usage: 0,
      memory_usage: 0,
      gpu_memory: 0,
    },
    triggered_by: 'วิชัย สุขใจ',
    version: '1.8.3',
  },
];

const mockModelConfigs: ModelConfig[] = [
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    name_th: 'ตรวจจับความผิดปกติ',
    type: 'anomaly',
    current_version: '2.3.1',
    last_trained: '2026-01-10T08:30:00Z',
    status: 'training',
    default_config: {
      learning_rate: 0.001,
      batch_size: 64,
      epochs: 20,
      optimizer: 'Adam',
    },
    metrics: { name: 'F1-Score', current: 0.87, target: 0.85 },
  },
  {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    name_th: 'จดจำรูปแบบ',
    type: 'pattern',
    current_version: '1.8.2',
    last_trained: '2026-01-08T11:00:00Z',
    status: 'outdated',
    default_config: {
      learning_rate: 0.0005,
      batch_size: 128,
      epochs: 30,
      optimizer: 'AdamW',
    },
    metrics: { name: 'Accuracy', current: 0.83, target: 0.80 },
  },
  {
    id: 'classification',
    name: 'Water Loss Classification',
    name_th: 'จำแนกประเภทน้ำสูญเสีย',
    type: 'classification',
    current_version: '3.1.0',
    last_trained: '2026-01-14T17:30:00Z',
    status: 'ready',
    default_config: {
      learning_rate: 0.001,
      batch_size: 128,
      epochs: 25,
      optimizer: 'Adam',
    },
    metrics: { name: 'AUC-ROC', current: 0.89, target: 0.85 },
  },
  {
    id: 'time-series',
    name: 'Time Series Forecasting',
    name_th: 'พยากรณ์อนุกรมเวลา',
    type: 'timeseries',
    current_version: '2.0.5',
    last_trained: '2026-01-05T12:00:00Z',
    status: 'outdated',
    default_config: {
      learning_rate: 0.0005,
      batch_size: 32,
      epochs: 30,
      optimizer: 'AdamW',
    },
    metrics: { name: 'MAPE', current: 13.8, target: 15 },
  },
];

const mockStats: TrainingStats = {
  total_jobs: 156,
  running: 1,
  completed: 142,
  failed: 8,
  avg_training_time: '2h 45m',
  total_gpu_hours: 412,
};

export default function ModelTrainingPage() {
  const [loading, setLoading] = React.useState(true);
  const [jobs, setJobs] = React.useState<TrainingJob[]>([]);
  const [models, setModels] = React.useState<ModelConfig[]>([]);
  const [stats, setStats] = React.useState<TrainingStats | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [isTrainDialogOpen, setIsTrainDialogOpen] = React.useState(false);
  const [trainConfig, setTrainConfig] = React.useState({
    learning_rate: 0.001,
    batch_size: 64,
    epochs: 20,
    optimizer: 'Adam',
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setJobs(mockTrainingJobs);
      setModels(mockModelConfigs);
      setStats(mockStats);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: TrainingJob['status']) => {
    switch (status) {
      case 'running':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 animate-pulse">
            <Play className="h-3 w-3 mr-1" />
            Running
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'queued':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary">
            <Square className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
    }
  };

  const getModelStatusBadge = (status: ModelConfig['status']) => {
    switch (status) {
      case 'ready':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'training':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 animate-pulse">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Training
          </Badge>
        );
      case 'outdated':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Needs Update
          </Badge>
        );
    }
  };

  const getTypeColor = (type: ModelConfig['type']) => {
    switch (type) {
      case 'anomaly':
        return { gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-500/20 to-orange-500/10' };
      case 'pattern':
        return { gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-500/20 to-purple-600/10' };
      case 'classification':
        return { gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-500/20 to-blue-600/10' };
      case 'timeseries':
        return { gradient: 'from-[var(--pwa-cyan)] to-teal-500', bg: 'from-[var(--pwa-cyan)]/20 to-teal-500/10' };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartTraining = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(modelId);
      setTrainConfig(model.default_config);
      setIsTrainDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  const runningJob = jobs.find((j) => j.status === 'running');

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Model Training
              </span>
            </h1>
            <p className="text-muted-foreground">
              Train และ retrain AI models
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
            onClick={() => setIsTrainDialogOpen(true)}
          >
            <Play className="h-4 w-4" />
            Start New Training
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade">
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{stats.total_jobs}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                    <Layers className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                    <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                    <p className="text-2xl font-bold">{stats.avg_training_time}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                    <Timer className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
              <CardContent className="relative p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">GPU Hours</p>
                    <p className="text-2xl font-bold">{stats.total_gpu_hours}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <Cpu className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Running Job Card */}
        {runningJob && (
          <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-blue-500/5 to-blue-600/5 border-blue-500/20 shadow-lg">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {runningJob.model_name_th}
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 animate-pulse">
                        Training
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      v{runningJob.version} • Started by {runningJob.triggered_by}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-bold">{runningJob.progress}%</span>
                  </div>
                  <Progress value={runningJob.progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Epoch {runningJob.current_epoch}/{runningJob.total_epochs}</span>
                    <span>ETA: ~45 min</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Live Metrics</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground">Train Loss</p>
                      <p className="font-mono font-bold">{runningJob.metrics.train_loss.toFixed(4)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground">Val Loss</p>
                      <p className="font-mono font-bold">{runningJob.metrics.val_loss.toFixed(4)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50 col-span-2">
                      <p className="text-xs text-muted-foreground">Best {runningJob.metrics.metric_name}</p>
                      <p className="font-mono font-bold text-emerald-600">{runningJob.metrics.best_metric.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Resources</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" /> GPU
                        </span>
                        <span>{runningJob.resources.gpu_usage}%</span>
                      </div>
                      <Progress value={runningJob.resources.gpu_usage} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" /> Memory
                        </span>
                        <span>{runningJob.resources.memory_usage}%</span>
                      </div>
                      <Progress value={runningJob.resources.memory_usage} className="h-1.5" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" /> VRAM
                        </span>
                        <span>{runningJob.resources.gpu_memory} GB</span>
                      </div>
                      <Progress value={(runningJob.resources.gpu_memory / 48) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="models" className="space-y-4">
          <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
            <TabsTrigger value="models" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Brain className="h-4 w-4" />
              โมเดล
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Clock className="h-4 w-4" />
              ประวัติ
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="animate-blur-in">
            <div className="grid gap-4 md:grid-cols-2">
              {models.map((model, index) => {
                const color = getTypeColor(model.type);
                const meetsTarget = model.metrics.name === 'MAPE'
                  ? model.metrics.current <= model.metrics.target
                  : model.metrics.current >= model.metrics.target;

                return (
                  <Card
                    key={model.id}
                    className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all animate-slide-up-fade"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <CardHeader className="relative pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color.bg} ring-1 ring-${model.type === 'anomaly' ? 'amber' : model.type === 'pattern' ? 'purple' : model.type === 'classification' ? 'blue' : '[var(--pwa-cyan)]'}-500/20`}>
                            <Brain className={`h-6 w-6 bg-gradient-to-br ${color.gradient} bg-clip-text`} style={{ color: model.type === 'anomaly' ? '#f59e0b' : model.type === 'pattern' ? '#a855f7' : model.type === 'classification' ? '#3b82f6' : '#00C2F3' }} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{model.name_th}</CardTitle>
                            <CardDescription>{model.name}</CardDescription>
                          </div>
                        </div>
                        {getModelStatusBadge(model.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">Version</p>
                            <p className="font-mono font-bold">v{model.current_version}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground">Last Trained</p>
                            <p className="text-sm font-medium">
                              {new Date(model.last_trained).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">{model.metrics.name}</span>
                            <div className="flex items-center gap-1">
                              <span className={`font-bold ${meetsTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {model.metrics.name === 'MAPE' ? `${model.metrics.current}%` : model.metrics.current.toFixed(2)}
                              </span>
                              {meetsTarget ? (
                                <ArrowUp className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            Target: {model.metrics.name === 'MAPE' ? `≤${model.metrics.target}%` : `≥${model.metrics.target}`}
                            {meetsTarget && (
                              <Badge className="bg-emerald-500/20 text-emerald-600 border-0 text-[10px]">Met</Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          className={`w-full gap-2 bg-gradient-to-r ${color.gradient} hover:opacity-90`}
                          onClick={() => handleStartTraining(model.id)}
                          disabled={model.status === 'training'}
                        >
                          {model.status === 'training' ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Training...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              {model.status === 'outdated' ? 'Retrain Model' : 'Train New Version'}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="animate-blur-in">
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <CardContent className="relative p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left p-4 font-medium text-sm">Model</th>
                        <th className="text-left p-4 font-medium text-sm">Version</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Metrics</th>
                        <th className="text-left p-4 font-medium text-sm">Duration</th>
                        <th className="text-left p-4 font-medium text-sm">Started</th>
                        <th className="text-left p-4 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, index) => (
                        <tr
                          key={job.id}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors animate-slide-up-fade"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                                <Brain className="h-5 w-5 text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-medium">{job.model_name_th}</p>
                                <p className="text-xs text-muted-foreground">{job.triggered_by}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm">v{job.version}</span>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(job.status)}
                          </td>
                          <td className="p-4">
                            {job.status !== 'queued' && (
                              <div className="text-sm">
                                <span className="font-medium">{job.metrics.metric_name}: </span>
                                <span className={job.metrics.best_metric > 0.8 ? 'text-emerald-600' : 'text-amber-600'}>
                                  {job.metrics.best_metric.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{job.duration || '-'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(job.started_at)}
                            </span>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  ดูรายละเอียด
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Logs
                                </DropdownMenuItem>
                                {job.status === 'failed' && (
                                  <DropdownMenuItem>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Retry
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Train Dialog */}
        <Dialog open={isTrainDialogOpen} onOpenChange={setIsTrainDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
                Start Training
              </DialogTitle>
              <DialogDescription>
                กำหนดค่า hyperparameters สำหรับการ train
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกโมเดล" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>{model.name_th}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={trainConfig.learning_rate}
                    onChange={(e) => setTrainConfig({ ...trainConfig, learning_rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Select
                    value={trainConfig.batch_size.toString()}
                    onValueChange={(v) => setTrainConfig({ ...trainConfig, batch_size: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                      <SelectItem value="256">256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Epochs</Label>
                  <Input
                    type="number"
                    value={trainConfig.epochs}
                    onChange={(e) => setTrainConfig({ ...trainConfig, epochs: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Optimizer</Label>
                  <Select
                    value={trainConfig.optimizer}
                    onValueChange={(v) => setTrainConfig({ ...trainConfig, optimizer: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adam">Adam</SelectItem>
                      <SelectItem value="AdamW">AdamW</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                      <SelectItem value="RMSprop">RMSprop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600">หมายเหตุ</p>
                    <p className="text-muted-foreground">การ train จะใช้ GPU และอาจใช้เวลาหลายชั่วโมง</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTrainDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                <Play className="h-4 w-4" />
                Start Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
