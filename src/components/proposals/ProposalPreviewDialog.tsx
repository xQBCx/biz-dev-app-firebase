import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Send, 
  X, 
  FileText, 
  DollarSign,
  ListChecks,
  CheckCircle
} from "lucide-react";

interface GeneratedProposal {
  id: string;
  title: string;
  proposal_number: string | null;
  generated_content: {
    executive_summary?: string;
    sections?: Array<{ title: string; content: string; order: number }>;
    pricing?: {
      line_items?: Array<{ description: string; amount: number; notes?: string }>;
      total?: number;
      terms?: string;
    };
    next_steps?: string[];
    template_type?: string;
    custom_prompt?: string;
  } | null;
  pricing: any;
  status: string;
  pdf_url: string | null;
  created_at: string;
}

interface ProposalPreviewDialogProps {
  proposal: GeneratedProposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (proposalId: string) => void;
}

export function ProposalPreviewDialog({ 
  proposal, 
  open, 
  onOpenChange,
  onSend 
}: ProposalPreviewDialogProps) {
  if (!proposal) return null;

  const content = proposal.generated_content || {};
  const sections = content.sections || [];
  const pricing = content.pricing || proposal.pricing || {};
  const nextSteps = content.next_steps || [];
  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "review": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "viewed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{proposal.title}</DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                {proposal.proposal_number && (
                  <span className="text-sm text-muted-foreground">
                    #{proposal.proposal_number}
                  </span>
                )}
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(proposal.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
          <div className="px-6 py-6 space-y-8">
            {/* Executive Summary */}
            {content.executive_summary && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Executive Summary</h2>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {content.executive_summary}
                  </p>
                </div>
              </section>
            )}

            {/* Dynamic Sections */}
            {sortedSections.length > 0 && (
              <section className="space-y-6">
                {sortedSections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      {section.title}
                    </h3>
                    <div className="pl-8">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Pricing Section */}
            {(pricing.line_items?.length > 0 || pricing.total) && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Pricing</h2>
                </div>
                
                {pricing.line_items?.length > 0 && (
                  <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.line_items.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="px-4 py-3">
                              <div className="font-medium">{item.description}</div>
                              {item.notes && (
                                <div className="text-sm text-muted-foreground mt-1">{item.notes}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {pricing.total && (
                        <tfoot>
                          <tr className="bg-primary/5">
                            <td className="px-4 py-3 font-semibold">Total</td>
                            <td className="px-4 py-3 text-right font-bold text-lg text-primary">
                              {formatCurrency(pricing.total)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}

                {pricing.terms && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Terms:</strong> {pricing.terms}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Next Steps</h2>
                </div>
                <div className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                    >
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {!content.executive_summary && sortedSections.length === 0 && !pricing.total && nextSteps.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
                <p className="text-muted-foreground">
                  This proposal is still being generated or has not been processed yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="flex items-center gap-2">
            {proposal.pdf_url && (
              <Button variant="outline" asChild>
                <a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            {proposal.status === "draft" && onSend && (
              <Button onClick={() => onSend(proposal.id)}>
                <Send className="w-4 h-4 mr-2" />
                Send Proposal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
