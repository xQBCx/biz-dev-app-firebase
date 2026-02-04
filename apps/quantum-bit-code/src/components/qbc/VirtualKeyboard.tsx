import { Button } from '@/components/ui/button';
import { X, Delete } from 'lucide-react';

type ScriptType = 'cyrillic' | 'greek' | 'hebrew' | 'cjk' | 'arabic';

interface VirtualKeyboardProps {
  script: ScriptType;
  onCharacter: (char: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

// Character sets for each script
const SCRIPT_CHARACTERS: Record<ScriptType, string[][]> = {
  cyrillic: [
    ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й'],
    ['К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф'],
    ['Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'],
    ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й'],
    ['к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф'],
    ['х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
  ],
  greek: [
    ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ'],
    ['Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'],
    ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'],
    ['ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
  ],
  hebrew: [
    ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ'],
    ['ך', 'ל', 'מ', 'ם', 'נ', 'ן', 'ס', 'ע', 'פ', 'ף', 'צ'],
    ['ץ', 'ק', 'ר', 'ש', 'ת'],
  ],
  cjk: [
    ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    ['人', '大', '小', '上', '下', '左', '右', '中', '日', '月'],
    ['水', '火', '木', '金', '土', '山', '川', '田', '雨', '風'],
    ['天', '地', '花', '鳥', '龍', '虎', '馬', '牛', '羊', '犬'],
    ['口', '目', '耳', '手', '足', '心', '言', '門', '車', '道'],
  ],
  arabic: [
    ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز'],
    ['س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك'],
    ['ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'ة', 'ى', 'ئ', 'ؤ'],
  ],
};

const SCRIPT_NAMES: Record<ScriptType, string> = {
  cyrillic: 'Cyrillic',
  greek: 'Greek',
  hebrew: 'Hebrew',
  cjk: 'CJK / Mandarin',
  arabic: 'Arabic',
};

export const VirtualKeyboard = ({ 
  script, 
  onCharacter, 
  onBackspace,
  onClose 
}: VirtualKeyboardProps) => {
  const characters = SCRIPT_CHARACTERS[script];

  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {SCRIPT_NAMES[script]} Keyboard
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onCharacter(' ')}
            title="Space"
          >
            <span className="text-xs">␣</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onBackspace}
            title="Backspace"
          >
            <Delete className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
            title="Close keyboard"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Character Grid */}
      <div className="space-y-1">
        {characters.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-1 justify-center">
            {row.map((char, charIndex) => (
              <Button
                key={`${rowIndex}-${charIndex}`}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-base font-normal hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onCharacter(char)}
              >
                {char}
              </Button>
            ))}
          </div>
        ))}
      </div>

      {/* Common punctuation */}
      <div className="flex flex-wrap gap-1 justify-center mt-2 pt-2 border-t border-border">
        {['.', ',', '!', '?', '-', ':', ';', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((char) => (
          <Button
            key={char}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-sm"
            onClick={() => onCharacter(char)}
          >
            {char}
          </Button>
        ))}
      </div>
    </div>
  );
};
