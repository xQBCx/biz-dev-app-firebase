import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Languages, Loader2, ArrowRight } from "lucide-react";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
];

interface TranslationPanelProps {
  initialText?: string;
  mode?: 'text' | 'speech' | 'formal';
  onTranslated?: (translated: string) => void;
}

export const TranslationPanel = ({ initialText = '', mode = 'text', onTranslated }: TranslationPanelProps) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          text: sourceText,
          sourceLanguage,
          targetLanguage,
          mode,
        },
      });

      if (error) throw error;

      setTranslatedText(data.translatedText);
      onTranslated?.(data.translatedText);
      toast.success('Translation completed');
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Languages className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Real-Time Translation</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source-lang">Source Language</Label>
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger id="source-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-lang">Target Language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger id="target-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="source-text">Original Text</Label>
          <Textarea
            id="source-text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="min-h-[200px] resize-none"
          />
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapLanguages}
            className="rounded-full"
            disabled={isTranslating}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="translated-text">Translated Text</Label>
          <Textarea
            id="translated-text"
            value={translatedText}
            readOnly
            placeholder="Translation will appear here..."
            className="min-h-[200px] resize-none bg-muted"
          />
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={handleTranslate} disabled={isTranslating} size="lg">
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Translate
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
