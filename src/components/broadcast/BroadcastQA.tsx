import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useBroadcast } from '@/hooks/useBroadcast';
import { useInstincts } from '@/hooks/useInstincts';

interface BroadcastQAProps {
  segmentId: string;
  segmentTitle: string;
}

interface QAMessage {
  type: 'question' | 'answer';
  content: string;
  sources?: Array<{ type: string; id: string; title: string }>;
}

export function BroadcastQA({ segmentId, segmentTitle }: BroadcastQAProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const { askQuestion } = useBroadcast();
  const { trackSearch } = useInstincts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { type: 'question', content: userQuestion }]);
    setLoading(true);

    // Track Q&A interaction for behavioral embeddings
    trackSearch('broadcast', userQuestion, 0);

    try {
      const response = await askQuestion(segmentId, userQuestion);
      if (response) {
        setMessages(prev => [...prev, {
          type: 'answer',
          content: response.answer,
          sources: response.sources,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the key takeaways?",
    "What are the risks mentioned?",
    "What opportunities does this present?",
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ask questions about "{segmentTitle}"
      </p>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <Card key={idx} className={msg.type === 'question' ? 'bg-muted' : 'bg-background'}>
            <CardContent className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {msg.type === 'question' ? 'You' : 'UPN AI'}
              </p>
              <p className="text-sm">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Source: {msg.sources[0].title}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing segment...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this segment..."
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={loading || !question.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}