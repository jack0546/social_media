import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">Page not found</p>
        <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}