import { useState } from "react";

interface Props {
  error: { code: string; message: string } | null;
}

export function ErrorBanner({ error }: Props) {
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!error || error.code === dismissed) return null;

  return (
    <div className="error-banner" role="alert">
      <span className="error-message">{error.message}</span>
      <span className="error-code">{error.code}</span>
      <button
        className="error-dismiss"
        onClick={() => setDismissed(error.code)}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}
