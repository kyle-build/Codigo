export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 font-mono text-sm font-bold">
              C
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Codigo System. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              关于我们
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              联系支持
            </a>
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}












