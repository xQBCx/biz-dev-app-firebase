import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wand2, FileText, Loader2 } from "lucide-react";

interface ScriptEditorProps {
  onSubmit: (title: string, script: string) => void;
  isLoading: boolean;
}

const SAMPLE_SCRIPT = `"The Future of Business is Personal"
60-Second Spot

[OPEN: Black screen. Single heartbeat sound.]

"You have ideas. Dreams. A vision that keeps you up at night."

[Quick cuts: entrepreneur sketching on napkin, sunrise over city skyline, hands typing furiously]

"But building a business? That used to take months. Lawyers. Paperwork. Endless waiting."

[Sound of paper shredding. Screen cracks.]

"Not anymore."

[MUSIC DROPS: Epic orchestral swell]

"Introducing Biz Dev — the platform that treats YOU like the corporation you were born to be."

[Montage: Deal Rooms in action, AI analyzing data, network graph spinning, mobile app glowing]

"Launch a verified business in HOURS — not months. AI that thinks like your C-suite. Deal rooms where billion-dollar handshakes happen."

[Quick cuts: CRM dashboard, workflow automation, voice narration playing]

"Your ideas. Your identity. Your empire — verified, automated, and unstoppable."

[Beat drop. Slow motion: User smiling at phone, confetti falling]

"This isn't just software. This is your unfair advantage."

[Logo appears with tagline]

"Biz Dev. Build Your Empire. Start Today."`;

export function ScriptEditor({ onSubmit, isLoading }: ScriptEditorProps) {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");

  const handleSubmit = () => {
    if (!script.trim()) return;
    onSubmit(title || "Untitled Commercial", script);
  };

  const loadSampleScript = () => {
    setTitle("Biz Dev App - Super Bowl Commercial");
    setScript(SAMPLE_SCRIPT);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Commercial Script
        </CardTitle>
        <CardDescription>
          Write or paste your commercial script. Include scene directions in [brackets] and voiceover text in "quotes".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Commercial Title</Label>
          <Input
            id="title"
            placeholder="My Awesome Commercial"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="script">Script</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSampleScript}
              disabled={isLoading}
              className="text-xs"
            >
              Load Sample Script
            </Button>
          </div>
          <Textarea
            id="script"
            placeholder={`[OPEN: Dramatic establishing shot]

"Your opening line here..."

[Scene transition]

"More voiceover text..."

[CLOSE: Logo reveal]

"Your tagline here."`}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={isLoading}
            className="min-h-[400px] font-mono text-sm"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!script.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing Script...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Commercial
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
