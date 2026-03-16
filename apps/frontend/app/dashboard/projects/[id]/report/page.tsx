"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShieldCheckIcon,
    ShieldWarningIcon,
    ArrowLeftIcon,
    BugIcon,
    PackageIcon,
    LockIcon,
    TagIcon,
    CircleNotchIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    XCircleIcon,
    DownloadIcon,
    CaretDownIcon,
    CaretUpIcon,
    WarningIcon,
    InfoIcon,
    type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import axios from "axios";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SecurityReportPDF } from "@/app/dashboard/components/ReportPDF";

// ─── Types ───────────────────────────────────────────────────────────
interface ReportData {
    project: { id: string; name: string };
    apk: {
        id: string;
        fileName: string | null;
        packageName: string | null;
        versionName: string | null;
        versionCode: number | null;
        status: string;
    };
    score: {
        value: number | null;
        grade: string | null;
        deductions: { reason: string; points: number; category: string }[];
    };
    severitySummary: {
        critical: number;
        warning: number;
        info: number;
        total: number;
    };
    vulnerabilities: Vulnerability[];
    permissions: Permission[];
    manifest: ManifestData;
    completedAt: string;
}

interface Vulnerability {
    ruleId: string;
    severity: "ERROR" | "WARNING" | "INFO";
    message: string;
    category: string;
    owaspCategory: string | null;
    cwe: string[];
}

interface Permission {
    name: string;
    shortName: string;
    risk: "dangerous" | "normal" | "signature";
}

interface ManifestData {
    packageName: string | null;
    debuggable: boolean;
    allowBackup: boolean;
    usesCleartextTraffic: boolean;
    networkSecurityConfig: boolean;
    minSdkVersion: number | null;
    targetSdkVersion: number | null;
    exportedComponents: { name: string; type: string; intentFilters: number }[];
}

// ─── Main Report Page ────────────────────────────────────────────────
const ReportPage = () => {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"vulnerabilities" | "permissions" | "manifest">("vulnerabilities");

    const fetchReport = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${projectId}`,
                { withCredentials: true }
            );
            setReport(data);
        } catch (err: any) {
            const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to load report";
            setError(errorMsg || "Failed to load report");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onBack={() => router.push("/dashboard/projects")} />;
    if (!report) return null;

    const scoreValue = report.score.value ?? 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (scoreValue / 100) * circumference;

    return (
        <div className="flex-1 min-h-screen bg-[#0D0D0D] overflow-y-auto">
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                }
            `}</style>

            <div className="max-w-7xl mx-auto p-8 space-y-10 animate-slide-up">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push("/dashboard/projects")}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-[#BDF34E] hover:border-[#BDF34E]/30 transition-all group"
                        >
                            <ArrowLeftIcon size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{report.project.name}</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/5 px-2 py-0.5 rounded">
                                    {report.apk.packageName || "Unknown package"}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-xs font-medium text-white/40">v{report.apk.versionName || "1.0.0"}</span>
                            </div>
                        </div>
                    </div>

                    <PDFDownloadLink
                        document={<SecurityReportPDF data={report} />}
                        fileName={`${report.project.name}_Audit.pdf`}
                        className="flex items-center gap-3 bg-[#BDF34E] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#D4FF7E] transition-all shadow-xl shadow-[#BDF34E]/10"
                    >
                        {({ loading }) => (
                            <>
                                <DownloadIcon size={20} weight="bold" />
                                {loading ? "Encrypting..." : "Export Findings"}
                            </>
                        )}
                    </PDFDownloadLink>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Trust Meter Card */}
                    <div className="lg:col-span-4 glass-card rounded-[40px] p-10 flex flex-col items-center relative overflow-hidden group">
                        <div className="absolute inset-x-0 -top-24 -left-24 w-64 h-64 bg-[#BDF34E]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#BDF34E]/10 transition-colors" />
                        
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-12">Trust Coefficient</h3>
                        
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            {/* SVG Meter with fixed sizing */}
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.03)"
                                    strokeWidth="14"
                                />
                                <circle
                                    cx="100" cy="100" r={radius}
                                    fill="transparent"
                                    stroke="#BDF34E"
                                    strokeWidth="14"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{
                                        transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="text-6xl font-black text-white tracking-tighter leading-none">{scoreValue}</span>
                                <span className="text-[10px] font-bold text-[#BDF34E] uppercase tracking-widest mt-4">GRADE {report.score.grade || "–"}</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-3 gap-3 mt-14 pt-10 border-t border-white/5">
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Crit</p>
                                <p className="text-lg font-bold text-red-500">{report.severitySummary.critical}</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Warn</p>
                                <p className="text-lg font-bold text-amber-500">{report.severitySummary.warning}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Risk</p>
                                <p className="text-lg font-bold text-blue-500">{report.severitySummary.info}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation and Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-3xl h-fit">
                            <NavTab active={activeTab === "vulnerabilities"} label="Vulnerabilities" count={report.vulnerabilities?.length} onClick={() => setActiveTab("vulnerabilities")} />
                            <NavTab active={activeTab === "permissions"} label="Permissions" count={report.permissions?.length} onClick={() => setActiveTab("permissions")} />
                            <NavTab active={activeTab === "manifest"} label="Manifest" onClick={() => setActiveTab("manifest")} />
                        </div>

                        <div className="flex-1 glass-card rounded-[40px] p-8 overflow-y-auto min-h-[500px]">
                            {activeTab === "vulnerabilities" && <VulnerabilityView list={report.vulnerabilities || []} />}
                            {activeTab === "permissions" && <PermissionView list={report.permissions || []} />}
                            {activeTab === "manifest" && <ManifestView data={report.manifest} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Subcomponents ──────────────────────────────────────────────────

function NavTab({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-4 flex items-center justify-center gap-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                active ? "bg-[#BDF34E] text-black shadow-lg shadow-[#BDF34E]/10" : "text-white/40 hover:text-white"
            }`}
        >
            {label}
            {count !== undefined && <span className={`px-2 py-0.5 rounded-full text-[9px] ${active ? "bg-black/10 text-black/60" : "bg-white/5 text-white/20"}`}>{count}</span>}
        </button>
    );
}

function VulnerabilityView({ list }: { list: Vulnerability[] }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayCount = 6;
    const items = isExpanded ? list : list.slice(0, displayCount);

    if (!list || list.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
            <ShieldCheckIcon size={64} weight="duotone" className="text-[#BDF34E] mb-6 opacity-20" />
            <p className="text-xl font-bold text-white mb-2">Vault Secure</p>
            <p className="text-white/40 text-sm">No critical data leaks or injection points identified.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {items.map((v, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${v.severity === "ERROR" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
                                {v.severity === "ERROR" ? "High Priority" : "Warning"}
                            </span>
                            <h4 className="text-base font-bold text-white font-mono mt-3 group-hover:text-[#BDF34E] transition-colors">{v.ruleId}</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#BDF34E] transition-colors">
                            <ArrowRightIcon size={18} />
                        </div>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed mb-6">{v.message}</p>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                        {v.cwe?.map(c => <span key={c} className="text-[10px] font-black text-white/20 border border-white/5 px-3 py-1.5 rounded-xl uppercase">CWE-{c}</span>)}
                        <span className="text-[10px] font-black text-[#BDF34E] bg-[#BDF34E]/10 px-3 py-1.5 rounded-xl uppercase">{v.category}</span>
                    </div>
                </div>
            ))}
            
            {list.length > displayCount && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-5 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#BDF34E] transition-all cursor-pointer mt-6"
                >
                    {isExpanded ? (
                        <><CaretUpIcon size={16} weight="bold" /> Collapse Findings</>
                    ) : (
                        <><CaretDownIcon size={16} weight="bold" /> Reveal {list.length - displayCount} More Findings</>
                    )}
                </button>
            )}
        </div>
    );
}

function PermissionView({ list }: { list: Permission[] }) {
    if (!list || list.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
             <LockIcon size={64} weight="duotone" className="text-white/10 mb-6" />
             <p className="text-[#A1A1A1] text-sm">No sandbox permissions declared.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((p, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] flex items-center justify-between group hover:border-[#BDF34E]/20 transition-all">
                    <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-white font-mono tracking-tight mb-1 truncate">{p.shortName}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{p.risk} protocol</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${p.risk === "dangerous" ? "bg-red-500" : p.risk === "normal" ? "bg-[#BDF34E]" : "bg-blue-500"} shadow-lg`} />
                </div>
            ))}
        </div>
    );
}

function ManifestView({ data }: { data: ManifestData }) {
    if (!data) return null;
    
    const items = [
        { label: "Compiler Debug", val: data.debuggable, danger: true, text: "Active debugging bridge" },
        { label: "Cloud Backup", val: data.allowBackup, danger: true, text: "Automated data sync" },
        { label: "Cleartext IO", val: data.usesCleartextTraffic, danger: true, text: "Unencrypted traffic" },
        { label: "NetSec Config", val: data.networkSecurityConfig, danger: false, text: "Policy definition" },
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(it => (
                    <div key={it.label} className="bg-white/[0.02] border border-white/5 p-6 rounded-[28px] flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{it.text}</p>
                            <h4 className="text-sm font-bold text-white">{it.label}</h4>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${it.val === it.danger ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[#BDF34E]/10 text-[#BDF34E] border-[#BDF34E]/20"}`}>
                            {it.val === it.danger ? "Vulnerable" : "Secured"}
                        </div>
                    </div>
                ))}
            </div>

            {data.exportedComponents?.length > 0 && (
                <div className="pt-10 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8 text-center">Exposed Entrypoints</h4>
                    <div className="space-y-3">
                        {data.exportedComponents.map((c, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-[20px] flex items-center gap-4 group hover:bg-white/[0.04] transition-colors">
                                <span className="text-[9px] font-black bg-white/5 text-white/40 px-2 py-1 rounded-lg uppercase">{c.type}</span>
                                <span className="text-sm font-bold text-white/60 font-mono truncate">{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0D0D] h-screen">
            <CircleNotchIcon size={48} className="animate-spin text-[#BDF34E]" />
            <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.5em] mt-8 animate-pulse">Decrypting Audit Log</p>
        </div>
    );
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0D0D] h-screen p-8 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                <XCircleIcon size={40} weight="duotone" className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Audit unavailable</h2>
            <p className="text-white/40 max-w-sm mb-12 text-lg">{error}</p>
            <button
                onClick={onBack}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#BDF34E] transition-all"
            >
                <ArrowLeftIcon size={18} weight="bold" />
                Return to Surface
            </button>
        </div>
    );
}

export default ReportPage;