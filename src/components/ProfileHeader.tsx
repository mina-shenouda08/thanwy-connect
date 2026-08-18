import { Camera, User } from "lucide-react";
import { gradeLabel } from "@/lib/thanwy";

export function ProfileHeader({
  name,
  grade,
  className: klass,
  avatarUrl,
  onPickAvatar,
  uploading,
}: {
  name: string;
  grade?: string | null | undefined;
  className?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  onPickAvatar?: ((file: File) => void) | undefined;
  uploading?: boolean | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-tertiary p-5 text-tertiary-foreground">
      <label className="press relative h-[92px] w-[92px] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white/60">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`صورة ${name}`} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <User className="h-10 w-10 opacity-60" />
          </span>
        )}
        {onPickAvatar && (
          <>
            <span className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/40 py-1 text-white">
              <Camera className="h-3.5 w-3.5" />
            </span>
            <input
              type="file"
              accept="image/*"
              aria-label="تغيير صورة الحساب"
              disabled={uploading}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickAvatar(f);
                e.target.value = "";
              }}
            />
          </>
        )}
      </label>
      <div className="text-right leading-8">
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm opacity-80">{gradeLabel(grade)}</p>
        <p className="text-sm opacity-80">{klass ?? "بدون فصل"}</p>
      </div>
    </div>
  );
}