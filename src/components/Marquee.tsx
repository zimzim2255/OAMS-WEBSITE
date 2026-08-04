interface MarqueeProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: string;
  py?: string;
  className?: string;
}

export default function Marquee({
  text,
  bgColor = "bg-black",
  textColor = "text-white",
  fontSize = "text-[10px]",
  py = "py-2",
  className = "",
}: MarqueeProps) {
  return (
    <div className={`w-full ${bgColor} ${textColor} overflow-hidden ${py} ${className}`}>
      <div className="animate-marquee whitespace-nowrap">
        <span className={`${fontSize} uppercase tracking-widest mx-4`}>
          / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text} / {text}
        </span>
      </div>
    </div>
  );
}
