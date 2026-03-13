interface Props {
  error: { code: string; message: string } | null;
}

export function ErrorBanner({ error }: Props) {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      <span className="error-message">{error.message}</span>
      <span className="error-code">{error.code}</span>
    </div>
  );
}
