interface StatusMessageProps {
  tone: "error" | "success";
  message: string;
}

export function StatusMessage({ tone, message }: StatusMessageProps) {
  return (
    <div className={`status-message ${tone === "error" ? "form-error" : "form-success"}`} role="status">
      {message}
    </div>
  );
}
