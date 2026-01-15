'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  FlaskConical,
  FileText,
  ArrowRight,
  Settings,
  Activity,
  Database,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const adminModules = [
  {
    title: 'จัดการผู้ใช้',
    titleEn: 'User Management',
    description: 'เพิ่ม ลบ แก้ไข และจัดการสิทธิ์ผู้ใช้งานในระบบ',
    href: '/admin/users',
    icon: Users,
    badge: null,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'ฐานความรู้',
    titleEn: 'Knowledge Base',
    description: 'จัดการเอกสารและข้อมูลสำหรับระบบ RAG',
    href: '/admin/knowledge-base',
    icon: BookOpen,
    badge: null,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'ฝึกสอนโมเดล',
    titleEn: 'Model Training',
    description: 'ฝึกสอนและปรับแต่งโมเดล AI สำหรับการวิเคราะห์',
    href: '/admin/training',
    icon: GraduationCap,
    badge: null,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'ทดสอบ POC',
    titleEn: 'POC Test',
    description: 'ทดสอบระบบ RAG และ AI ด้วยคำถาม POC',
    href: '/admin/poc-test',
    icon: FlaskConical,
    badge: 'ใหม่',
    color: 'from-amber-500 to-amber-600',
  },
  {
    title: 'System Audit',
    titleEn: 'System Audit',
    description: 'ตรวจสอบ logs และกิจกรรมในระบบ',
    href: '/admin/audit',
    icon: FileText,
    badge: null,
    color: 'from-rose-500 to-rose-600',
  },
];

const systemStats = [
  { label: 'ผู้ใช้ทั้งหมด', value: '24', icon: Users },
  { label: 'เอกสาร KM', value: '12', icon: Database },
  { label: 'โมเดล AI', value: '4', icon: Activity },
  { label: 'API Calls/วัน', value: '1.2K', icon: Settings },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pwa-cyan)] to-[var(--pwa-blue-deep)] shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ผู้ดูแลระบบ</h1>
            <p className="text-sm text-muted-foreground">Administration Panel</p>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Modules */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">เครื่องมือจัดการ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="group h-full cursor-pointer border-border/50 transition-all duration-300 hover:border-[var(--pwa-cyan)]/50 hover:shadow-lg hover:shadow-[var(--pwa-cyan)]/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {module.badge && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-3 text-base group-hover:text-[var(--pwa-cyan)]">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {module.titleEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-[var(--pwa-cyan)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      เข้าใช้งาน
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">
              ข้อควรระวัง
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              หน้านี้สำหรับผู้ดูแลระบบเท่านั้น การเปลี่ยนแปลงการตั้งค่าอาจส่งผลกระทบต่อระบบทั้งหมด
              กรุณาดำเนินการด้วยความระมัดระวัง
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
