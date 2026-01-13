import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Download,
  Award,
  Briefcase,
  Cpu,
  Building,
  Linkedin,
  GraduationCap,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import bizdevLogo from "@/assets/bizdev-monogram.png";
import billMercerPhoto from "@/assets/bill-mercer-profile.png";

const timeline = [
  {
    icon: GraduationCap,
    period: "2008 - 2013",
    title: "Colorado School of Mines",
    description: "Bachelor of Science in Petroleum Engineering with special interest in Drilling, Project and Engineering Economics.",
  },
  {
    icon: Building,
    period: "2013 - 2018",
    title: "Drilling & Field Engineering",
    description: "Drilling Engineer at Ensign Energy Services. Well planning, directional drilling, MWD, and field operations across onshore O&G projects.",
  },
  {
    icon: Cpu,
    period: "2018 - 2019",
    title: "MIT AI & Robotics",
    description: "Completed Artificial & Machine Learning Intelligence certification with focus on Business Analytics and Robotics at Massachusetts Institute of Technology.",
  },
  {
    icon: Briefcase,
    period: "2019 - 2024",
    title: "Business Development Leadership",
    description: "VP of Business Development driving ERP implementations, CRM databases, strategic partnerships, and operational growth across multiple industries.",
  },
  {
    icon: Zap,
    period: "2024 - Present",
    title: "EnWaTel & Platform Innovation",
    description: "Leading infrastructure retrofits with cutting-edge energy, water, and telecom systems. Developed Quantum Bit Code™ (QBC) and launched the Biz Dev App platform.",
  },
];

const certifications = [
  { name: "Telecommunications Technologies", issuer: "BICSI", year: "2025" },
  { name: "Energy Management Certification (EMC)", issuer: "BICSI", year: "2025" },
  { name: "Network Cabling Specialist Fiber Optics", issuer: "BICSI", year: "2024" },
  { name: "AI in Business Analytics and Robotics", issuer: "MIT", year: "2019" },
  { name: "Entrepreneurship", issuer: "Daymond John Academy", year: "2014" },
];

const expertiseCategories = [
  {
    title: "Industry Knowledge",
    skills: [
      "Engineering, Procurement & Construction (EPC)",
      "Petroleum Engineering",
      "Energy & Infrastructure",
      "Telecommunications",
      "Smart Building Systems",
    ],
  },
  {
    title: "Technical Skills",
    skills: [
      "AI & Machine Learning",
      "Fiber Optic Networking",
      "Power Distribution",
      "HVAC & Building Automation",
      "ERP & CRM Systems",
    ],
  },
  {
    title: "Business & Strategy",
    skills: [
      "Strategic Partnerships",
      "Business Development",
      "Intellectual Property Law",
      "Brand Development",
      "Working with Investors",
    ],
  },
];

export default function BdSrvsAbout() {
  return (
    <>
      <Helmet>
        <title>About Bill Mercer | BDSRVS</title>
        <meta name="description" content="Visionary Engineer & Strategic Business Developer with 15+ years transforming infrastructure with technology. Colorado School of Mines, MIT AI certification." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="flex items-center gap-3">
              <img src={bizdevLogo} alt="Biz Dev" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-foreground">BDSRVS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-foreground font-medium">About</Link>
              <Link to="/bdsrvs/services" className="text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link to="/bdsrvs/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <Button asChild>
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/bdsrvs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Profile Photo */}
              <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                <img 
                  src={billMercerPhoto} 
                  alt="Bill Mercer" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 text-foreground">Bill Mercer</h1>
                <p className="text-xl text-primary mb-4">Visionary Engineer | Strategic Business Developer</p>
                <p className="text-lg text-muted-foreground mb-2 italic">
                  Transforming Infrastructure with Technology
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  I'm an engineer, entrepreneur, and systems thinker with a passion for building transformative solutions 
                  at the intersection of energy, telecommunications, AI, and quantum technology. With a degree in Petroleum 
                  Engineering from the Colorado School of Mines and certifications in AI, robotics, and smart infrastructure, 
                  I specialize in designing scalable technologies that enhance operational efficiency, security, and sustainability.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <a href="https://www.linkedin.com/in/bill-mercer-iii/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect on LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Bio (PDF)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extended Bio */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  I lead efforts to retrofit commercial and industrial facilities with cutting-edge energy, water, and 
                  telecom systems. I also developed <strong className="text-foreground">Quantum Bit Code™ (QBC)</strong>—a revolutionary 
                  encryption and communication protocol that fuses multidimensional geometry with quantum-classical hybrid 
                  signal transmission.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether it's launching next-gen infrastructure platforms like <strong className="text-foreground">SMARTLINK</strong>, 
                  reimagining mobile commerce with <strong className="text-foreground">ISO Flash</strong>, or advancing secure global 
                  communication networks, my mission is to engineer the future—ethically, intelligently, and boldly.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Expertise Categories */}
        <section className="py-16 px-6 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Areas of Expertise</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {expertiseCategories.map((category, i) => (
                <Card key={i} className="bg-background border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.skills.map((skill, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-12 text-foreground">Professional Journey</h2>
            
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{item.period}</p>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 px-6 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              Certifications & Education
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {certifications.map((cert, i) => (
                <Card key={i} className="bg-background border-border">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground">My Approach</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <blockquote className="text-xl text-muted-foreground italic leading-relaxed">
                  "Strategy without execution is just a wish. I built the Biz Dev App because 
                  I got tired of great plans dying in slide decks. Every engagement I take on 
                  moves into a Deal Room where terms are clear, deliverables are tracked, and 
                  both parties can see exactly where we stand."
                </blockquote>
                <p className="mt-6 text-muted-foreground">— Bill Mercer</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary-foreground">Let's Connect</h2>
            <p className="text-primary-foreground/80 mb-8">
              Interested in high-impact innovation, joint ventures, or investing in technologies that shape the next era of human advancement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/bdsrvs/contact">Get in Touch</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <a href="https://www.linkedin.com/in/bill-mercer-iii/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn Profile
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
