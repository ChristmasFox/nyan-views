'use client'

import Link from 'next/link'
import { BookOpen, Mic, Keyboard, CalendarCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import HomeStudySummary from '@/components/study/HomeStudySummary'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-medium text-muted-foreground">JLPT 词汇 · 间隔复习</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            日语词汇训练
          </h1>
          <p className="max-w-xl text-muted-foreground leading-relaxed">
            从 N5 起步，循序渐进覆盖 N4 / N3 / N2 常用词。卡片式复习、标准发音、打字或语音作答（语音模式支持重试与打字过关）。进度保存在本机，无需登录。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full min-h-11 sm:w-auto">
              <Link href="/study">开始复习</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full min-h-11 sm:w-auto">
              <Link href="/study">今日路线</Link>
            </Button>
          </div>
        </header>

        <HomeStudySummary />

        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Keyboard className="size-5" aria-hidden />
                <CardTitle className="text-lg">打字模式</CardTitle>
              </div>
              <CardDescription>
                仅通过日文输入完成作答，适合安静环境或识别不稳定时。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Mic className="size-5" aria-hidden />
                <CardTitle className="text-lg">语音模式</CardTitle>
              </div>
              <CardDescription>
                先跟读识别，支持重试；仍不过可用打字过关，不中断复习节奏。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="size-5" aria-hidden />
                <CardTitle className="text-lg">级别与混选</CardTitle>
              </div>
              <CardDescription>
                按 N5～N2 标签选题；可单级别或混选，词表持续扩展中。
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <CalendarCheck className="size-5" aria-hidden />
                <CardTitle className="text-lg">每日路线 · 打卡</CardTitle>
              </div>
              <CardDescription>
                本地记录学习节奏与连续打卡，换设备前请知悉数据仅存本浏览器。
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
              <span>答对时有轻松音效反馈（学习页可关闭；系统减少动效时会静音）。复习采用 SM-2 间隔重复，发音使用浏览器朗读。</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
