import { FileWaveform } from "lucide-react";

export const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-serif flex items-center gap-2">
          <FileWaveform className="h-6 w-6" />
          Next Step AI
        </h1>
      </div>
    </header>
  );
};