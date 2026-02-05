"use client"

import React, { useState } from "react"

/* ============================
   Types
============================ */

interface Results {
  weeklyHours: number
  monthlyHours: number
  yearlyHours: number
  fullDays: number
  workDays: number
}

interface Alternative {
  id: string
  text: string
  category: string
  minHours: number
  maxHours: number
}

/* ============================
   Helpers
============================ */

const RECENT_KEY = "recent_time_cost_alternatives"
const TOLERANCE = 30

function shuffle<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5)
}

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch {
    return []
  }
}

function saveRecent(ids: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(-6)))
}

/* ============================
   Alternatives Dataset
============================ */

const alternatives: Alternative[] = [
  { id: "books", text: "read 8–10 average-length books", category: "Learning", minHours: 40, maxHours: 80 },
  { id: "language", text: "practice a language daily for 3–4 months", category: "Learning", minHours: 90, maxHours: 180 },
  { id: "excel", text: "learn basic Excel or spreadsheets", category: "Learning", minHours: 15, maxHours: 30 },
  { id: "typing", text: "learn touch typing properly", category: "Learning", minHours: 20, maxHours: 40 },
  { id: "project", text: "build a small personal project", category: "Learning", minHours: 30, maxHours: 100 },

  { id: "gym", text: "do 40–50 gym workouts", category: "Health", minHours: 40, maxHours: 75 },
  { id: "walk", text: "walk roughly 500–600 km", category: "Health", minHours: 100, maxHours: 150 },
  { id: "yoga", text: "practice yoga for several months", category: "Health", minHours: 50, maxHours: 100 },
  { id: "meditate", text: "meditate daily for half a year", category: "Health", minHours: 45, maxHours: 90 },

  { id: "journal", text: "journal daily for several months", category: "Wellbeing", minHours: 30, maxHours: 60 },
  { id: "attention", text: "gradually regain your attention span", category: "Wellbeing", minHours: 50, maxHours: 150 },

  { id: "deepwork", text: "complete 20–30 focused deep-work sessions", category: "Career", minHours: 40, maxHours: 90 },
  { id: "tool", text: "learn a new professional tool", category: "Career", minHours: 20, maxHours: 50 },

  { id: "creative", text: "start and maintain a creative habit", category: "Creative", minHours: 30, maxHours: 90 },
  { id: "music", text: "practice a musical instrument regularly", category: "Creative", minHours: 50, maxHours: 150 },

  { id: "declutter", text: "declutter your home properly", category: "Life", minHours: 20, maxHours: 50 },
  { id: "finance", text: "learn basic personal finance", category: "Life", minHours: 15, maxHours: 40 },

  { id: "friends", text: "reconnect with old friends", category: "Social", minHours: 20, maxHours: 50 },
  { id: "family", text: "call family regularly for a year", category: "Social", minHours: 25, maxHours: 60 },

  { id: "days", text: "live 7–10 full days of life", category: "Perspective", minHours: 168, maxHours: 240 },
  { id: "weeks", text: "gain 2–3 full work weeks", category: "Perspective", minHours: 80, maxHours: 120 },
]

/* ============================
   Selection Logic
============================ */

function getAlternatives(yearlyHours: number): Alternative[] {
  const recent = getRecent()

  const pool = shuffle(
    alternatives.filter(
      (a) =>
        yearlyHours >= a.minHours - TOLERANCE &&
        yearlyHours <= a.maxHours + TOLERANCE &&
        !recent.includes(a.id)
    )
  )

  const usable = pool.length ? pool : shuffle(alternatives)
  const categories = shuffle([...new Set(usable.map((u) => u.category))])

  const selected: Alternative[] = []

  for (const cat of categories) {
    if (selected.length >= 2) break
    const pick = usable.find((u) => u.category === cat && !selected.includes(u))
    if (pick) selected.push(pick)
  }

  saveRecent([...recent, ...selected.map((s) => s.id)])
  return selected
}

/* ============================
   Component
============================ */

export function TimeCostCalculator() {
  const [activity, setActivity] = useState("")
  const [timePerDay, setTimePerDay] = useState("")
  const [unit, setUnit] = useState<"minutes" | "hours">("minutes")
  const [daysPerWeek, setDaysPerWeek] = useState("") // placeholder visible
  const [results, setResults] = useState<Results | null>(null)
  const [alts, setAlts] = useState<Alternative[]>([])
  const [show, setShow] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculate = () => {
    setIsCalculating(true)
    setShow(false)

    setTimeout(() => {
      const t = parseFloat(timePerDay) || 0
      const d = parseFloat(daysPerWeek) || 7
      const hoursPerDay = unit === "minutes" ? t / 60 : t

      const weekly = hoursPerDay * d
      const monthly = weekly * 4.33
      const yearly = hoursPerDay * d * 52

      const res = {
        weeklyHours: +weekly.toFixed(1),
        monthlyHours: +monthly.toFixed(1),
        yearlyHours: +yearly.toFixed(1),
        fullDays: +(yearly / 24).toFixed(1),
        workDays: +(yearly / 8).toFixed(1),
      }

      setResults(res)
      setAlts(getAlternatives(res.yearlyHours))
      setIsCalculating(false)
      setShow(true)
    }, 300)
  }

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <h1 className="text-3xl font-light text-center mb-2">Time Cost Calculator</h1>
      <p className="text-center text-muted-foreground text-sm mb-10">
        No judgment. Just clarity.
      </p>

      <input
        placeholder="e.g., Scrolling Instagram"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        className="w-full mb-4 px-4 py-3 rounded-lg bg-secondary/50"
      />

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="30"
          value={timePerDay}
          onChange={(e) => setTimePerDay(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-secondary/50"
        />
        <select
          aria-label="Time unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value as any)}
          className="px-4 py-3 rounded-lg bg-secondary/50"
        >
          <option value="minutes">minutes</option>
          <option value="hours">hours</option>
        </select>
      </div>

      <input
        type="number"
        placeholder="7"
        min="1"
        max="7"
        value={daysPerWeek}
        onChange={(e) => setDaysPerWeek(e.target.value)}
        className="w-full mb-6 px-4 py-3 rounded-lg bg-secondary/50"
      />

      <button
        onClick={calculate}
        disabled={!timePerDay || isCalculating}
        className="w-full py-4 bg-sage text-white rounded-lg transition-all"
      >
        {isCalculating ? "Calculating…" : "Calculate"}
      </button>

      {results && (
        <div
          className={`mt-10 transition-all duration-700 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-center text-sm text-muted-foreground mb-6">
            {activity ? `"${activity}"` : "This"} adds up quietly.
          </p>

          <div className="space-y-4 mb-8">
            <Row label="Weekly" value={results.weeklyHours} />
            <Row label="Monthly" value={results.monthlyHours} />
            <Row label="Yearly" value={results.yearlyHours} />
          </div>

          <div className="bg-sage-light p-6 rounded-xl mb-8">
            <Eq label="full days" value={results.fullDays} />
            <Eq label="workdays" value={results.workDays} />
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            In that time, you could…
          </p>

          <div className="space-y-3">
            {alts.map((a) => (
              <div key={a.id} className="p-4 bg-secondary/30 rounded-lg">
                {a.text}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Small moments become seasons.
          </p>
        </div>
      )}
    </div>
  )
}

/* ============================
   UI Helpers
============================ */

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-2xl font-light">{value} hrs</span>
    </div>
  )
}

function Eq({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-xl font-light text-sage">{value}</span>
    </div>
  )
}
