'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'
import { Flame, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DAILY_ROUTE_CARD_GOAL } from '@/lib/study/types'
import { loadOrCreateDailyProgress, loadStreak } from '@/lib/study/daily'

export default function HomeStudySummary() {
  const [cardsGraded, setCardsGraded] = useState(0)
  const [routeDone, setRouteDone] = useState(false)
  const [streak, setStreak] = useState(0)

  const refresh = useCallback(async () => {
    const d = await loadOrCreateDailyProgress()
    const s = await loadStreak()
    setCardsGraded(d.cardsGraded)
    setRouteDone(d.routeDone)
    setStreak(s.streak)
  }, [])

  useEffect(() => {
    startTransition(() => {
      void refresh()
    })
    const on = () => {
      startTransition(() => {
        void refresh()
      })
    }
    window.addEventListener('nyan-study-updated', on)
    return () => window.removeEventListener('nyan-study-updated', on)
  }, [refresh])

  const pct = Math.min(100, Math.round((cardsGraded / DAILY_ROUTE_CARD_GOAL) * 100))

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Flame className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">连续打卡</p>
            <p className="text-2xl font-semibold tabular-nums">{streak} 天</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2 sm:max-w-xs">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="size-4 shrink-0" aria-hidden />
              今日路线
            </span>
            <span className="tabular-nums text-muted-foreground">
              {cardsGraded}/{DAILY_ROUTE_CARD_GOAL} 张
              {routeDone ? ' · 已完成' : ''}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
