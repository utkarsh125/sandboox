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
    EyeIcon,
    EyeSlashIcon
} from "@phosphor-icons/react";
import { signIn } from "@sandboox/auth/client";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        setError("");

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Failed to sign in");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignIn = async (provider: "github") => {
        setLoading(true);
        setError("");

        try {
            await signIn.social({
                provider,
                callbackURL: `${window.location.origin}/dashboard`,
            });
        } catch (err) {
            setError(`Failed to sign in with ${provider} `);
            console.error(err);
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && email && password && !loading) {
            handleSignIn();
        }
    };

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
                input:focus + div { border-color: #BDF34E !important; }
            `}</style>

            <div className="w-full max-w-md space-y-12 animate-fade">
                {/* Brand / Logo */}
                <Link href="/" className="flex flex-col items-center gap-6 group">
                    <div className="w-20 h-20 bg-[#BDF34E] rounded-[30px] flex items-center justify-center text-black shadow-2xl shadow-[#BDF34E]/20 transition-transform group-hover:scale-105">
                        <ShieldCheckIcon size={40} weight="bold" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Sandboox</h1>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Security Protocol Active</p>
                    </div>
                </Link>

                <div className="glass-card rounded-[40px] p-10 md:p-12 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BDF34E]/30 to-transparent" />
                    
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Access Interface</h2>
                        <p className="text-sm text-white/30">Securely verify your credentials to continue.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                             <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Social Auth */}
                        <button
                            onClick={() => handleSocialSignIn('github')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#BDF34E] transition-all shadow-xl shadow-black/20 disabled:opacity-50 group"
                        >
                            <GithubLogoIcon size={20} weight="fill" />
                            Continue with GitHub
                        </button>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[9px] font-black text-white/10 uppercase tracking-widest">OR USE TERMINAL</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* Email Form */}
                        <div className="space-y-4">
                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Protocol Identifier</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#BDF34E] transition-colors">
                                        <EnvelopeIcon size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="user@system.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Access Key</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#BDF34E] transition-colors">
                                        <LockIcon size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="············"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-16 text-sm text-white placeholder:text-white/10 outline-none focus:bg-white/[0.05] transition-all"
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-5 flex items-center text-white/20 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSignIn}
                            disabled={loading || !email || !password}
                            className="w-full py-5 bg-white/5 border border-white/10 hover:border-[#BDF34E]/30 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <CircleNotchIcon size={18} className="animate-spin" />
                            ) : (
                                <>Verify Interface <ArrowRightIcon size={16} weight="bold" /></>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-[11px] font-medium text-white/30 pt-6">
                        No clearance? <Link href="/register" className="text-[#BDF34E] hover:underline font-bold">Register Protocol</Link>
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Encrypted Session Phase 2.1</p>
                </div>
            </div>
        </div>
    );
}