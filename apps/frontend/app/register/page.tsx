"use client";

import { useState } from "react";
import { 
    FingerprintIcon, 
    EnvelopeIcon, 
    LockIcon, 
    ShieldCheckIcon,
    CircleNotchIcon,
    GithubLogoIcon,
    ArrowRightIcon,
    UserIcon,
    ArrowLeftIcon
} from "@phosphor-icons/react";
import { signIn, signUp } from "@sandboox/auth/client";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignUp = async () => {
        setLoading(true);
        setError("");
        
        try {
            const { data, error: signUpError } = await signUp.email({
                email,
                password,
                name,
                callbackURL: "/dashboard"
            });

            if (signUpError) {
                setError(signUpError.message || "Registration failed");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Communication failure with auth node");
        } finally {
            setLoading(false);
        }
    };

    const handleGithubSignUp = async () => {
        setLoading(true);
        try {
            await signIn.social({
                provider: "github",
                callbackURL: `${window.location.origin}/dashboard`
            });
        } catch (err) {
            setError("Social handshake failed");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6 lg:p-12 selection:bg-[#BDF34E] selection:text-black">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                }
            `}</style>

            <div className="w-full max-w-md space-y-12 animate-fade">
                {/* Brand / Logo */}
                <div className="flex flex-col items-center gap-6">
                    <Link href="/login" className="self-start text-white/20 hover:text-white transition-colors p-2 -ml-2 group">
                        <ArrowLeftIcon size={24} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="w-20 h-20 bg-[#BDF34E] rounded-[30px] flex items-center justify-center text-black shadow-2xl shadow-[#BDF34E]/20">
                        <UserIcon size={40} weight="bold" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Join Protocol</h1>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Create New Security Instance</p>
                    </div>
                </div>

                <div className="glass-card rounded-[40px] p-10 md:p-12 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BDF34E]/30 to-transparent" />
                    
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                             <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            onClick={handleGithubSignUp}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#BDF34E] transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                        >
                            <GithubLogoIcon size={20} weight="fill" />
                            Sync via GitHub
                        </button>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[9px] font-black text-white/10 uppercase tracking-widest">OR MANUAL ENTRY</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Entity Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30">
                                        <UserIcon size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Terminal Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30">
                                        <EnvelopeIcon size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="email@address.com"
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Master Key</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30">
                                        <LockIcon size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="············"
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSignUp}
                            disabled={loading || !email || !password || !name}
                            className="w-full py-5 bg-[#BDF34E] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-[#BDF34E]/10 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <CircleNotchIcon size={18} className="animate-spin" />
                            ) : (
                                <>Initialize Protocol <ShieldCheckIcon size={18} weight="bold" /></>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[11px] font-medium text-white/30 pt-6">
                        Existing clearance? <Link href="/login" className="text-[#BDF34E] hover:underline font-bold">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
