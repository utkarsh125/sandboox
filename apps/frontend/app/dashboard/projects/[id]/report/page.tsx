"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ShieldCheck,
  ShieldWarning,
  ArrowLeft,
  Bug,
  Lock,
  Warning,
  Info,
  CaretDown,
  CaretUp,
  Package,
  Globe,
  Code,
  FingerprintSimple,
  CircleNotch,
  Robot
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
  categories: { name: string; count: number }[]
  vulnerabilities: Vulnerability[]
  permissions: Permission[]
  permissionsSummary: {
    total: number
    dangerous: number
    normal: number
    signature: number
  }
  manifest: ManifestData
  completedAt: string
}

interface Vulnerability {
  ruleId: string
  severity: "ERROR" | "WARNING" | "INFO"
  message: string
  filePath: string
  lineStart: number
  lineEnd: number
  code: string
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

// ─── Main Report Page ────────────────────────────────────────────────
export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"vulnerabilities" | "permissions" | "manifest">("vulnerabilities")

  useEffect(() => {
    fetchReport()
  }, [projectId])

  const fetchReport = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${projectId}`,
        { withCredentials: true }
      )
      setReport(data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onBack={() => router.push("/dashboard/projects")} />
  if (!report) return null

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer group"
          >
            <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{report.project.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              {report.apk.packageName || "Unknown Package"} • v{report.apk.versionName || "?"}
              {report.completedAt && ` • Analyzed ${new Date(report.completedAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Score + Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScoreCard score={report.score.value} grade={report.score.grade} />
          <SummaryCard
            icon={<Bug size={20} weight="duotone" />}
            label="Critical"
            value={report.severitySummary.critical}
            color="red"
          />
          <SummaryCard
            icon={<Warning size={20} weight="duotone" />}
            label="Warnings"
            value={report.severitySummary.warning}
            color="amber"
          />
          <SummaryCard
            icon={<Info size={20} weight="duotone" />}
            label="Info"
            value={report.severitySummary.info}
            color="blue"
          />
        </div>

        {/* Category Breakdown + Score Deductions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryBreakdown categories={report.categories} />
          <ScoreDeductions deductions={report.score.deductions} />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 flex w-fit shadow-sm">
          {[
            { key: "vulnerabilities" as const, label: "Vulnerabilities", icon: <Bug size={16} /> },
            { key: "permissions" as const, label: "Permissions", icon: <ShieldCheck size={16} /> },
            { key: "manifest" as const, label: "Manifest", icon: <Package size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "vulnerabilities" && <VulnerabilityTable findings={report.vulnerabilities} />}
          {activeTab === "permissions" && <PermissionsGrid permissions={report.permissions} summary={report.permissionsSummary} />}
          {activeTab === "manifest" && <ManifestInsights manifest={report.manifest} />}
        </div>
      </div>
    </div>
  )
}

// ─── Score Card ──────────────────────────────────────────────────────
function ScoreCard({ score, grade }: { score: number | null; grade: string | null }) {
  const gradeStyles = {
    A: { color: "text-emerald-600 bg-emerald-50 border-emerald-200", ring: "stroke-emerald-600" },
    B: { color: "text-blue-600 bg-blue-50 border-blue-200", ring: "stroke-blue-600" },
    C: { color: "text-amber-600 bg-amber-50 border-amber-200", ring: "stroke-amber-600" },
    D: { color: "text-orange-600 bg-orange-50 border-orange-200", ring: "stroke-orange-600" },
    F: { color: "text-red-600 bg-red-50 border-red-200", ring: "stroke-red-600" },
  }
  const currentStyle = gradeStyles[grade as keyof typeof gradeStyles] || gradeStyles.F

  const circumference = 2 * Math.PI * 40
  const pct = Math.max(0, Math.min(100, score || 0))
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className={`rounded-2xl border p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md h-[120px] bg-white`}>
      <div className="relative w-[85px] h-[85px] shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            className={`${currentStyle.ring} transition-all duration-1000 ease-out`}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-black ${currentStyle.color.split(" ")[0]}`}>{grade || "F"}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
        <p className="text-4xl font-black text-gray-900 tracking-tighter">
          {Math.round(score || 0)}
          <span className="text-lg font-bold text-gray-300 ml-1">/100</span>
        </p>
      </div>
    </div>
  )
}

// ─── Summary Card ────────────────────────────────────────────────────
function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    red: "text-red-600 bg-red-50 border-red-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
  }
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md h-[120px] bg-white flex flex-col justify-between`}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-4xl font-black text-gray-900 tracking-tighter self-end">{value}</p>
    </div>
  )
}

// ─── Category Breakdown ──────────────────────────────────────────────
function CategoryBreakdown({ categories }: { categories: { name: string; count: number }[] }) {
  const max = Math.max(...categories.map(c => c.count), 1)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Threat Categories</h3>
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 opacity-40">
          <ShieldCheck size={32} weight="duotone" />
          <p className="text-sm font-medium mt-2">Zero threats detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.name} className="group">
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5 px-0.5">
                <span>{cat.name}</span>
                <span>{cat.count}</span>
              </div>
              <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(cat.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Score Deductions ────────────────────────────────────────────────
function ScoreDeductions({ deductions }: { deductions: { reason: string; points: number; category: string }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Penalties</h3>
      <div className="space-y-3">
        {deductions.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100 transition-hover hover:border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">{d.category}</span>
              <span className="text-sm font-bold text-gray-700 truncate">{d.reason}</span>
            </div>
            <span className="text-sm font-black text-red-600 shrink-0 ml-4">−{d.points}</span>
          </div>
        ))}
        {deductions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-emerald-600">
            <div className="p-3 bg-emerald-50 rounded-2xl mb-3">
              <ShieldCheck size={32} weight="duotone" />
            </div>
            <p className="text-sm font-bold">Perfect Score. No Penalties.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vulnerability Table ─────────────────────────────────────────────
function VulnerabilityTable({ findings }: { findings: Vulnerability[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  
  return (
    <div className="space-y-3">
      {findings.map((v, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
          <button 
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full px-6 py-4 flex items-center gap-4 text-left cursor-pointer group"
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              v.severity === "ERROR" ? "bg-red-50 text-red-600" :
              v.severity === "WARNING" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
            }`}>
              {v.severity === "ERROR" ? <Bug size={20} weight="bold" /> : 
               v.severity === "WARNING" ? <Warning size={20} weight="bold" /> : <Info size={20} weight="bold" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{v.category}</span>
                {v.owaspCategory && (
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{v.owaspCategory}</span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-900 truncate pr-4">{v.message}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900 transition-all shrink-0">
              {expanded === i ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
            </div>
          </button>
          
          {expanded === i && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-50 flex flex-col items-start gap-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">File Location</p>
                    <p className="text-xs font-bold text-gray-700 truncate">{v.filePath}:{v.lineStart}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">CWE ID</p>
                    <p className="text-xs font-bold text-gray-700 italic">{v.cwe.join(", ") || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl col-span-1 md:col-span-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Rule</p>
                    <p className="text-xs font-bold text-gray-500 truncate">{v.ruleId}</p>
                  </div>
               </div>
               
               <div className="w-full">
                 <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Source Context</p>
                   <span className="text-[10px] font-bold text-gray-300">LINES {v.lineStart}-{v.lineEnd}</span>
                 </div>
                 <div className="bg-gray-900 rounded-2xl p-4 overflow-x-auto border-4 border-gray-800 shadow-inner group">
                   <code className="text-xs font-mono text-emerald-400 break-words leading-relaxed">
                     {v.code}
                   </code>
                 </div>
               </div>

               <AIAssistant finding={v} />
            </div>
          )}
        </div>
      ))}
      {findings.length === 0 && (
         <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-16 flex flex-col items-center justify-center opacity-60">
            <ShieldCheck size={48} weight="duotone" className="text-emerald-500 mb-4" />
            <h4 className="text-lg font-black text-gray-900">Scan Clean</h4>
            <p className="text-sm font-bold text-gray-500">No static analysis vulnerabilities matched.</p>
         </div>
      )}
    </div>
  )
}

// ─── AI Assistant Component ──────────────────────────────────────────
function AIAssistant({ finding }: { finding: Vulnerability }) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleExplain = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/explain/vulnerability`,
        { vulnerability: finding },
        { withCredentials: true }
      )
      setExplanation(data.explanation)
    } catch (err) {
      setExplanation("## Error\nFailed to reach the security assistant.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden mt-2">
      <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="p-1.5 bg-gray-900 rounded-lg text-white">
             <Robot size={16} weight="bold" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest text-gray-900">Security Assistant</span>
         </div>
         <button 
           onClick={handleExplain}
           disabled={loading || !!explanation}
           className="text-[10px] font-black uppercase bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
         >
           {loading ? "Analyzing..." : explanation ? "Analysis Complete" : "Deep Analysis"}
         </button>
      </div>
      
      {explanation && (
        <div className="p-6 space-y-4">
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-medium 
                        prose-headings:text-gray-900 prose-headings:font-black prose-headings:uppercase prose-headings:text-xs prose-headings:tracking-widest
                        prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:border-0 prose-code:text-emerald-400">
            {/* Simple split rendering for structured content */}
            {explanation.split("##").map((section, si) => {
              if (!section.trim()) return null
              const [title, ...rest] = section.split("\n")
              return (
                <div key={si} className="animate-in fade-in slide-in-from-top-1 duration-500">
                  <h4 className="flex items-center gap-2 mb-2 text-gray-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                    {title}
                  </h4>
                  <div className="pl-3.5 border-l-2 border-slate-200 text-slate-600 whitespace-pre-wrap mb-6">
                    {rest.join("\n").trim()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="p-12 flex flex-col items-center justify-center space-y-3">
          <CircleNotch size={24} className="animate-spin text-gray-900" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Consulting Gemini Expert...</p>
        </div>
      )}
    </div>
  )
}

// ─── Permissions Grid ────────────────────────────────────────────────
function PermissionsGrid({ permissions, summary }: { permissions: Permission[]; summary: any }) {
  const getStyle = (risk: string) => {
    switch (risk) {
      case "dangerous": return "bg-red-50 text-red-700 border-red-200 shadow-red-100"
      case "signature": return "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100"
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Dangerous", val: summary.dangerous, color: "text-red-600" },
          { label: "Signature", val: summary.signature, color: "text-amber-600" },
          { label: "Normal", val: summary.normal, color: "text-emerald-600" },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
             <p className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.val}</p>
             <p className="text-[10px] font-black uppercase text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-wrap gap-2.5">
        {permissions.map((p, i) => (
          <div 
            key={i} 
            className={`px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-105 ${getStyle(p.risk)}`}
          >
            {p.shortName}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Manifest Insights ───────────────────────────────────────────────
function ManifestInsights({ manifest }: { manifest: ManifestData }) {
  const flags = [
    { label: "Debug Mode", val: manifest.debuggable, bad: true, desc: "Enabled allows runtime attachment" },
    { label: "Local Backup", val: manifest.allowBackup, bad: true, desc: "Allows full data extraction via ADB" },
    { label: "Cleartext (HTTP)", val: manifest.usesCleartextTraffic, bad: true, desc: "Transmits data over unencrypted channels" },
    { label: "Net Security Config", val: !!manifest.networkSecurityConfig, bad: false, desc: "Custom cert pinning configuration" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map(f => (
          <div key={f.label} className="bg-white rounded-2x border border-gray-200 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-1">{f.label}</p>
              <p className="text-[10px] font-bold text-gray-400">{f.desc}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm border-2 ${
              f.val === f.bad ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              {f.val === f.bad ? "EXPOSED" : "SECURE"}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Device Configuration</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Package Name</p>
            <p className="text-xs font-bold text-gray-900 font-mono break-all">{manifest.packageName}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Min API Level</p>
            <p className="text-xs font-bold text-gray-900">SDK {manifest.minSdkVersion}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Target SDK</p>
            <p className="text-xs font-bold text-gray-900">SDK {manifest.targetSdkVersion}</p>
          </div>
        </div>
      </div>
      
      {manifest.exportedComponents?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Exposed Gateways</h3>
          <div className="space-y-3">
            {manifest.exportedComponents.map((comp, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">{comp.type}</span>
                  <span className="text-xs font-bold text-slate-700 font-mono truncate max-w-sm">{comp.name}</span>
                </div>
                {comp.intentFilters > 0 && (
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                     <Lock size={12} weight="bold" className="text-amber-600" />
                     <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">{comp.intentFilters} Filters</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Loading / Error States ──────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen">
      <div className="relative">
        <CircleNotch size={48} className="animate-spin text-gray-900" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-6 animate-pulse">Decompiling Report Structure...</p>
    </div>
  )
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen">
      <div className="p-4 bg-red-50 rounded-3xl border-4 border-white shadow-xl mb-6">
        <ShieldWarning size={48} weight="duotone" className="text-red-500" />
      </div>
      <p className="text-lg font-black text-gray-900 tracking-tight mb-2">Analysis Access Denied</p>
      <p className="text-sm font-bold text-gray-400 max-w-xs text-center mb-8 whitespace-pre-wrap">{error}</p>
      <button
        onClick={onBack}
        className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-gray-200 transition-all hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ArrowLeft size={16} weight="bold" className="transition-transform group-hover:-translate-x-1" />
        Return to Safety
      </button>
    </div>
  )
}
