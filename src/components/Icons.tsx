import type { ServiceIcon } from "@/content/site";

const paths: Record<ServiceIcon, React.ReactNode> = {
  store: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
      <path d="M5 12v8h14v-8" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 10v10" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16" />
      <path d="M14 10h5a1 1 0 011 1v10" />
      <path d="M2 21h20" />
      <path d="M8 8h2M8 12h2M8 16h2" />
    </>
  ),
  app: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9h18" />
      <path d="M7 6h.01M10 6h.01" />
      <path d="M8 14l2 2-2 2M12 18h4" />
    </>
  ),
  code: (
    <>
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M14 4l-4 16" />
    </>
  ),
};

export function ServiceGlyph({ name }: { name: ServiceIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}
