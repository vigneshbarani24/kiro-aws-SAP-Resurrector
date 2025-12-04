'use client';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="mb-4 text-muted-foreground">{error.message}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
