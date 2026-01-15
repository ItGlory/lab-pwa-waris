'use client';

import * as React from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Wifi,
  HardDrive,
  Clock,
  Brain,
  Plus,
  X,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  latency?: number;
  icon: React.ElementType;
}

const systemStatuses: SystemStatus[] = [
  { name: 'API Server', status: 'online', latency: 45, icon: Server },
  { name: 'Database', status: 'online', latency: 12, icon: Database },
  { name: 'AI Engine', status: 'online', latency: 89, icon: HardDrive },
  { name: 'SCADA Connection', status: 'warning', latency: 250, icon: Wifi },
];

export default function SettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Settings state
  const [settings, setSettings] = React.useState({
    // Profile
    name: 'ผู้ดูแลระบบ',
    email: 'admin@pwa.co.th',
    phone: '02-123-4567',
    department: 'ฝ่ายควบคุมน้ำสูญเสีย',

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    alertThreshold: 'medium',
    dailyReport: true,
    weeklyDigest: true,

    // Display
    language: 'th',
    dateFormat: 'buddhist',
    timezone: 'Asia/Bangkok',
    theme: 'light',

    // System
    autoRefresh: true,
    refreshInterval: '30',
    dataRetention: '365',
    debugMode: false,
  });

  // AI Settings state
  const [aiSettings, setAiSettings] = React.useState({
    llmProvider: 'openrouter',
    llmModel: 'qwen/qwen-2.5-72b-instruct',
    temperature: 0.7,
    maxTokens: 4096,
    streamEnabled: true,
    ragEnabled: true,
    ragTopK: 5,
    guardrailEnabled: true,
  });
  const [blockedTopics, setBlockedTopics] = React.useState([
    'การเมือง', 'ศาสนา', 'เรื่องเพศ', 'ความรุนแรงทางกาย', 'สารเสพติด'
  ]);
  const [allowedDomains, setAllowedDomains] = React.useState([
    'น้ำสูญเสีย', 'NRW', 'DMA', 'ท่อ', 'มิเตอร์', 'ความดัน', 'กปภ', 'ประปา', 'รายงาน', 'แจ้งเตือน'
  ]);
  const [newBlockedTopic, setNewBlockedTopic] = React.useState('');
  const [newAllowedDomain, setNewAllowedDomain] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateAiSetting = <K extends keyof typeof aiSettings>(
    key: K,
    value: (typeof aiSettings)[K]
  ) => {
    setAiSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addBlockedTopic = () => {
    if (newBlockedTopic.trim() && !blockedTopics.includes(newBlockedTopic.trim())) {
      setBlockedTopics([...blockedTopics, newBlockedTopic.trim()]);
      setNewBlockedTopic('');
    }
  };

  const removeBlockedTopic = (topic: string) => {
    setBlockedTopics(blockedTopics.filter(t => t !== topic));
  };

  const addAllowedDomain = () => {
    if (newAllowedDomain.trim() && !allowedDomains.includes(newAllowedDomain.trim())) {
      setAllowedDomains([...allowedDomains, newAllowedDomain.trim()]);
      setNewAllowedDomain('');
    }
  };

  const removeAllowedDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter(d => d !== domain));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่า</h1>
          <p className="text-muted-foreground">
            จัดการการตั้งค่าระบบและโปรไฟล์ผู้ใช้
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              บันทึกแล้ว
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              บันทึกการเปลี่ยนแปลง
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4 hidden sm:inline" />
                โปรไฟล์
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4 hidden sm:inline" />
                แจ้งเตือน
              </TabsTrigger>
              <TabsTrigger value="display" className="gap-2">
                <Palette className="h-4 w-4 hidden sm:inline" />
                การแสดงผล
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Settings className="h-4 w-4 hidden sm:inline" />
                ระบบ
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Brain className="h-4 w-4 hidden sm:inline" />
                AI
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลผู้ใช้</CardTitle>
                  <CardDescription>
                    จัดการข้อมูลส่วนตัวและการติดต่อ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => updateSetting('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">หน่วยงาน</Label>
                      <Input
                        id="department"
                        value={settings.department}
                        onChange={(e) => updateSetting('department', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-9"
                          value={settings.email}
                          onChange={(e) => updateSetting('email', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">โทรศัพท์</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-9"
                          value={settings.phone}
                          onChange={(e) => updateSetting('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    ความปลอดภัย
                  </CardTitle>
                  <CardDescription>
                    จัดการรหัสผ่านและการยืนยันตัวตน
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    เปลี่ยนรหัสผ่าน
                  </Button>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">การยืนยันตัวตนสองขั้นตอน (2FA)</p>
                      <p className="text-sm text-muted-foreground">
                        เพิ่มความปลอดภัยให้บัญชีของคุณ
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      ตั้งค่า
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ช่องทางการแจ้งเตือน</CardTitle>
                  <CardDescription>
                    เลือกวิธีการรับการแจ้งเตือนจากระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">อีเมล</p>
                        <p className="text-sm text-muted-foreground">
                          รับการแจ้งเตือนทางอีเมล
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(v) => updateSetting('emailNotifications', v)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-sm text-muted-foreground">
                          รับการแจ้งเตือนทาง SMS
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(v) => updateSetting('smsNotifications', v)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notification</p>
                        <p className="text-sm text-muted-foreground">
                          รับการแจ้งเตือนบนเบราว์เซอร์
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(v) => updateSetting('pushNotifications', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ตั้งค่าการแจ้งเตือน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ระดับความรุนแรงขั้นต่ำ</Label>
                    <Select
                      value={settings.alertThreshold}
                      onValueChange={(v) => updateSetting('alertThreshold', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">ทั้งหมด (รวมระดับต่ำ)</SelectItem>
                        <SelectItem value="medium">ปานกลางขึ้นไป</SelectItem>
                        <SelectItem value="high">สูงขึ้นไป</SelectItem>
                        <SelectItem value="critical">วิกฤตเท่านั้น</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">รายงานประจำวัน</p>
                      <p className="text-sm text-muted-foreground">
                        รับสรุปรายงานทุกเช้า 08:00 น.
                      </p>
                    </div>
                    <Switch
                      checked={settings.dailyReport}
                      onCheckedChange={(v) => updateSetting('dailyReport', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">สรุปรายสัปดาห์</p>
                      <p className="text-sm text-muted-foreground">
                        รับสรุปภาพรวมทุกวันจันทร์
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(v) => updateSetting('weeklyDigest', v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ภาษาและภูมิภาค</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>ภาษา</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(v) => updateSetting('language', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="th">ไทย</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>เขตเวลา</Label>
                      <Select
                        value={settings.timezone}
                        onValueChange={(v) => updateSetting('timezone', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Bangkok">
                            กรุงเทพฯ (UTC+7)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>รูปแบบวันที่</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(v) => updateSetting('dateFormat', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buddhist">
                          พ.ศ. (15 ม.ค. 2568)
                        </SelectItem>
                        <SelectItem value="gregorian">
                          ค.ศ. (15 Jan 2025)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ธีม</CardTitle>
                  <CardDescription>
                    เลือกรูปแบบการแสดงผลของระบบ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { value: 'light', label: 'สว่าง', icon: '☀️' },
                      { value: 'dark', label: 'มืด', icon: '🌙' },
                      { value: 'system', label: 'ตามระบบ', icon: '💻' },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                          settings.theme === theme.value
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <span className="text-2xl">{theme.icon}</span>
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าระบบ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">รีเฟรชอัตโนมัติ</p>
                      <p className="text-sm text-muted-foreground">
                        อัปเดตข้อมูลอัตโนมัติบนแดชบอร์ด
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoRefresh}
                      onCheckedChange={(v) => updateSetting('autoRefresh', v)}
                    />
                  </div>
                  {settings.autoRefresh && (
                    <div className="space-y-2">
                      <Label>ความถี่ในการรีเฟรช</Label>
                      <Select
                        value={settings.refreshInterval}
                        onValueChange={(v) => updateSetting('refreshInterval', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">ทุก 15 วินาที</SelectItem>
                          <SelectItem value="30">ทุก 30 วินาที</SelectItem>
                          <SelectItem value="60">ทุก 1 นาที</SelectItem>
                          <SelectItem value="300">ทุก 5 นาที</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Separator />
                  <div className="space-y-2">
                    <Label>การเก็บรักษาข้อมูล</Label>
                    <Select
                      value={settings.dataRetention}
                      onValueChange={(v) => updateSetting('dataRetention', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 วัน</SelectItem>
                        <SelectItem value="180">180 วัน</SelectItem>
                        <SelectItem value="365">1 ปี</SelectItem>
                        <SelectItem value="730">2 ปี</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">โหมด Debug</p>
                      <p className="text-sm text-muted-foreground">
                        แสดงข้อมูลสำหรับนักพัฒนา
                      </p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(v) => updateSetting('debugMode', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    ข้อมูลและการสำรอง
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">ส่งออกข้อมูล</p>
                      <p className="text-sm text-muted-foreground">
                        ดาวน์โหลดข้อมูลทั้งหมดของคุณ
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      ส่งออก
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div>
                      <p className="font-medium text-amber-800">ล้างแคช</p>
                      <p className="text-sm text-amber-600">
                        ลบข้อมูลแคชทั้งหมด
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      ล้างแคช
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  ตั้งค่า AI สำหรับผู้ดูแลระบบ - การเปลี่ยนแปลงจะมีผลทันทีกับการทำงานของ AI Assistant
                </AlertDescription>
              </Alert>

              {/* LLM Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    ตั้งค่า LLM
                  </CardTitle>
                  <CardDescription>
                    กำหนดค่าโมเดลภาษาขนาดใหญ่สำหรับ AI Assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select
                        value={aiSettings.llmProvider}
                        onValueChange={(v) => updateAiSetting('llmProvider', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                          <SelectItem value="auto">Auto (Fallback)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select
                        value={aiSettings.llmModel}
                        onValueChange={(v) => updateAiSetting('llmModel', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (แนะนำ)</SelectItem>
                          <SelectItem value="scb10x/llama3.1-typhoon2-70b-instruct">Typhoon 2 70B (ภาษาไทยดีเยี่ยม)</SelectItem>
                          <SelectItem value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</SelectItem>
                          <SelectItem value="mistralai/mixtral-8x22b-instruct">Mixtral 8x22B</SelectItem>
                          <SelectItem value="qwen/qwen-2.5-7b-instruct">Qwen 2.5 7B (เบา)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature: {aiSettings.temperature.toFixed(1)}</Label>
                      <span className="text-xs text-muted-foreground">
                        ค่าต่ำ = แม่นยำ, ค่าสูง = สร้างสรรค์
                      </span>
                    </div>
                    <Slider
                      value={[aiSettings.temperature]}
                      onValueChange={(v) => updateAiSetting('temperature', v[0])}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Max Tokens: {aiSettings.maxTokens}</Label>
                    </div>
                    <Slider
                      value={[aiSettings.maxTokens]}
                      onValueChange={(v) => updateAiSetting('maxTokens', v[0])}
                      min={256}
                      max={8192}
                      step={256}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Streaming Response</p>
                      <p className="text-sm text-muted-foreground">
                        แสดงคำตอบแบบเรียลไทม์
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.streamEnabled}
                      onCheckedChange={(v) => updateAiSetting('streamEnabled', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* RAG Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    ตั้งค่า RAG
                  </CardTitle>
                  <CardDescription>
                    Retrieval-Augmented Generation สำหรับค้นหาความรู้
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">เปิดใช้งาน RAG</p>
                      <p className="text-sm text-muted-foreground">
                        ค้นหาข้อมูลจากฐานความรู้ก่อนตอบ
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.ragEnabled}
                      onCheckedChange={(v) => updateAiSetting('ragEnabled', v)}
                    />
                  </div>

                  {aiSettings.ragEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Top-K Results: {aiSettings.ragTopK}</Label>
                        <span className="text-xs text-muted-foreground">
                          จำนวนเอกสารที่ดึงมา
                        </span>
                      </div>
                      <Slider
                        value={[aiSettings.ragTopK]}
                        onValueChange={(v) => updateAiSetting('ragTopK', v[0])}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guardrails */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Guardrails
                  </CardTitle>
                  <CardDescription>
                    กำหนดหัวข้อที่บล็อกและโดเมนที่อนุญาต
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">เปิดใช้งาน Guardrails</p>
                      <p className="text-sm text-muted-foreground">
                        กรองคำถามที่ไม่เกี่ยวข้องกับระบบ
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.guardrailEnabled}
                      onCheckedChange={(v) => updateAiSetting('guardrailEnabled', v)}
                    />
                  </div>

                  {aiSettings.guardrailEnabled && (
                    <>
                      <Separator />

                      {/* Blocked Topics */}
                      <div className="space-y-3">
                        <Label className="text-destructive">หัวข้อที่บล็อก</Label>
                        <div className="flex flex-wrap gap-2">
                          {blockedTopics.map((topic) => (
                            <Badge key={topic} variant="destructive" className="gap-1">
                              {topic}
                              <button
                                onClick={() => removeBlockedTopic(topic)}
                                className="ml-1 hover:bg-destructive/80 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="เพิ่มหัวข้อที่ต้องการบล็อก..."
                            value={newBlockedTopic}
                            onChange={(e) => setNewBlockedTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addBlockedTopic()}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={addBlockedTopic}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Allowed Domains */}
                      <div className="space-y-3">
                        <Label className="text-emerald-600">โดเมนที่อนุญาต</Label>
                        <div className="flex flex-wrap gap-2">
                          {allowedDomains.map((domain) => (
                            <Badge key={domain} variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700">
                              {domain}
                              <button
                                onClick={() => removeAllowedDomain(domain)}
                                className="ml-1 hover:bg-emerald-200 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="เพิ่มโดเมนที่อนุญาต..."
                            value={newAllowedDomain}
                            onChange={(e) => setNewAllowedDomain(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addAllowedDomain()}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={addAllowedDomain}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* System Status Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                สถานะระบบ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatuses.map((system) => {
                const Icon = system.icon;
                const statusColors = {
                  online: 'bg-emerald-500',
                  offline: 'bg-red-500',
                  warning: 'bg-amber-500',
                };
                const statusLabels = {
                  online: 'ออนไลน์',
                  offline: 'ออฟไลน์',
                  warning: 'ช้า',
                };
                return (
                  <div key={system.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{system.name}</p>
                        {system.latency && (
                          <p className="text-xs text-muted-foreground">
                            {system.latency}ms
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${statusColors[system.status]}`} />
                      <span className="text-xs">{statusLabels[system.status]}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ข้อมูลเซสชัน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">เข้าสู่ระบบเมื่อ</span>
                <span>09:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address</span>
                <span>192.168.1.xxx</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">อุปกรณ์</span>
                <span>Chrome / macOS</span>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                ออกจากระบบทุกอุปกรณ์
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>เวอร์ชัน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">WARIS Platform</span>
                <span>v2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Engine</span>
                <span>v1.5.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                <span>5 ม.ค. 2568</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
