import { useEffect, useState } from "react";
import { supabase } from "packages/supabase-client/src";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  merchantId: string;
}

const QRCodeGenerator = ({ merchantId }: QRCodeGeneratorProps) => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, [merchantId]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching links:", error);
    } else {
      setLinks(data || []);
      await generateQRCodes(data || []);
    }
    setLoading(false);
  };

  const generateQRCodes = async (linksData: any[]) => {
    const codes: { [key: string]: string } = {};
    
    for (const link of linksData) {
      if (link.checkout_url) {
        try {
          const qrDataUrl = await QRCode.toDataURL(link.checkout_url, {
            width: 300,
            margin: 2,
            color: {
              dark: "#1E88E5",
              light: "#FFFFFF"
            }
          });
          codes[link.id] = qrDataUrl;
        } catch (err) {
          console.error("Error generating QR code:", err);
        }
      }
    }
    
    setQrCodes(codes);
  };

  const downloadQRCode = (linkId: string, title: string) => {
    const qrDataUrl = qrCodes[linkId];
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrDataUrl;
    link.click();

    toast({ title: "QR Code downloaded!" });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading QR codes...</div>;
  }

  if (links.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No active payment links to generate QR codes for.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <Card key={link.id} className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">{link.title}</CardTitle>
            <CardDescription>{link.description || "Payment QR Code"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrCodes[link.id] && (
              <div className="bg-white p-4 rounded-lg flex justify-center">
                <img src={qrCodes[link.id]} alt={`QR Code for ${link.title}`} className="w-full max-w-[250px]" />
              </div>
            )}
            <Button
              onClick={() => downloadQRCode(link.id, link.title)}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!qrCodes[link.id]}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QRCodeGenerator;