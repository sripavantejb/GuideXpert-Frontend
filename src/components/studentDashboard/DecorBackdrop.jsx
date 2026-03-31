export default function DecorBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] sd-pattern-dots"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-[#F7B5B5]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-1/3 h-48 w-48 rounded-full bg-[#C7F36B]/15 blur-3xl"
        aria-hidden
      />
    </>
  );
}
