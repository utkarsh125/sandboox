"use client"
import { useState } from "react";
import { signIn, signUp } from "@sandboox/auth/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();

    const handleSignUp = async () => {
        const { data, error } = await signUp.email({
            email,
            password,
            name,
            callbackURL: "/dashboard"
        });

        if (error) {
            alert(error.message);
        } else {
            router.push("/dashboard");
        }
    };

    const handleGithubSignUp = async () => {
        await signIn.social({
            provider: "github",
            callbackURL: `${window.location.origin}/dashboard`
        })
    }

    return (
        <div className="flex flex-col gap-4 p-8 max-w-sm mx-auto">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <input placeholder="Name" onChange={e => setName(e.target.value)} className="border p-2" />
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} className="border p-2" />
            <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} className="border p-2" />
            <button onClick={handleSignUp} className="bg-blue-600 text-white p-2 rounded">
                Sign Up
            </button>

            <br />

            <button onClick={handleGithubSignUp} className="bg-black text-white p-2 rounded">
                Sign Up with Github
            </button>
        </div>
    );
}
