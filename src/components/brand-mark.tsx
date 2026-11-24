type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" height="36" rx="11" width="36" />
      <path
        d="M10.5 11.5h6.1c3.4 0 5.4 1.7 5.4 4.6 0 1.8-.8 3.2-2.2 4l4.1 4.4h-4.2l-3.3-3.8h-2.3v3.8h-3.6v-13Zm5.8 6.3c1.4 0 2.1-.6 2.1-1.7 0-1.1-.7-1.7-2.1-1.7h-2.2v3.4h2.2Z"
        fill="white"
      />
      <path d="M25.5 10.5v7" stroke="#F5A46B" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

