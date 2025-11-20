"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        setLoading(true);

        const result = await signUp.email(
            {
                name,
                email,
                password,
                callbackURL: "/",
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    router.push("/");
                },
                onError: (ctx) => {
                    setError(ctx.error.message || "Failed to sign up");
                    setLoading(false);
                },
            }
        );
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Commencez avec Jokko dès aujourd'hui
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-foreground"
                            >
                                Nom complet
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="Jean Dupont"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="vous@exemple.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Minimum 8 caractères
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Création du compte..." : "Créer un compte"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Vous avez déjà un compte ?{" "}
                    <Link
                        href="/sign-in"
                        className="font-medium text-primary hover:underline"
                    >
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
