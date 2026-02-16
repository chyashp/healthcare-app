import { classNames } from "@/lib/utils";
import { getAppointmentStatusColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const colors = getAppointmentStatusColor(status);
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={classNames("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {label}
    </span>
  );
}
