import { QrCode } from "./QrCode";
import { gradeLabel } from "@/lib/thanwy";

export function ProfileHeader({
  name,
  grade,
  className: klass,
  userId,
}: {
  name: string;
  grade?: string | null | undefined;
  className?: string | null | undefined;
  userId?: string | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-tertiary p-5 text-tertiary-foreground">
      {userId ? (
        <QrCode value={userId} size={92} className="shrink-0" />
      ) : (
        <div className="h-[92px] w-[92px] rounded-2xl bg-white/60" />
      )}
      <div className="text-right leading-8">
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm opacity-80">{gradeLabel(grade)}</p>
        <p className="text-sm opacity-80">{klass ?? "بدون فصل"}</p>
      </div>
    </div>
  );
}