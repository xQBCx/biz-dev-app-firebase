import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Link2, Camera, Upload, Search, ArrowRight, Box, Loader2, Scan, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Visualize = () => {
  const [productUrl, setProductUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"product" | "room" | "visualize">("product");
  const [productData, setProductData] = useState<{ name: string; imageUrl: string } | null>(null);
  const [roomImage, setRoomImage] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    if (!productUrl.trim()) {
      toast.error("Please enter a product URL");
      return;
    }
    
    setIsLoading(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProductData({
      name: "Modern Floor Lamp",
      imageUrl: "/placeholder.svg"
    });
    setIsLoading(false);
    setStep("room");
    toast.success("Product detected! Now capture your space.");
  };

  const handleRoomCapture = async (type: "camera" | "upload") => {
    if (type === "upload") {
      // Simulate file upload
      setRoomImage("/placeholder.svg");
      setStep("visualize");
      toast.success("Room captured! Processing visualization...");
    } else {
      toast.info("Camera capture coming soon!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">The Product View</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/projects">
              <Button variant="ghost" size="sm">My Projects</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator number={1} title="Add Product" active={step === "product"} completed={step !== "product"} />
            <div className={`flex-1 h-0.5 ${step !== "product" ? "bg-primary" : "bg-border"}`} />
            <StepIndicator number={2} title="Capture Room" active={step === "room"} completed={step === "visualize"} />
            <div className={`flex-1 h-0.5 ${step === "visualize" ? "bg-primary" : "bg-border"}`} />
            <StepIndicator number={3} title="Visualize" active={step === "visualize"} completed={false} />
          </div>
        </div>

        {/* Step 1: Product Input */}
        {step === "product" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Add a Product</h1>
              <p className="text-muted-foreground">
                Start by adding the product you want to visualize
              </p>
            </div>

            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Paste URL
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Scan QR
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Paste Product URL</CardTitle>
                    <CardDescription>
                      Copy a link from Home Depot, Wayfair, Amazon, IKEA, or any major retailer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="https://www.homedepot.com/p/..."
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleUrlSubmit} 
                        disabled={isLoading}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Detect
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Supported:</span>
                      {["Home Depot", "Wayfair", "Amazon", "IKEA", "Lowe's", "Target"].map((store) => (
                        <span key={store} className="text-xs px-2 py-1 rounded-full bg-muted">
                          {store}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qr">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Scan QR Code</CardTitle>
                    <CardDescription>
                      Scan a QR code on product packaging or in-store display
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square max-w-sm mx-auto rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 bg-muted/30">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Scan className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Camera access required</p>
                      <Button variant="outline" onClick={() => toast.info("QR scanner coming soon!")}>
                        Enable Camera
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="search">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Search Products</CardTitle>
                    <CardDescription>
                      Search our database of products from partner retailers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for a product..."
                        className="pl-10"
                      />
                    </div>
                    <div className="mt-6 text-center py-8 text-muted-foreground">
                      <p>Start typing to search products</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Step 2: Room Capture */}
        {step === "room" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Capture Your Space</h1>
              <p className="text-muted-foreground">
                Take a photo or upload an image of where you want to place the product
              </p>
            </div>

            {/* Product Preview */}
            {productData && (
              <Card className="glass-card mb-8">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Box className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{productData.name}</h3>
                      <p className="text-sm text-muted-foreground">Ready to visualize</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStep("product")}>
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="glass-card cursor-pointer hover:border-primary/50 transition-smooth group"
                onClick={() => handleRoomCapture("camera")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Take Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your camera to capture the room in real-time
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="glass-card cursor-pointer hover:border-primary/50 transition-smooth group"
                onClick={() => handleRoomCapture("upload")}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Upload Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an existing photo from your device
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Capture the full area where you want to place the product</li>
                <li>Good lighting helps AI detect surfaces accurately</li>
                <li>Include some floor and wall visible for scale reference</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Visualization */}
        {step === "visualize" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Visualization</h1>
              <p className="text-muted-foreground">
                Drag to reposition, pinch to resize, or rotate the product
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Canvas */}
              <div className="lg:col-span-2">
                <Card className="glass-card overflow-hidden">
                  <div className="aspect-[4/3] bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                        <p className="text-muted-foreground">Generating visualization...</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Change Room
                    </Button>
                    <Button variant="outline" size="sm">
                      <Box className="w-4 h-4 mr-2" />
                      Change Product
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reset Position</Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Box className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{productData?.name}</h4>
                        <p className="text-sm text-muted-foreground">$149.99</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      Buy Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Save to Project
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Link2 className="w-4 h-4 mr-2" />
                      Share Link
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-sm">!</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-600 text-sm">Fit Check</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Product appears to fit well in the detected space
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StepIndicator = ({ number, title, active, completed }: { number: number; title: string; active: boolean; completed: boolean }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-smooth ${
        completed ? "bg-primary text-primary-foreground" : 
        active ? "bg-primary/20 text-primary border-2 border-primary" : 
        "bg-muted text-muted-foreground"
      }`}>
        {completed ? "✓" : number}
      </div>
      <span className={`text-xs mt-2 ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {title}
      </span>
    </div>
  );
};

export default Visualize;