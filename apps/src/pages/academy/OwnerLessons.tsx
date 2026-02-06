import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Calendar, Quote, Heart, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
const OwnerLessons = () => {
  useEffect(() => {
    document.title = "Leading from Within: Building Teams That Thrive | SmartLink Academy";
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Leading from Within: Building Teams That Thrive",
      "author": {
        "@type": "Person",
        "name": "Brittany Patel",
        "jobTitle": "Owner & Operator"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SmartLink Management",
        "logo": {
          "@type": "ImageObject",
          "url": "https://smartlinkmgt.com/favicon.png"
        }
      },
      "datePublished": "2024-11-05",
      "dateModified": "2024-11-05",
      "description": "What it means to be a team, leading from an owner's perspective by working alongside your people to build a culture that creates a beautiful work environment.",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://smartlinkmgt.com/academy/owner-lessons"
      }
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/academy" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Academy
          </Link>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Owner Perspective</Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">Featured Article</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Leading from Within: Building Teams That Thrive
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            What it means to be a team, leading from an owner's perspective by working alongside your people to build a culture that creates a beautiful work environment.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 font-semibold">
                BP
              </div>
              <div>
                <p className="text-white font-medium">Brittany Patel</p>
                <p>Owner & Operator</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>November 5, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>10 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            
            {/* Opening Quote */}
            <Card className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "The moment I stopped seeing myself as the boss and started seeing myself as a teammate who happens to own the building, everything changed. My team didn't just work harder—they started caring. And when people care, magic happens."
                    </p>
                    <p className="text-muted-foreground text-sm">— Brittany Patel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Introduction */}
            <h2 className="text-2xl font-bold mb-4">The Owner Who Cleans Rooms</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              I own two hotels. I also know how to strip a bed in under ninety seconds, fix a running toilet, check in a guest while handling a complaint on the phone, and make the perfect pot of lobby coffee. I know these things because I do them. Not occasionally. Regularly.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Some owners might think this is beneath them. I used to worry that my team would respect me less if they saw me with a mop in my hand. The opposite happened. When they saw me willing to do any job on the property, something shifted. The invisible wall between "owner" and "staff" started to crumble. We became something else entirely. We became a team.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This is not an article about management techniques or operational efficiency, though both of those matter. This is about something deeper. This is about what it means to build a team that genuinely cares, a culture that people want to be part of, and a work environment so positive that your employees become your greatest advocates. It starts with a fundamental truth: leadership is not about standing above your team. It is about standing beside them.
            </p>

            <Separator className="my-10" />

            {/* Section 1 */}
            <h2 className="text-2xl font-bold mb-4">Understanding What a Team Really Means</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The word "team" gets thrown around so casually in business that it has lost much of its meaning. Every company calls its employees a team. Job postings promise candidates they will be joining an amazing team. Mission statements reference the importance of teamwork. But calling a group of people a team does not make them one.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A real team is something you feel. It is the housekeeper who notices a colleague is overwhelmed and quietly takes two rooms off their list without being asked. It is the front desk agent who stays late to help the night auditor who is struggling with a new system. It is the maintenance technician who remembers that the morning shift manager is afraid of spiders and takes care of a spider situation in the lobby before she arrives. These small acts of consideration, multiplied across dozens of interactions every day, create something powerful. They create belonging.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When people belong, they do not just show up for a paycheck. They show up for each other. They take pride in their work not because someone is watching, but because letting down their teammates feels unthinkable. This kind of team does not happen by accident. It has to be cultivated, protected, and led by example.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold">The Moment I Understood</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Three years ago, we had a devastating flood at my Colorado property. Water everywhere. Guests displaced. Chaos. I was overwhelmed, trying to coordinate with insurance, with the fire department, with guests who were understandably upset.
                </p>
                <p className="text-muted-foreground mb-4">
                  At some point during that endless night, I looked up and saw something that made me stop. My team had organized themselves without any direction from me. Maria was coordinating room relocations. James was moving furniture to protect it from water damage. Sarah was in the lobby with coffee and blankets, personally attending to every displaced guest. My maintenance tech Carlos had already called two plumber friends who were on their way to help, free of charge.
                </p>
                <p className="text-muted-foreground font-medium">
                  Nobody told them to do any of this. They just did it. Because it was their hotel too. That night, I understood what a team really means.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold mb-4">Leading from Alongside, Not from Above</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Traditional leadership models position the leader at the top of a pyramid. Information flows up. Decisions flow down. The leader is separate, elevated, different. This model works for some businesses. It does not work for hospitality.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              In hotels, every employee is on the front lines. The housekeeper interacts with guests. The maintenance worker interacts with guests. The breakfast attendant, the front desk agent, the night auditor—everyone is part of the guest experience. When leadership feels distant from these front-line realities, a disconnect forms. Policies get created that make sense in theory but fail in practice. Recognition goes to the wrong behaviors. Problems get hidden rather than surfaced.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leading from alongside means being present. It means knowing how every job on your property actually works because you have done each one yourself. It means being in the lobby during busy check-in times, not because you do not trust your team, but because you want to understand their challenges firsthand. It means asking questions with genuine curiosity rather than interrogating for mistakes.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold">What This Looks Like in Practice</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Every Friday morning, I work a front desk shift at one of my properties. Not every Friday, but most of them. I check guests in. I handle complaints. I answer the phone. I run credit cards and make keys.
                </p>
                <p className="text-muted-foreground mb-4">
                  At first, my team found this strange. Why would the owner do front desk work? But over time, it became normal. And something interesting happened. People started telling me things they might not otherwise share. Concerns about a new policy that was causing friction. Ideas for improving the guest experience. Frustrations with a vendor who was not delivering on promises.
                </p>
                <p className="text-muted-foreground font-medium">
                  When you work alongside people, the hierarchy flattens. Conversations happen that would never happen in a formal meeting. You learn what your team actually needs, not what they think you want to hear.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold mb-4">Building a Culture People Want to Be Part Of</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Culture is one of the most misunderstood concepts in business. Companies create elaborate value statements and hang them on walls. They hold culture workshops and team-building retreats. They buy ping-pong tables and stock break rooms with snacks. None of this creates culture. Culture is created through consistent daily actions, especially the actions of leadership.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Your team watches everything you do. They notice when you take responsibility for mistakes versus when you blame others. They see how you treat the vendors who deliver supplies. They observe whether you greet the overnight houseperson by name. Every interaction sends a message about what kind of workplace this really is.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The culture I have worked to build is rooted in a simple belief: every person on this team matters. Not in a corporate poster way, but in a real, tangible way. We celebrate birthdays and work anniversaries. We know the names of each other's children. We help each other through hard times, whether that means covering shifts or passing the hat for someone facing unexpected medical bills. We have cried together and laughed together and gotten through impossible situations together.
            </p>

            <Card className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "I've worked at other hotels. The pay was similar. The work was similar. But it never felt like this. Here, I actually want to come to work. That might sound small, but it changes everything."
                    </p>
                    <p className="text-muted-foreground text-sm">— Gabby, Housekeeping Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Section 4 */}
            <h2 className="text-2xl font-bold mb-4">Creating a Beautiful Work Environment</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When people hear "work environment," they often think of physical spaces. Nice break rooms. Comfortable uniforms. Updated equipment. These things matter, and I invest in them. But the environment that truly shapes the employee experience is emotional, not physical.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A beautiful work environment is one where people feel safe to be themselves. Where making a mistake does not mean being humiliated. Where asking for help is seen as strength, not weakness. Where different personalities and backgrounds are not just tolerated but genuinely celebrated. Where people can have a bad day without fearing for their job.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Creating this kind of environment requires intentionality. It requires having difficult conversations when someone's behavior is undermining psychological safety. It requires protecting your culture from people who might be individually talented but are toxic to the team. It requires modeling vulnerability by admitting your own mistakes openly.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-3">The Things That Actually Matter</h3>
                <p className="text-muted-foreground mb-4">
                  Over the years, I have learned that the small things create the environment, not the big gestures. It is the way you respond when someone calls in sick with a real need. It is remembering that a team member's mother is having surgery and following up to ask how it went. It is defending your team when a guest is being unreasonable, even if it means losing that guest's business.
                </p>
                <p className="text-muted-foreground mb-4">
                  It is also the absence of negative things. No gossip from leadership. No favoritism. No tolerance for bullying or harassment, ever, regardless of who is responsible. When people see that the rules apply equally to everyone, including management, trust builds. When they see that you will protect them, loyalty builds.
                </p>
                <p className="text-muted-foreground font-medium">
                  The most beautiful work environments are not the ones with the nicest furniture. They are the ones where people feel seen, valued, and protected.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold mb-4">The Ripple Effects of Genuine Care</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When you build a team that truly cares for each other, something remarkable happens. That care extends outward. Employees who feel valued at work treat guests differently. They are more patient with difficult situations. They go above and beyond without being asked. They represent your property with genuine pride rather than scripted professionalism.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our guest review scores improved dramatically as we focused on internal culture. Not because we implemented new guest service training, though we did some of that too. But because people who feel good about their work do better work. People who feel supported by their employer extend that support to guests. The energy that flows from a healthy team is palpable, and guests feel it the moment they walk in.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The ripple effects extend to recruitment and retention as well. In an industry notorious for high turnover, our properties experience turnover rates far below industry averages. When positions do open, our best source of candidates is referrals from current employees. People want to bring their friends and family members into an environment they love. That is the ultimate measure of a beautiful workplace.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold">What Our Numbers Show</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  I am often asked to quantify the business impact of culture. Here is what I can share from our properties. Our staff turnover is 23 percent compared to the industry average of over 70 percent. This alone saves hundreds of thousands of dollars annually in hiring and training costs. Our guest satisfaction scores consistently exceed 4.7 out of 5, placing us in the top tier of comparable properties. Our repeat guest rate is 34 percent, driven largely by guests who specifically mention our staff in reviews.
                </p>
                <p className="text-muted-foreground font-medium">
                  But the number that means the most to me cannot be measured. It is the feeling I get when I walk through my properties and see people who are genuinely happy to be there. That is the ROI of culture.
                </p>
              </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Section 6 */}
            <h2 className="text-2xl font-bold mb-4">The Hard Parts Nobody Talks About</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              I would be dishonest if I painted this as simple or easy. Building genuine team culture while running a profitable business involves real tensions. Sometimes you have to make decisions that disappoint people you care about. Budget constraints mean saying no to requests that would make the team happy. Performance issues require difficult conversations, even with long-tenured employees you genuinely like.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The hardest part is protecting the culture from people who do not belong in it. I have had to let go of employees who were individually competent but corrosive to the team environment. One person who gossips or undermines others can poison a culture that took years to build. Making those calls is gut-wrenching, especially when you know the personal circumstances someone might be facing.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leading this way also requires vulnerability that does not come naturally to everyone. Admitting mistakes. Asking for feedback and genuinely receiving it. Letting people see you struggle. For owners who are used to projecting confidence and authority, this can feel uncomfortable, even risky. But authentic leadership requires letting people see you as human, not just as a title.
            </p>

            {/* Final Thoughts */}
            <h2 className="text-2xl font-bold mb-4">What It All Comes Down To</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              After seven years of ownership, I have come to believe that the greatest competitive advantage in hospitality is not location, though location matters. It is not brand, though brand carries weight. It is not even the physical product, though we invest significantly in our properties. The greatest advantage is people who care.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You cannot fake this. You cannot buy it with higher wages alone, though fair compensation is essential. You cannot manufacture it with team-building exercises or motivational posters. You can only create it by genuinely caring about the people who work with you, and demonstrating that care through consistent actions over time.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When you stand beside your team rather than above them, something beautiful emerges. They stop being employees and become partners in creating something meaningful. They stop working for the hotel and start working for each other. They stop punching clocks and start building something they believe in.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This is what it means to be a team. This is what leading from within looks like. And for any owner willing to do the work, this is what is possible.
            </p>

            <Card className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "The hotel business is hard. Long hours. Demanding guests. Endless problems to solve. But when you have a real team, when people genuinely have each other's backs, it becomes something else. It becomes a kind of family. And that makes all of it worthwhile."
                    </p>
                    <p className="text-muted-foreground text-sm">— Brittany Patel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Bio */}
          <Separator className="my-10" />
          
          <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-bold flex-shrink-0">
                  BP
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Brittany Patel</h3>
                  <p className="text-muted-foreground mb-4">Owner & Operator</p>
                  <p className="text-muted-foreground leading-relaxed">Brittany owns and operates two hospitality properties in Colorado and Arizona. With a background in real estate and seven years of hands on hotel ownership experience, she writes about the human side of hospitality, focusing on team building, culture creation, and what it really means to be an owner operator. She is passionate about proving that profitability and genuine care for employees are not mutually exclusive.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Build a Team That Thrives</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              SmartLink Management partners with owners who believe that great hospitality starts with great teams. Let us help you create the culture your property deserves.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/partner-with-us">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Partner With Us
                </Button>
              </Link>
              <Link to="/academy">
                <Button size="lg" variant="outline">
                  Explore More Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>;
};
export default OwnerLessons;