import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BrandGuide = () => {
  return (
    <div className="container mx-auto px-4 py-16 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
          SmartLink Brand Guidelines
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Our visual identity system ensures consistent, professional communication across all touchpoints.
        </p>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Navy */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Primary Navy - Trust & Reliability</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-primary rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#1B5E87</p>
                <p className="text-xs text-muted-foreground">Main</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-primary-light rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#2D7BA0</p>
                <p className="text-xs text-muted-foreground">Light</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-primary-hover rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#134A6B</p>
                <p className="text-xs text-muted-foreground">Dark</p>
              </div>
            </div>
          </div>

          {/* Accent Gold */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Accent Gold - Premium & Excellence</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-accent rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#D4AF37</p>
                <p className="text-xs text-muted-foreground">Main</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-accent-light rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#E5C55C</p>
                <p className="text-xs text-muted-foreground">Light</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-accent-hover rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#B8941F</p>
                <p className="text-xs text-muted-foreground">Dark</p>
              </div>
            </div>
          </div>

          {/* Supporting Colors */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Supporting Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-slate rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#0F172A</p>
                <p className="text-xs text-muted-foreground">Slate Dark</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-background border-2 border-border rounded-lg mb-2"></div>
                <p className="text-sm font-mono">#FFFFFF</p>
                <p className="text-xs text-muted-foreground">Clean White</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-muted rounded-lg mb-2 border"></div>
                <p className="text-sm font-mono">#F1F5F9</p>
                <p className="text-xs text-muted-foreground">Muted Gray</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Typography System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-display text-3xl font-bold mb-2">Playfair Display</h3>
            <p className="text-muted-foreground mb-4">Display font for headlines and premium messaging</p>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-display text-4xl">The Future of Hospitality</p>
              <p className="font-display text-2xl">Professional Excellence</p>
              <p className="font-display text-xl">SmartLink Solutions</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Inter</h3>
            <p className="text-muted-foreground mb-4">Primary font for body text, UI, and navigation</p>
            <div className="space-y-2">
              <p className="text-lg">Clean, readable, and professional</p>
              <p className="text-base">Perfect for digital interfaces and content</p>
              <p className="text-sm">Available in multiple weights: 300, 400, 500, 600, 700, 800</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Brand Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-primary mb-3">✅ Do</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use navy as the primary brand color</li>
                <li>• Apply gold sparingly for premium emphasis</li>
                <li>• Maintain high contrast for readability</li>
                <li>• Use Playfair Display for impactful headlines</li>
                <li>• Keep layouts clean with ample whitespace</li>
                <li>• Ensure consistent spacing and alignment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-destructive mb-3">❌ Don't</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Overuse gold - it should feel premium</li>
                <li>• Use navy and gold in equal proportions</li>
                <li>• Mix too many additional colors</li>
                <li>• Use decorative fonts for body text</li>
                <li>• Crowd layouts with too many elements</li>
                <li>• Compromise on readability for style</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandGuide;