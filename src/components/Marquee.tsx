export default function Marquee({ text }: { text: string }) {
  return (
    <div className="w-full bg-black text-white overflow-hidden py-2">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-widest mx-4">
          / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text}
        </span>
      </div>
    </div>
  );
}