export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-navy edu-pattern">
      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}
