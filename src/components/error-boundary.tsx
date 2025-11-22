"use client";

import { Component, ErrorInfo, ReactNode } from "react";


interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-4 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Une erreur s'est produite !</h2>
                    <p className="text-muted-foreground max-w-[500px]">
                        {this.state.error?.message || "Une erreur inattendue s'est produite."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
