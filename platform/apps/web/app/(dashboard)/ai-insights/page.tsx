'use client';

import * as React from 'react';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Lightbulb,
  Zap,
  PieChart,
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

interface AIModel {
  id: string;
  name: string;
  name_th: string;
  version: string;
  status: string;
  last_trained: string;
  metrics: Record<string, number>;
}

interface Prediction {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

interface Pattern {
  id: string;
  label: string;
  label_th: string;
  percentage: number;
  count: number;
}

export default function AIInsightsPage() {
  const [loading, setLoading] = React.useState(true);
  const [models, setModels] = React.useState<AIModel[]>([]);
  const [forecast, setForecast] = React.useState<Prediction[]>([]);
  const [patterns, setPatterns] = React.useState<Pattern[]>([]);
  const [selectedDma, setSelectedDma] = React.useState('DMA-001');
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);

  // Fetch AI models
  const fetchModels = React.useCallback(async () => {
    try {
      const response = await fetch('/api/ai/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  }, []);

  // Fetch forecast
  const fetchForecast = React.useCallback(async () => {
    try {
      const response = await fetch('/api/ai/forecast?days=7');
      if (response.ok) {
        const data = await response.json();
        const predictions = data.dates?.map((date: string, i: number) => ({
          date,
          value: data.predictions[i],
          lower: data.lower_bound[i],
          upper: data.upper_bound[i],
        })) || [];
        setForecast(predictions);
      }
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
    }
  }, []);

  // Fetch patterns
  const fetchPatterns = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/ai/patterns/${selectedDma}`);
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.data?.patterns || []);
      }
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
    }
  }, [selectedDma]);

  // Run comprehensive analysis
  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`/api/ai/analyze/${selectedDma}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      await Promise.all([fetchModels(), fetchForecast(), fetchPatterns()]);
      setLoading(false);
    };
    init();
  }, [fetchModels, fetchForecast, fetchPatterns]);

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge variant="outline" className="text-emerald-600 border-emerald-300">Active</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getMetricColor = (metric: string, value: number): string => {
    if (metric === 'mape') {
      return value < 15 ? 'text-emerald-600' : value < 25 ? 'text-amber-600' : 'text-red-600';
    }
    return value > 0.8 ? 'text-emerald-600' : value > 0.6 ? 'text-amber-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 ring-1 ring-purple-500/20 shadow-lg shadow-purple-500/10">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
              AI Insights
            </span>
          </h1>
          <p className="text-muted-foreground">
            การวิเคราะห์อัจฉริยะและการคาดการณ์
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDma} onValueChange={setSelectedDma}>
            <SelectTrigger className="w-[140px] bg-background/50 border-border/50 hover:border-purple-500/30 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DMA-001">DMA-001</SelectItem>
              <SelectItem value="DMA-002">DMA-002</SelectItem>
              <SelectItem value="DMA-003">DMA-003</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={runAnalysis}
            disabled={analyzing}
            className="gap-2 bg-gradient-to-r from-purple-600 to-[var(--pwa-blue-deep)] hover:from-purple-600/90 hover:to-[var(--pwa-blue-deep)]/90 shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                กำลังวิเคราะห์...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                วิเคราะห์
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Model Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {models.map((model, index) => (
          <Card
            key={model.id}
            className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300 animate-slide-up-fade"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-[var(--pwa-blue-deep)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{model.name_th}</CardTitle>
                {model.status === 'active' ? (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md shadow-emerald-500/25 animate-breathing-glow">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">{model.status}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-2">
                {Object.entries(model.metrics).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                    <span className={`font-medium ${getMetricColor(key, value)}`}>
                      {key === 'mape' ? `${value.toFixed(1)}%` : value.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  v{model.version}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="backdrop-blur-sm bg-background/80 border border-border/50 p-1 shadow-lg">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/25 transition-all">
            <Activity className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/25 transition-all">
            <TrendingUp className="h-4 w-4" />
            พยากรณ์
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/25 transition-all">
            <PieChart className="h-4 w-4" />
            รูปแบบ
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-[var(--pwa-blue-deep)] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/25 transition-all">
            <BarChart3 className="h-4 w-4" />
            โมเดล
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 animate-blur-in">
          {analysisResult ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Anomaly Detection */}
              <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    การตรวจจับความผิดปกติ
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  {analysisResult.anomalies?.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      {a.is_anomaly ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 animate-breathing-glow">
                          <XCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {a.is_anomaly ? 'ตรวจพบความผิดปกติ' : 'ไม่พบความผิดปกติ'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ความมั่นใจ: {(a.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Classification */}
              <Card className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-[var(--pwa-blue-deep)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-blue-500/20">
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    การจำแนกประเภท
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-[var(--pwa-blue-deep)]/5 border border-blue-500/20">
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
                        {analysisResult.classification?.loss_type_th}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ความน่าจะเป็น: {((analysisResult.classification?.probability || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">ปัจจัยสำคัญ:</p>
                      {Object.entries(analysisResult.classification?.feature_importance || {})
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs">
                                <span>{key}</span>
                                <span>{((value as number) * 100).toFixed(0)}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-[var(--pwa-blue-deep)] rounded-full transition-all"
                                  style={{ width: `${(value as number) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="md:col-span-2 group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/10 ring-1 ring-yellow-500/20">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    </div>
                    คำแนะนำ
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    {analysisResult.recommendations?.map((rec: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl backdrop-blur-sm bg-muted/30 border border-border/30 hover:border-border/50 transition-all animate-slide-up-fade"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <Badge
                          className={
                            rec.priority === 'high'
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md shadow-red-500/25'
                              : rec.priority === 'medium'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md shadow-amber-500/25'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0'
                          }
                        >
                          {rec.priority === 'high' ? 'สูง' : rec.priority === 'medium' ? 'กลาง' : 'ต่ำ'}
                        </Badge>
                        <div>
                          <p className="font-medium">{rec.message}</p>
                          <p className="text-sm text-muted-foreground">{rec.action}</p>
                        </div>
                        <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl" />
              <CardContent className="relative flex flex-col items-center justify-center py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-purple-500/20 shadow-xl shadow-purple-500/20 mb-6">
                  <Brain className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 to-[var(--pwa-blue-deep)] bg-clip-text text-transparent">
                  เริ่มการวิเคราะห์
                </h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                  คลิกปุ่ม "วิเคราะห์" เพื่อรัน AI analysis สำหรับ {selectedDma}
                </p>
                <Button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-purple-600 to-[var(--pwa-blue-deep)] hover:from-purple-600/90 hover:to-[var(--pwa-blue-deep)]/90 shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
                >
                  <Zap className="h-5 w-5" />
                  วิเคราะห์ตอนนี้
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="animate-blur-in">
          <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--pwa-cyan)]/10 to-transparent rounded-full blur-3xl" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10 ring-1 ring-[var(--pwa-cyan)]/20">
                  <TrendingUp className="h-4 w-4 text-[var(--pwa-cyan)]" />
                </div>
                พยากรณ์น้ำสูญเสีย 7 วัน
              </CardTitle>
              <CardDescription>
                การคาดการณ์ปริมาณน้ำสูญเสียด้วย Time Series Model
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-6">
                {/* Simple bar chart visualization */}
                <div className="flex items-end gap-3 h-56 px-2">
                  {forecast.map((item, i) => {
                    const maxValue = Math.max(...forecast.map(f => f.upper));
                    const height = (item.value / maxValue) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-2 animate-slide-up-fade"
                        style={{ animationDelay: `${i * 75}ms` }}
                      >
                        <div className="w-full flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-[var(--pwa-cyan)]/20 to-[var(--pwa-cyan)]/5 rounded-t-lg relative backdrop-blur-sm border border-[var(--pwa-cyan)]/10"
                            style={{ height: `${(item.upper / maxValue) * 180}px` }}
                          >
                            <div
                              className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] rounded-t-lg shadow-lg shadow-[var(--pwa-cyan)]/30 transition-all hover:shadow-[var(--pwa-cyan)]/50"
                              style={{ height: `${height * 1.8}px` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-8 text-sm p-4 rounded-xl backdrop-blur-sm bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] shadow-md shadow-[var(--pwa-cyan)]/30" />
                    <span className="font-medium">คาดการณ์</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-t from-[var(--pwa-cyan)]/20 to-[var(--pwa-cyan)]/5 border border-[var(--pwa-cyan)]/20" />
                    <span className="font-medium">ช่วงความเชื่อมั่น 95%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="animate-blur-in">
          <Card className="relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20">
                  <PieChart className="h-4 w-4 text-emerald-500" />
                </div>
                รูปแบบการใช้น้ำที่ตรวจพบ
              </CardTitle>
              <CardDescription>
                การจดจำรูปแบบด้วย Clustering Algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {patterns.map((pattern, index) => (
                  <div
                    key={pattern.id}
                    className="group p-4 rounded-xl backdrop-blur-sm bg-muted/30 border border-border/30 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all animate-slide-up-fade"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-lg font-bold text-emerald-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{pattern.label_th}</span>
                          <span className="text-sm text-muted-foreground">
                            {pattern.count} readings
                            <Badge className="ml-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-600 border-emerald-500/20">
                              {pattern.percentage.toFixed(1)}%
                            </Badge>
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30 transition-all"
                            style={{ width: `${pattern.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="animate-blur-in">
          <div className="grid gap-4 md:grid-cols-2">
            {models.map((model, index) => {
              const modelColors = [
                { gradient: 'from-purple-500 to-purple-600', shadow: 'purple', iconBg: 'from-purple-500/20 to-purple-600/10', ring: 'purple-500/20' },
                { gradient: 'from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)]', shadow: 'cyan', iconBg: 'from-[var(--pwa-cyan)]/20 to-[var(--pwa-blue-deep)]/10', ring: '[var(--pwa-cyan)]/20' },
                { gradient: 'from-amber-500 to-orange-500', shadow: 'amber', iconBg: 'from-amber-500/20 to-orange-500/10', ring: 'amber-500/20' },
                { gradient: 'from-emerald-500 to-teal-500', shadow: 'emerald', iconBg: 'from-emerald-500/20 to-teal-500/10', ring: 'emerald-500/20' },
              ];
              const color = modelColors[index % modelColors.length];

              return (
                <Card
                  key={model.id}
                  className="group relative overflow-hidden backdrop-blur-sm bg-background/80 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up-fade"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${color.iconBg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color.iconBg} ring-1 ring-${color.ring} group-hover:scale-110 transition-transform`}>
                          <Brain className={`h-5 w-5 bg-gradient-to-br ${color.gradient} bg-clip-text text-transparent`} style={{ color: index === 0 ? '#a855f7' : index === 1 ? '#00C2F3' : index === 2 ? '#f59e0b' : '#10b981' }} />
                        </div>
                        <CardTitle>{model.name_th}</CardTitle>
                      </div>
                      {model.status === 'active' ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md shadow-emerald-500/25">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{model.status}</Badge>
                      )}
                    </div>
                    <CardDescription className="ml-13">{model.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Version</p>
                          <p className="font-semibold">v{model.version}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Last Trained</p>
                          <p className="font-semibold">
                            {new Date(model.last_trained).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          Performance Metrics
                        </p>
                        <div className="space-y-3">
                          {Object.entries(model.metrics).map(([key, value]) => {
                            const isGood = key === 'mape' ? value < 15 : value > 0.8;
                            const isMedium = key === 'mape' ? value >= 15 && value < 25 : value >= 0.6 && value <= 0.8;
                            const barColor = isGood ? 'from-emerald-500 to-emerald-600' : isMedium ? 'from-amber-500 to-orange-500' : 'from-red-500 to-red-600';
                            const barWidth = key === 'mape' ? Math.max(0, 100 - value * 2) : value * 100;

                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-muted-foreground capitalize">
                                    {key.replace('_', ' ')}
                                  </span>
                                  <span className={`text-sm font-medium ${getMetricColor(key, value)}`}>
                                    {key === 'mape' || key === 'rmse' ? value.toFixed(1) : value.toFixed(2)}
                                    {key === 'mape' && '%'}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all`}
                                    style={{ width: `${barWidth}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
