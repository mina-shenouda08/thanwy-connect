import logo from "@/assets/thanwy-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ size = 140, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("overflow-hidden rounded-full bg-white shadow-none", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={logo.url}
        alt="شعار اجتماع ثانوي"
        width={size}
        height={size}
        className="h-full w-full scale-125 object-contain"
      />
    </div>
  );
}