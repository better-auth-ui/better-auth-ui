"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>404 - Page Not Found</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        The page you're looking for doesn't exist.
                    </p>
                    <Button
                        onClick={() => {
                            window.location.href = "/"
                        }}
                        className="w-full"
                    >
                        Go Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
