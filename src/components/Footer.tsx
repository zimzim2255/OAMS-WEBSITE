export default function Footer() {
  return (
    <footer className="bg-black text-white flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 px-4 sm:px-10 py-8 sm:py-10 overflow-hidden">
      <p className="text-[12px] text-center sm:text-left">© 2018 - 2024</p>
      <p className="font-['Impact','Anton',sans-serif] text-2xl sm:text-3xl md:text-5xl uppercase font-bold tracking-tight text-center min-w-0">
        CUSTOM - WHAT IS IT?
      </p>
      <a
        href="https://www.instagram.com/oams.01?igsh=MXUwd2MxdWY2ZjZlMg=="
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 px-4 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
          />
        </svg>
        <span className="text-[12px] uppercase tracking-widest font-bold">@oams.01</span>
      </a>
    </footer>
  );
}
