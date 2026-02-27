import Link from 'next/link';

export const runtime = 'edge';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 pt-20">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-12 text-center max-w-lg animate-fade-in">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">404 - Page Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/home"
                    className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 text-lg"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
