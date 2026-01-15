'use client';

import * as React from 'react';
import {
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Target,
  Gauge,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Download,
  Calendar,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  History,
  Settings2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Model data interfaces
interface ModelMetrics {
  f1_score?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  auc_roc?: number;
  mape?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
}

interface ModelVersion {
  version: string;
  trained_at: string;
  metrics: ModelMetrics;
  dataset_size: number;
  training_time: string;
  status: 'active' | 'archived' | 'testing';
}

interface AIModel {
  id: string;
  name: string;
  name_th: string;
  description: string;
  description_th: string;
  type: 'anomaly' | 'pattern' | 'classification' | 'timeseries';
  status: 'active' | 'training' | 'inactive' | 'error';
  current_version: string;
  versions: ModelVersion[];
  target_metrics: ModelMetrics;
  last_inference: string;
  inference_count: number;
  avg_latency_ms: number;
}

interface PerformanceHistory {
  date: string;
  metrics: ModelMetrics;
}

// Mock data
const mockModels: AIModel[] = [
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    name_th: 'ตรวจจับความผิดปกติ',
    description: 'Detects abnormal patterns in water flow and pressure data',
    description_th: 'ตรวจจับรูปแบบผิดปกติในข้อมูลการไหลและแรงดันน้ำ',
    type: 'anomaly',
    status: 'active',
    current_version: '2.3.1',
    versions: [
      {
        version: '2.3.1',
        trained_at: '2026-01-10T08:30:00Z',
        metrics: { f1_score: 0.87, precision: 0.89, recall: 0.85, accuracy: 0.92 },
        dataset_size: 245000,
        training_time: '2h 15m',
        status: 'active',
      },
      {
        version: '2.3.0',
        trained_at: '2025-12-20T10:00:00Z',
        metrics: { f1_score: 0.84, precision: 0.86, recall: 0.82, accuracy: 0.90 },
        dataset_size: 220000,
        training_time: '2h 05m',
        status: 'archived',
      },
      {
        version: '2.2.0',
        trained_at: '2025-11-15T14:30:00Z',
        metrics: { f1_score: 0.81, precision: 0.83, recall: 0.79, accuracy: 0.88 },
        dataset_size: 180000,
        training_time: '1h 45m',
        status: 'archived',
      },
    ],
    target_metrics: { f1_score: 0.85, precision: 0.85, recall: 0.85, accuracy: 0.90 },
    last_inference: '2026-01-15T09:45:00Z',
    inference_count: 15420,
    avg_latency_ms: 45,
  },
  {
    id: 'pattern-recognition',
    name: 'Pattern Recognition',
    name_th: 'จดจำรูปแบบ',
    description: 'Identifies usage patterns and consumption behaviors',
    description_th: 'ระบุรูปแบบการใช้งานและพฤติกรรมการบริโภค',
    type: 'pattern',
    status: 'active',
    current_version: '1.8.2',
    versions: [
      {
        version: '1.8.2',
        trained_at: '2026-01-08T11:00:00Z',
        metrics: { accuracy: 0.83, precision: 0.85, recall: 0.81 },
        dataset_size: 180000,
        training_time: '1h 30m',
        status: 'active',
      },
      {
        version: '1.8.1',
        trained_at: '2025-12-15T09:00:00Z',
        metrics: { accuracy: 0.80, precision: 0.82, recall: 0.78 },
        dataset_size: 165000,
        training_time: '1h 25m',
        status: 'archived',
      },
    ],
    target_metrics: { accuracy: 0.80, precision: 0.80, recall: 0.80 },
    last_inference: '2026-01-15T09:40:00Z',
    inference_count: 12350,
    avg_latency_ms: 38,
  },
  {
    id: 'classification',
    name: 'Water Loss Classification',
    name_th: 'จำแนกประเภทน้ำสูญเสีย',
    description: 'Classifies water loss as physical or commercial',
    description_th: 'จำแนกน้ำสูญเสียเป็นประเภทกายภาพหรือพาณิชย์',
    type: 'classification',
    status: 'active',
    current_version: '3.1.0',
    versions: [
      {
        version: '3.1.0',
        trained_at: '2026-01-12T16:00:00Z',
        metrics: { auc_roc: 0.88, accuracy: 0.86, precision: 0.87, recall: 0.85 },
        dataset_size: 95000,
        training_time: '45m',
        status: 'active',
      },
      {
        version: '3.0.0',
        trained_at: '2025-12-01T08:00:00Z',
        metrics: { auc_roc: 0.85, accuracy: 0.83, precision: 0.84, recall: 0.82 },
        dataset_size: 85000,
        training_time: '40m',
        status: 'archived',
      },
    ],
    target_metrics: { auc_roc: 0.85, accuracy: 0.85, precision: 0.85, recall: 0.85 },
    last_inference: '2026-01-15T09:42:00Z',
    inference_count: 8920,
    avg_latency_ms: 28,
  },
  {
    id: 'time-series',
    name: 'Time Series Forecasting',
    name_th: 'พยากรณ์อนุกรมเวลา',
    description: 'Forecasts water loss trends and future values',
    description_th: 'พยากรณ์แนวโน้มน้ำสูญเสียและค่าในอนาคต',
    type: 'timeseries',
    status: 'training',
    current_version: '2.0.5',
    versions: [
      {
        version: '2.1.0-beta',
        trained_at: '2026-01-15T06:00:00Z',
        metrics: { mape: 12.5, rmse: 0.045, mae: 0.032, r2: 0.91 },
        dataset_size: 320000,
        training_time: '3h 20m',
        status: 'testing',
      },
      {
        version: '2.0.5',
        trained_at: '2026-01-05T12:00:00Z',
        metrics: { mape: 13.8, rmse: 0.052, mae: 0.038, r2: 0.89 },
        dataset_size: 300000,
        training_time: '3h 05m',
        status: 'active',
      },
    ],
    target_metrics: { mape: 15, rmse: 0.06, r2: 0.85 },
    last_inference: '2026-01-15T09:30:00Z',
    inference_count: 18750,
    avg_latency_ms: 125,
  },
];

const mockPerformanceHistory: Record<string, PerformanceHistory[]> = {
  'anomaly-detection': [
    { date: '2026-01-01', metrics: { f1_score: 0.84, accuracy: 0.90 } },
    { date: '2026-01-05', metrics: { f1_score: 0.85, accuracy: 0.91 } },
    { date: '2026-01-08', metrics: { f1_score: 0.86, accuracy: 0.91 } },
    { date: '2026-01-10', metrics: { f1_score: 0.87, accuracy: 0.92 } },
    { date: '2026-01-12', metrics: { f1_score: 0.87, accuracy: 0.92 } },
    { date: '2026-01-15', metrics: { f1_score: 0.87, accuracy: 0.92 } },
  ],
  'pattern-recognition': [
    { date: '2026-01-01', metrics: { accuracy: 0.79 } },
    { date: '2026-01-05', metrics: { accuracy: 0.80 } },
    { date: '2026-01-08', metrics: { accuracy: 0.81 } },
    { date: '2026-01-10', metrics: { accuracy: 0.82 } },
    { date: '2026-01-12', metrics: { accuracy: 0.83 } },
    { date: '2026-01-15', metrics: { accuracy: 0.83 } },
  ],
  'classification': [
    { date: '2026-01-01', metrics: { auc_roc: 0.84, accuracy: 0.82 } },
    { date: '2026-01-05', metrics: { auc_roc: 0.85, accuracy: 0.83 } },
    { date: '2026-01-08', metrics: { auc_roc: 0.86, accuracy: 0.84 } },
    { date: '2026-01-10', metrics: { auc_roc: 0.87, accuracy: 0.85 } },
    { date: '2026-01-12', metrics: { auc_roc: 0.88, accuracy: 0.86 } },
    { date: '2026-01-15', metrics: { auc_roc: 0.88, accuracy: 0.86 } },
  ],
  'time-series': [
    { date: '2026-01-01', metrics: { mape: 16.2, r2: 0.86 } },
    { date: '2026-01-05', metrics: { mape: 15.1, r2: 0.87 } },
    { date: '2026-01-08', metrics: { mape: 14.5, r2: 0.88 } },
    { date: '2026-01-10', metrics: { mape: 14.0, r2: 0.89 } },
    { date: '2026-01-12', metrics: { mape: 13.8, r2: 0.89 } },
    { date: '2026-01-15', metrics: { mape: 12.5, r2: 0.91 } },
  ],
};

export default function ModelEvaluationPage() {
  const [loading, setLoading] = React.useState(true);
  const [models, setModels] = React.useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<string>('');
  const [performanceHistory, setPerformanceHistory] = React.useState<PerformanceHistory[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setModels(mockModels);
      setSelectedModel('anomaly-detection');
      setPerformanceHistory(mockPerformanceHistory['anomaly-detection'] || []);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (selectedModel) {
      setPerformanceHistory(mockPerformanceHistory[selectedModel] || []);
    }
  }, [selectedModel]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getStatusBadge = (status: AIModel['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md shadow-emerald-500/25">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'training':
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md shadow-blue-500/25 animate-pulse">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Training
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <Pause className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md shadow-red-500/25">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  const getMetricStatus = (value: number, target: number, isLowerBetter = false): 'good' | 'warning' | 'bad' => {
    const ratio = isLowerBetter ? target / value : value / target;
    if (ratio >= 1) return 'good';
    if (ratio >= 0.9) return 'warning';
    return 'bad';
  };

  const getMetricColor = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'bad':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getMetricGradient = (status: 'good' | 'warning' | 'bad') => {
    switch (status) {
      case 'good':
        return 'from-emerald-500 to-emerald-600';
      case 'warning':
        return 'from-amber-500 to-orange-500';
      case 'bad':
        return 'from-red-500 to-red-600';
    }
  };

  const getTrendIcon = (current: number, previous: number, isLowerBetter = false) => {
    const diff = current - previous;
    const improved = isLowerBetter ? diff < 0 : diff > 0;
    const unchanged = Math.abs(diff) < 0.001;

    if (unchanged) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (improved) return <ArrowUp className="h-3 w-3 text-emerald-500" />;
    return <ArrowDown className="h-3 w-3 text-red-500" />;
  };

  const selectedModelData = models.find((m) => m.id === selectedModel);
  const currentVersion = selectedModelData?.versions.find((v) => v.status === 'active' || v.status === 'testing');

  const getModelIcon = (type: AIModel['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'pattern':
        return <Activity className="h-5 w-5" />;
      case 'classification':
        return <Target className="h-5 w-5" />;
      case 'timeseries':
        return <LineChart className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: AIModel['type']) => {
    switch (type) {
      case 'anomaly':
        return { gradient: 'from-amber-500 to-orange-500', shadow: 'amber', bg: 'from-amber-500/20 to-orange-500/10' };
      case 'pattern':
        return { gradient: 'from-purple-500 to-purple-600', shadow: 'purple', bg: 'from-purple-500/20 to-purple-600/10' };
      case 'classification':
        return { gradient: 'from-blue-500 to-[var(--pwa-blue-deep)]', shadow: 'blue', bg: 'from-blue-500/20 to-[var(--pwa-blue-deep)]/10' };
      case 'timeseries':
        return { gradient: 'from-[var(--pwa-cyan)] to-teal-500', shadow: 'cyan', bg: 'from-[var(--pwa-cyan)]/20 to-teal-500/10' };
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
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20 shadow-lg shadow-[var(--pwa-cyan)]/10">
                <Gauge className="h-5 w-5 text-[var(--pwa-cyan)]" />
              </div>
              <span className="bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
                Model Evaluation
              </span>
            </h1>
            <p className="text-muted-foreground">
              ประเมินประสิทธิภาพและติดตามการทำงานของ AI Models
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px] bg-background/50 border-border/50 hover:border-[var(--pwa-cyan)]/30 transition-colors">
                <SelectValue placeholder="เลือกโมเดล" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      {getModelIcon(model.type)}
                      <span>{model.name_th}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Model Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {models.map((model, index) => {
            const color = getTypeColor(model.type);
            const isSelected = model.id === selectedModel;

            return (
              <Card
                key={model.id}
                className={`group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-slide-up-fade ${
                  isSelected ? `ring-2 ring-[var(--pwa-cyan)]/50 shadow-[var(--pwa-cyan)]/20` : 'hover:border-border'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="relative pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color.bg} ring-1 ring-${color.shadow}-500/20`}>
                      <span className={`bg-gradient-to-br ${color.gradient} bg-clip-text text-transparent`}>
                        {getModelIcon(model.type)}
                      </span>
                    </div>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardTitle className="text-sm font-medium mt-2">{model.name_th}</CardTitle>
                  <CardDescription className="text-xs">{model.name}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-mono font-medium">v{model.current_version}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Inferences</span>
                      <span className="font-medium">{model.inference_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avg Latency</span>
                      <span className="font-medium">{model.avg_latency_ms}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        {selectedModelData && (
          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
              <TabsTrigger value="metrics" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
                <BarChart3 className="h-4 w-4" />
                Performance Metrics
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
                <History className="h-4 w-4" />
                ประวัติ
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
                <Settings2 className="h-4 w-4" />
                Versions
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--pwa-cyan)] data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[var(--pwa-cyan)]/25 transition-all">
                <Target className="h-4 w-4" />
                เทียบ Target
              </TabsTrigger>
            </TabsList>

            {/* Performance Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4 animate-blur-in">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Current Performance Card */}
                <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20">
                        <Award className="h-4 w-4 text-emerald-500" />
                      </div>
                      Current Performance
                    </CardTitle>
                    <CardDescription>
                      เมตริกประสิทธิภาพปัจจุบันของ {selectedModelData.name_th}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {currentVersion && Object.entries(currentVersion.metrics).map(([key, value]) => {
                        const targetValue = selectedModelData.target_metrics[key as keyof ModelMetrics];
                        const isLowerBetter = key === 'mape' || key === 'rmse' || key === 'mae';
                        const status = targetValue ? getMetricStatus(value, targetValue, isLowerBetter) : 'good';
                        const barWidth = isLowerBetter
                          ? Math.max(0, 100 - (value / (targetValue || value)) * 50)
                          : (value / (targetValue || 1)) * 100;

                        return (
                          <div key={key} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize">
                                  {key.replace('_', '-').toUpperCase()}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Target: {targetValue ? (isLowerBetter ? `≤ ${targetValue}` : `≥ ${targetValue}`) : 'N/A'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${getMetricColor(status)}`}>
                                  {isLowerBetter ? value.toFixed(1) : (value * 100).toFixed(1)}
                                  {isLowerBetter ? (key === 'mape' ? '%' : '') : '%'}
                                </span>
                                {performanceHistory.length >= 2 && (
                                  getTrendIcon(
                                    value,
                                    performanceHistory[performanceHistory.length - 2]?.metrics[key as keyof ModelMetrics] || value,
                                    isLowerBetter
                                  )
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getMetricGradient(status)} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(100, barWidth)}%` }}
                              />
                            </div>
                            {targetValue && (
                              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                <span>0</span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Target: {isLowerBetter ? `≤${targetValue}` : `${targetValue * 100}%`}
                                </span>
                                <span>{isLowerBetter ? '100' : '100%'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Model Details Card */}
                <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-blue-500/20">
                        <Brain className="h-4 w-4 text-blue-500" />
                      </div>
                      Model Details
                    </CardTitle>
                    <CardDescription>
                      รายละเอียดและสถิติการใช้งาน
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">Current Version</p>
                          <p className="font-mono font-bold text-lg">v{selectedModelData.current_version}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <div className="mt-1">{getStatusBadge(selectedModelData.status)}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Total Inferences</span>
                          </div>
                          <span className="font-bold">{selectedModelData.inference_count.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Avg Latency</span>
                          </div>
                          <span className="font-bold">{selectedModelData.avg_latency_ms}ms</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">Last Inference</span>
                          </div>
                          <span className="font-medium text-sm">
                            {new Date(selectedModelData.last_inference).toLocaleString('th-TH', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        {currentVersion && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm">Training Dataset</span>
                            </div>
                            <span className="font-bold">{currentVersion.dataset_size.toLocaleString()} samples</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description Card */}
              <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(selectedModelData.type).bg} ring-1 ring-${getTypeColor(selectedModelData.type).shadow}-500/20`}>
                      {getModelIcon(selectedModelData.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedModelData.name_th}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedModelData.description_th}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="animate-blur-in">
              <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/20">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    Performance Trend
                  </CardTitle>
                  <CardDescription>
                    แนวโน้มประสิทธิภาพในช่วง 15 วันที่ผ่านมา
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  {/* Simple line visualization */}
                  <div className="space-y-6">
                    <div className="flex items-end gap-2 h-48 px-2">
                      {performanceHistory.map((item, i) => {
                        const primaryMetric = Object.keys(item.metrics)[0];
                        const value = item.metrics[primaryMetric as keyof ModelMetrics] || 0;
                        const isLowerBetter = primaryMetric === 'mape';
                        const normalizedValue = isLowerBetter
                          ? Math.max(0, 100 - value * 3)
                          : value * 100;

                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-2 animate-slide-up-fade"
                            style={{ animationDelay: `${i * 75}ms` }}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-full bg-gradient-to-t from-purple-500/50 to-purple-400/30 rounded-t-lg cursor-pointer hover:from-purple-500/70 hover:to-purple-400/50 transition-all relative group"
                                  style={{ height: `${normalizedValue * 1.5}px` }}
                                >
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                      {isLowerBetter ? value.toFixed(1) : (value * 100).toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p className="font-medium">{new Date(item.date).toLocaleDateString('th-TH')}</p>
                                  {Object.entries(item.metrics).map(([key, val]) => (
                                    <p key={key}>
                                      {key.toUpperCase()}: {typeof val === 'number' && val < 1 ? (val * 100).toFixed(1) + '%' : val}
                                    </p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-purple-400" />
                        <span className="text-muted-foreground">
                          Primary Metric: {Object.keys(performanceHistory[0]?.metrics || {})[0]?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="animate-blur-in">
              <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-teal-500/10 ring-1 ring-[var(--pwa-cyan)]/20">
                      <History className="h-4 w-4 text-[var(--pwa-cyan)]" />
                    </div>
                    Version History
                  </CardTitle>
                  <CardDescription>
                    ประวัติเวอร์ชันและการ train โมเดล
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {selectedModelData.versions.map((version, index) => (
                      <div
                        key={version.version}
                        className={`group p-4 rounded-xl border transition-all animate-slide-up-fade ${
                          version.status === 'active'
                            ? 'bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/30'
                            : version.status === 'testing'
                            ? 'bg-gradient-to-r from-blue-500/5 to-transparent border-blue-500/30'
                            : 'bg-muted/30 border-border/30 hover:border-border/50'
                        }`}
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-lg">v{version.version}</span>
                            {version.status === 'active' && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            {version.status === 'testing' && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                                <Play className="h-3 w-3 mr-1" />
                                Testing
                              </Badge>
                            )}
                            {version.status === 'archived' && (
                              <Badge variant="secondary">Archived</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(version.trained_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(version.metrics).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="p-2 rounded-lg bg-background/50">
                              <p className="text-xs text-muted-foreground uppercase">{key.replace('_', '-')}</p>
                              <p className="font-mono font-bold">
                                {typeof value === 'number' && value < 1 ? (value * 100).toFixed(1) + '%' : value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5" />
                            {version.dataset_size.toLocaleString()} samples
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {version.training_time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="animate-blur-in">
              <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
                      <Target className="h-4 w-4 text-amber-500" />
                    </div>
                    Target Comparison
                  </CardTitle>
                  <CardDescription>
                    เปรียบเทียบประสิทธิภาพปัจจุบันกับเป้าหมาย
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-6">
                    {currentVersion && Object.entries(currentVersion.metrics).map(([key, value], index) => {
                      const targetValue = selectedModelData.target_metrics[key as keyof ModelMetrics];
                      if (!targetValue) return null;

                      const isLowerBetter = key === 'mape' || key === 'rmse' || key === 'mae';
                      const status = getMetricStatus(value, targetValue, isLowerBetter);
                      const achievement = isLowerBetter
                        ? ((targetValue / value) * 100).toFixed(0)
                        : ((value / targetValue) * 100).toFixed(0);

                      return (
                        <div
                          key={key}
                          className="p-4 rounded-xl bg-muted/30 border border-border/30 animate-slide-up-fade"
                          style={{ animationDelay: `${index * 75}ms` }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-medium text-lg uppercase">{key.replace('_', '-')}</span>
                            <Badge
                              className={`${
                                status === 'good'
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                  : status === 'warning'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              } border-0`}
                            >
                              {Number(achievement) >= 100 ? 'Target Met' : `${achievement}% of Target`}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 rounded-lg bg-background/50">
                              <p className="text-xs text-muted-foreground mb-1">Current</p>
                              <p className={`text-2xl font-bold ${getMetricColor(status)}`}>
                                {isLowerBetter ? value.toFixed(1) : (value * 100).toFixed(1)}
                                {isLowerBetter ? (key === 'mape' ? '%' : '') : '%'}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/50 flex flex-col items-center justify-center">
                              <p className="text-xs text-muted-foreground mb-1">vs</p>
                              <div className={`text-2xl ${status === 'good' ? 'text-emerald-500' : status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                                {status === 'good' ? (
                                  <CheckCircle className="h-8 w-8" />
                                ) : status === 'warning' ? (
                                  <AlertTriangle className="h-8 w-8" />
                                ) : (
                                  <XCircle className="h-8 w-8" />
                                )}
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/50">
                              <p className="text-xs text-muted-foreground mb-1">Target</p>
                              <p className="text-2xl font-bold text-muted-foreground">
                                {isLowerBetter ? `≤${targetValue}` : `${targetValue * 100}%`}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                              {/* Target marker */}
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50 z-10"
                                style={{
                                  left: isLowerBetter ? `${Math.min(100, (1 - targetValue / 30) * 100)}%` : `${targetValue * 100}%`,
                                }}
                              />
                              {/* Current value bar */}
                              <div
                                className={`h-full bg-gradient-to-r ${getMetricGradient(status)} rounded-full transition-all duration-500`}
                                style={{
                                  width: isLowerBetter
                                    ? `${Math.min(100, (1 - value / 30) * 100)}%`
                                    : `${Math.min(100, value * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Export Button */}
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
