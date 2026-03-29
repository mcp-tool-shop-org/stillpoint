import { useState, useEffect } from "react";

interface Props {
  error: { code: string; message: string } | null;
}

export function ErrorBanner({ error }: Props) {
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (error && error.code !== dismissed) setDismissed(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error?.code]);

  if (!error || error.code === dismissed) return null;

  return (
    <div className="error-banner" role="alert">
      <span className="error-message">{error.message}</span>
      <span className="error-code">{error.code}</span>
      <div className="error-actions">
        {error.code === "connection_lost" && (
          <button
            className="error-retry"
            onClick={() => window.location.reload()}
            aria-label="Retry connection"
          >
            Retry
          </button>
        )}
        <button
          className="error-dismiss"
          onClick={() => setDismissed(error.code)}
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  );
}
