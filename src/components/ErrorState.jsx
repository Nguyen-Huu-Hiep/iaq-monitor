function ErrorState({
  message = "Failed to load data!",
  onRetry,
  compact = false,
}) {
  return (
    <div className={`error-state${compact ? " error-state--compact" : ""}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-message">{message}</div>
      {onRetry && (
        <button className="reload-btn" onClick={onRetry}>
          ↻ Reload
        </button>
      )}
    </div>
  );
}

export default ErrorState;
