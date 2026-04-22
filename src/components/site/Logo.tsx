import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useTheme } from "@/contexts/AppProviders";

export function Logo({ size = 38, withText = true }: { size?: number; withText?: boolean }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? logoDark : logoLight;
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={src}
        alt="Smart Calendar SA"
        width={size}
        height={size}
        className="rounded-[10px] object-cover"
        style={{ width: size, height: size }}
      />
      {withText && (
        <span className="font-display text-[19px] font-extrabold text-foreground">
          Smart Calendar <span className="text-brand">SA</span>
        </span>
      )}
    </span>
  );
}