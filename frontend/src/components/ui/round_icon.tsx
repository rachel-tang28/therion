
import Image from "next/image";

interface RoundIconProps {  
    imageSrc: string; // Path to the image
}

export default function RoundIcon(data: RoundIconProps) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center rounded-full icon overflow-hidden">
      <div className="relative w-4 h-4">
        <Image
          src={data.imageSrc}
          alt="Profile"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}