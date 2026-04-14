interface StatusMessageProps {
  tone: "error" | "success";
  message: string;
}

export function StatusMessage({ tone, message }: StatusMessageProps) {
  return <div className={tone === "error" ? "form-error" : "form-success"}>{message}</div>;
}
