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
            <Brain className="h-7 w-7 text-purple-600" />
            AI Insights
          </h1>
          <p className="text-muted-foreground">
            การวิเคราะห์อัจฉริยะและการคาดการณ์
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDma} onValueChange={setSelectedDma}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DMA-001">DMA-001</SelectItem>
              <SelectItem value="DMA-002">DMA-002</SelectItem>
              <SelectItem value="DMA-003">DMA-003</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={runAnalysis} disabled={analyzing} className="gap-2">
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
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{model.name_th}</CardTitle>
                {getStatusBadge(model.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(model.metrics).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                    <span className={`font-medium ${getMetricColor(key, value)}`}>
                      {key === 'mape' ? `${value.toFixed(1)}%` : value.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground">
                  v{model.version}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            พยากรณ์
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <PieChart className="h-4 w-4" />
            รูปแบบ
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            โมเดล
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {analysisResult ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Anomaly Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    การตรวจจับความผิดปกติ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisResult.anomalies?.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      {a.is_anomaly ? (
                        <XCircle className="h-8 w-8 text-red-500" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    การจำแนกประเภท
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">
                        {analysisResult.classification?.loss_type_th}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ความน่าจะเป็น: {((analysisResult.classification?.probability || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="space-y-1">
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
                              <Progress value={(value as number) * 100} className="h-1" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    คำแนะนำ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.recommendations?.map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {rec.priority === 'high' ? 'สูง' : rec.priority === 'medium' ? 'กลาง' : 'ต่ำ'}
                        </Badge>
                        <div>
                          <p className="font-medium">{rec.message}</p>
                          <p className="text-sm text-muted-foreground">{rec.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">เริ่มการวิเคราะห์</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  คลิกปุ่ม "วิเคราะห์" เพื่อรัน AI analysis สำหรับ {selectedDma}
                </p>
                <Button onClick={runAnalysis} disabled={analyzing}>
                  <Zap className="h-4 w-4 mr-2" />
                  วิเคราะห์ตอนนี้
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>พยากรณ์น้ำสูญเสีย 7 วัน</CardTitle>
              <CardDescription>
                การคาดการณ์ปริมาณน้ำสูญเสียด้วย Time Series Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple bar chart visualization */}
                <div className="flex items-end gap-2 h-48">
                  {forecast.map((item, i) => {
                    const maxValue = Math.max(...forecast.map(f => f.upper));
                    const height = (item.value / maxValue) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col items-center">
                          <div
                            className="w-full bg-blue-200 rounded-t relative"
                            style={{ height: `${(item.upper / maxValue) * 160}px` }}
                          >
                            <div
                              className="absolute bottom-0 w-full bg-blue-500 rounded-t"
                              style={{ height: `${height * 1.6}px` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>คาดการณ์</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-200 rounded" />
                    <span>ช่วงความเชื่อมั่น 95%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>รูปแบบการใช้น้ำที่ตรวจพบ</CardTitle>
              <CardDescription>
                การจดจำรูปแบบด้วย Clustering Algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{pattern.label_th}</span>
                        <span className="text-sm text-muted-foreground">
                          {pattern.count} readings ({pattern.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={pattern.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models">
          <div className="grid gap-4 md:grid-cols-2">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{model.name_th}</CardTitle>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardDescription>{model.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium">v{model.version}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Trained</p>
                        <p className="font-medium">
                          {new Date(model.last_trained).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Performance Metrics</p>
                      <div className="space-y-2">
                        {Object.entries(model.metrics).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className={`text-sm font-medium ${getMetricColor(key, value)}`}>
                              {key === 'mape' || key === 'rmse' ? value.toFixed(1) : value.toFixed(2)}
                              {key === 'mape' && '%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
