export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClass} border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`} />
    </div>
  );
}
