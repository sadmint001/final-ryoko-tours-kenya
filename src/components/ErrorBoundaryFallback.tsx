import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorBoundaryFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-800 animate-fade-in-up">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Oops! Something went wrong
                </h1>

                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-sm">
                    We apologize for the inconvenience. An unexpected error occurred while loading this page.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 text-left bg-slate-100 dark:bg-slate-950 p-4 rounded-xl overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-300">
                        <p className="font-semibold text-red-600 dark:text-red-400 mb-2">{error.message}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={resetErrorBoundary}
                        className="bg-earth-brown hover:bg-earth-brown/90 text-white rounded-xl"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try again
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        onClick={() => {
                            resetErrorBoundary();
                        }}
                        className="rounded-xl border-slate-200 dark:border-slate-800"
                    >
                        <Link to="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
