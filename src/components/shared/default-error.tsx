"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface FallbackProps {
    error: Error & { digest?: string }
    reset?: () => void
}

export function DefaultError({ error, reset }: FallbackProps) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        {error.message || "An unexpected error occurred"}
                    </p>
                    {error.digest && (
                        <p className="text-muted-foreground text-xs">
                            Error ID: {error.digest}
                        </p>
                    )}
                    {reset && (
                        <Button onClick={reset} className="w-full">
                            Try again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
