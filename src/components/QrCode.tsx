import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({
  value,
  size = 220,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size * 2, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => setSrc(""));
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div
      className={className}
      style={{ width: size, height: size, background: "#fff", borderRadius: 16, padding: 8 }}
    >
      {src ? (
        <img src={src} alt="رمز الحضور" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
      )}
    </div>
  );
}