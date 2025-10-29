import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Lock, Search } from "lucide-react";
import { useState } from "react";

const IPLaunchVault = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const documents = [
    {
      id: 1,
      name: "Provisional Patent - AI Task System",
      type: "Patent",
      date: "2024-01-15",
      status: "Signed",
      encrypted: true,
    },
    {
      id: 2,
      name: "Trademark Application - BIZDEV APP",
      type: "Trademark",
      date: "2023-12-10",
      status: "Filed",
      encrypted: true,
    },
    {
      id: 3,
      name: "NDA - IPLaunch Agreement",
      type: "Contract",
      date: "2024-01-10",
      status: "Executed",
      encrypted: true,
    },
    {
      id: 4,
      name: "Equity Agreement - Patent Co-Inventorship",
      type: "Contract",
      date: "2024-01-12",
      status: "Pending",
      encrypted: true,
    },
  ];

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Vault</h1>
          <p className="text-muted-foreground">
            Secure storage for all your IP documents
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{documents.length}</div>
          <div className="text-sm text-muted-foreground">Total Documents</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {documents.filter((d) => d.type === "Patent").length}
          </div>
          <div className="text-sm text-muted-foreground">Patents</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {documents.filter((d) => d.type === "Trademark").length}
          </div>
          <div className="text-sm text-muted-foreground">Trademarks</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {documents.filter((d) => d.type === "Contract").length}
          </div>
          <div className="text-sm text-muted-foreground">Contracts</div>
        </Card>
      </div>

      {/* Documents List */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <FileText className="h-8 w-8" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{doc.name}</h3>
                    {doc.encrypted && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {doc.type} • {doc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{doc.status}</Badge>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Blockchain Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Blockchain Verification</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All documents are timestamped and hashed to IPFS for immutable proof of
          ownership and filing date.
        </p>
        <div className="flex gap-4">
          <Button variant="outline">View on IPFS</Button>
          <Button variant="outline">Verify Hash</Button>
        </div>
      </Card>
    </div>
  );
};

export default IPLaunchVault;
