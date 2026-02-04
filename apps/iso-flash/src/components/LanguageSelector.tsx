import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { languages } from "@/lib/i18n";
import { useState } from "react";

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{t("language")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{currentLanguage.flag}</span>
            <span className="text-muted-foreground">{currentLanguage.nativeName}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("language")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                i18n.language === lang.code
                  ? "bg-primary/20 border border-primary"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-medium">{lang.nativeName}</p>
                  <p className="text-sm text-muted-foreground">{lang.name}</p>
                </div>
              </div>
              {i18n.language === lang.code && (
                <span className="text-primary font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
