import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 py-12 text-center animate-fade-up">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-outfit font-extrabold mb-6">
        404
      </div>
      <h1 className="text-4xl font-outfit font-bold text-brand-text dark:text-brand-text-dark mb-4">
        Are you lost in the mountains?
      </h1>
      <p className="text-lg font-inter text-brand-text/70 dark:text-brand-text-dark/70 max-w-md mx-auto mb-8">
        The page you are looking for has been moved, removed, or never existed in the first place.
      </p>
      
      <Link href="/" className="btn-primary">
        Return to Base Camp
      </Link>
    </div>
  );
}
