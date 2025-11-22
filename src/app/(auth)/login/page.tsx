"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, isPending } = useSession();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (!isPending && session) {
            router.push("/dashboard");
        }
    }, [session, isPending, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Échec de la connexion");
                setLoading(false);
                return;
            }

            // Rediriger vers le dashboard après succès
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
            setLoading(false);
        }
    };

    // Afficher un loader pendant la vérification de session
    if (isPending) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <p className="text-gray-600">Chargement...</p>
            </div>
        );
    }

    // Ne pas afficher le formulaire si déjà connecté
    if (session) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Bon retour</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connectez-vous à votre compte Jokko
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
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="••••••••"
                            />
                            <div className="mt-2 text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Vous n'avez pas de compte ?{" "}
                    <Link
                        href="/sign-up"
                        className="font-medium text-primary hover:underline"
                    >
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}
