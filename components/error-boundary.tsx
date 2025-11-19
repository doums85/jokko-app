"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
                    <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                    <p className="text-muted-foreground max-w-[500px]">
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <Button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        variant="outline"
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
