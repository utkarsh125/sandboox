"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ShieldCheckIcon,
  ShieldWarningIcon,
  ArrowLeftIcon,
  BugIcon,
  WarningIcon,
  InfoIcon,
  CaretDownIcon,
  CaretUpIcon,
  PackageIcon,
  LockIcon,
  TagIcon,
  CircleNotchIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"
import axios from "axios"

// ─── Types ───────────────────────────────────────────────────────────
interface ReportData {
  project: { id: string; name: string }
  apk: {
    id: string
    fileName: string | null
    packageName: string | null
    versionName: string | null
    versionCode: number | null
    status: string
  }
  score: {
    value: number | null
    grade: string | null
    deductions: { reason: string; points: number; category: string }[]
  }
  severitySummary: {
    critical: number
    warning: number
    info: number
    total: number
  }
  vulnerabilities: Vulnerability[]
  permissions: Permission[]
  manifest: ManifestData
  completedAt: string
}

interface Vulnerability {
  ruleId: string
  severity: "ERROR" | "WARNING" | "INFO"
  message: string
  category: string
  owaspCategory: string | null
  cwe: string[]
}

interface Permission {
  name: string
  shortName: string
  risk: "dangerous" | "normal" | "signature"
}

interface ManifestData {
  packageName: string | null
  debuggable: boolean
  allowBackup: boolean
  usesCleartextTraffic: boolean
  networkSecurityConfig: boolean
  minSdkVersion: number | null
  targetSdkVersion: number | null
  exportedComponents: { name: string; type: string; intentFilters: number }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────
function gradeLabel(grade: string | null): string {
  switch (grade) {
    case "A": return "Excellent"
    case "B": return "Good"
    case "C": return "Moderate"
    case "D": return "Poor"
    case "F": return "Critical"
    default: return "Unrated"
  }
}

function scoreColor(score: number): string {
  if (score > 80) return "text-emerald-500"
  if (score > 60) return "text-amber-500"
  if (score > 40) return "text-orange-500"
  return "text-red-500"
}

// ─── Main Report Page ────────────────────────────────────────────────
export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"vulnerabilities" | "permissions" | "manifest">("vulnerabilities")

  const fetchReport = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${projectId}`,
        { withCredentials: true }
      )
      setReport(data)
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to load report"
      setError(errorMsg || "Failed to load report")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onBack={() => router.push("/dashboard/projects")} />
  if (!report) return null

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-8 space-y-8 animate-in fade-in duration-500">

        {/* Header Section */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon size={20} weight="bold" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {report.project.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-600">
                {report.apk.packageName || "Unknown"}
              </code>
              {report.apk.versionName && <span>· v{report.apk.versionName}</span>}
              {report.completedAt && (
                <span>
                  · Analyzed on {new Date(report.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Top Grid: Overview Stats & Recent Event Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SecurityOverview summary={report.severitySummary} />
          <QuickFindings findings={report.vulnerabilities} />
        </div>

        {/* Content Section: Detailed Tabs & Metrics Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <TabButton
                  active={activeTab === "vulnerabilities"}
                  icon={BugIcon}
                  label="Vulnerabilities"
                  count={report.vulnerabilities.length}
                  onClick={() => setActiveTab("vulnerabilities")}
                />
                <TabButton
                  active={activeTab === "permissions"}
                  icon={ShieldCheckIcon}
                  label="Permissions"
                  count={report.permissions.length}
                  onClick={() => setActiveTab("permissions")}
                />
                <TabButton
                  active={activeTab === "manifest"}
                  icon={PackageIcon}
                  label="Manifest Analysis"
                  onClick={() => setActiveTab("manifest")}
                />
              </div>

              {/* Tab Content */}
              <div className="p-8 flex-1">
                {activeTab === "vulnerabilities" && <VulnerabilityList vulnerabilities={report.vulnerabilities} />}
                {activeTab === "permissions" && <PermissionList permissions={report.permissions} />}
                {activeTab === "manifest" && <ManifestView manifest={report.manifest} />}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <TrustScore score={report.score.value} grade={report.score.grade} />
            {report.score.deductions.length > 0 && (
              <Deductions list={report.score.deductions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Layout Components ───────────────────────────────────────────────

function TabButton({ active, icon: Icon, label, count, onClick }: {
  active: boolean; icon: PhosphorIcon; label: string; count?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-5 flex items-center gap-3 text-sm font-bold transition-all border-b-2 outline-none cursor-pointer ${active
        ? "text-blue-600 border-blue-600 bg-white"
        : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100/30"
        }`}
    >
      <Icon size={18} weight={active ? "fill" : "bold"} />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
          }`}>
          {count}
        </span>
      )}
    </button>
  )
}

function SecurityOverview({ summary }: { summary: ReportData["severitySummary"] }) {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900">Security Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Detailed breakdown of total detected threats.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Critical" count={summary.critical} icon={ShieldWarningIcon} color="red" />
        <StatCard label="Warnings" count={summary.warning} icon={WarningIcon} color="amber" />
        <StatCard label="Info" count={summary.info} icon={InfoIcon} color="blue" />
      </div>
    </div>
  )
}

function StatCard({ label, count, icon: Icon, color }: { label: string; count: number; icon: PhosphorIcon; color: "red" | "amber" | "blue" }) {
  const styles = {
    red: "bg-red-50 text-red-500 border-red-100",
    amber: "bg-amber-50 text-amber-500 border-amber-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
  }
  return (
    <div className={`p-6 rounded-2xl border ${styles[color]} flex items-center gap-5 transition-transform hover:-translate-y-1`}>
      <div className="bg-white p-3 rounded-xl shadow-sm shrink-0">
        <Icon size={28} weight="duotone" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-2">{label}</p>
        <p className="text-3xl font-black leading-none tracking-tight">{count}</p>
      </div>
    </div>
  )
}

function QuickFindings({ findings }: { findings: Vulnerability[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Findings</h2>
      <div className="space-y-4">
        {findings.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center italic">No findings reported.</p>
        ) : (
          findings.slice(0, 5).map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-default">
              <div className={`shrink-0 mt-0.5 ${f.severity === "ERROR" ? "text-red-500" : "text-amber-500"}`}>
                {f.severity === "ERROR" ? <ShieldWarningIcon size={16} weight="fill" /> : <WarningIcon size={16} weight="fill" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-blue-100 transition-colors font-mono tracking-tight">{f.ruleId}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{f.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function TrustScore({ score, grade }: { score: number | null; grade: string | null }) {
  const percentage = score || 0
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (circumference * percentage) / 100
  const colorClass = scoreColor(percentage)

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center">
      <h2 className="text-lg font-bold text-slate-900 self-start mb-8 tracking-tight">Trust Score</h2>

      <div className="relative w-48 h-48 flex items-center justify-center scale-110 mb-8">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle cx="90" cy="90" r="80" strokeWidth="10" stroke="currentColor" fill="transparent" className="text-slate-100" />
          <circle
            cx="90" cy="90" r="80"
            strokeWidth="10" stroke="currentColor" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{percentage}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>

      <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
        <div className={`w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl font-black ${colorClass}`}>
          {grade || "–"}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Rating</p>
          <p className="text-sm font-bold text-slate-800 leading-none">{gradeLabel(grade)}</p>
        </div>
      </div>
    </div>
  )
}

function Deductions({ list }: { list: ReportData["score"]["deductions"] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Score Deductions</h2>
      <div className="space-y-3">
        {list.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-red-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              <span className="text-sm font-semibold text-slate-700 leading-tight">{d.reason}</span>
            </div>
            <span className="text-[11px] font-bold text-red-500 font-mono">-{d.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Inner Tab Components ───────────────────────────────────────────

function VulnerabilityList({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? vulnerabilities : vulnerabilities.slice(0, 5)

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
        <CheckCircleIcon size={48} weight="duotone" className="text-emerald-400" />
        <p className="text-sm font-medium italic">No vulnerabilities identified in this project.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayed.map((v, i) => (
        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex items-start gap-5">
          <div className={`p-2.5 rounded-xl shrink-0 ${v.severity === "ERROR" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
            {v.severity === "ERROR" ? <ShieldWarningIcon size={22} weight="fill" /> : <WarningIcon size={22} weight="fill" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-slate-800 text-sm font-mono tracking-tight">{v.ruleId}</h4>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${v.severity === "ERROR" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"
                }`}>
                {v.severity === "ERROR" ? "Critical" : "Warning"}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{v.message}</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                <TagIcon size={12} weight="bold" />
                <span className="text-[11px] font-bold font-mono tracking-tight">{v.category}</span>
              </div>
              {v.cwe.map(c => (
                <span key={c} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">CWE-{c}</span>
              ))}
              <div className="ml-auto flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer group">
                Full Analysis <ArrowRightIcon size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      ))}
      {vulnerabilities.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4"
        >
          {showAll ? (
            <><CaretUpIcon size={16} weight="bold" /> Show Less</>
          ) : (
            <><CaretDownIcon size={16} weight="bold" /> Show {vulnerabilities.length - 5} More Finding{vulnerabilities.length - 5 !== 1 ? 's' : ''}</>
          )}
        </button>
      )}
    </div>
  )
}

function PermissionList({ permissions }: { permissions: Permission[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? permissions : permissions.slice(0, 8)

  if (permissions.length === 0) {
    return <div className="text-sm text-slate-400 text-center py-20 italic">No permissions declared.</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayed.map((p, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 font-mono tracking-tight truncate">{p.shortName}</p>
              <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest truncate opacity-80 mt-1">{p.name}</p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${p.risk === "dangerous" ? "bg-red-50 text-red-500 border-red-100" :
              p.risk === "normal" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                "bg-blue-50 text-blue-500 border-blue-100"
              }`}>
              {p.risk}
            </span>
          </div>
        ))}
      </div>
      {permissions.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-4 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all cursor-pointer mt-4"
        >
          {showAll ? "Show Less" : `Show All ${permissions.length} Permissions`}
        </button>
      )}
    </div>
  )
}

function ManifestView({ manifest }: { manifest: ManifestData }) {
  const flags = [
    { label: "Debuggable", val: manifest.debuggable, bad: true, desc: "Controls if the app can be attached to a debugger." },
    { label: "Allow Backup", val: manifest.allowBackup, bad: true, desc: "Determines if app data is included in system backups." },
    { label: "Cleartext Traffic", val: manifest.usesCleartextTraffic, bad: true, desc: "Allows unencrypted HTTP network communication." },
    { label: "Network Security Config", val: !!manifest.networkSecurityConfig, bad: false, desc: "Custom configuration for secure network connections." },
  ]

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {flags.map(f => {
          const isAtRisk = f.val === f.bad
          return (
            <div key={f.label} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {isAtRisk ? <XCircleIcon size={20} weight="fill" className="text-red-500 mt-0.5" /> : <CheckCircleIcon size={20} weight="fill" className="text-emerald-500 mt-0.5" />}
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{f.label}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-1">{f.desc}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isAtRisk ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}>
                {isAtRisk ? "Exposed" : "Secure"}
              </span>
            </div>
          )
        })}
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-8">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Device Configuration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Package ID</p>
              <p className="text-sm font-bold text-slate-800 font-mono tracking-tight break-all leading-tight">{manifest.packageName || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Min API</p>
              <p className="text-sm font-bold text-slate-800 font-mono leading-tight">Android API {manifest.minSdkVersion || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Target API</p>
              <p className="text-sm font-bold text-slate-800 font-mono leading-tight">Android API {manifest.targetSdkVersion || "—"}</p>
            </div>
          </div>
        </div>

        {manifest.exportedComponents?.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Exposed Components ({manifest.exportedComponents.length})</h4>
            <div className="space-y-2.5">
              {manifest.exportedComponents.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md shrink-0">
                      {c.type}
                    </span>
                    <span className="text-sm font-bold text-slate-700 font-mono tracking-tight truncate">
                      {c.name}
                    </span>
                  </div>
                  {c.intentFilters > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-100 shrink-0">
                      <LockIcon size={12} weight="bold" className="text-amber-500" />
                      <span className="text-[11px] font-bold text-slate-600">{c.intentFilters} filter{c.intentFilters !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 h-screen">
      <CircleNotchIcon size={40} className="animate-spin text-blue-500" />
      <p className="text-sm font-bold text-slate-400 mt-6 animate-pulse">Running security audit...</p>
    </div>
  )
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 h-screen p-6">
      <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
        <ShieldWarningIcon size={32} weight="duotone" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Audit Unavailable</h3>
      <p className="text-sm text-slate-500 max-w-sm text-center mb-8 leading-relaxed">{error}</p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-slate-800 shadow-md shadow-slate-200 cursor-pointer"
      >
        <ArrowLeftIcon size={18} weight="bold" />
        Return to Dashboard
      </button>
    </div>
  )
}