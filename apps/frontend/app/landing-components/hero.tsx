"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

const Hero = () => {
    const router = useRouter()
    return (
        <section className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden bg-white">
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Text */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h1 className="hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black mb-4 sm:mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
                        Break your APK
                        <br />
                        Before your attackers do
                        <br />
                        Platform
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10">
                        Expose Android app vulnerabilities in minutes.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 md:mb-16">
                        <button onClick={() => router.push('/login')} className="hover:cursor-pointer px-6 sm:px-7 py-3 sm:py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-sm hover:shadow-md w-full sm:w-auto">
                            Get Started — It's Free
                        </button>

                    </div>
                </div>

                {/* Hero Card with Gradient and Person */}
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
                        {/* Gradient Background */}
                        <div
                            className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/10]"
                            style={{
                                background: 'linear-gradient(135deg, #eef0ecff 0%, #ccf1d1ff 25%, #7dd3c0 50%, #cddafcff 75%, #aec0f1ff 100%)'
                            }}
                        >
                            {/* Content Container */}
                            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero