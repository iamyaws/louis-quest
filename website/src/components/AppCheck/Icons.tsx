/**
 * Inline stroke icons for the app-check tool.
 *
 * Lucide-style geometry (stroke 2, round linecaps, square-ish 24x24
 * viewbox) so they sit consistently next to other inline SVGs across
 * the site without pulling in lucide-react as a dependency. Keep the
 * set tiny — only what the tool actually uses.
 */

interface IconProps {
  className?: string;
  size?: number;
}

export function ArrowRight({ className, size = 16 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}
