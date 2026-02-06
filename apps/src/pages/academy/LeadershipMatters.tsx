import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Calendar, Quote, Crown, Users, Heart, Target, Compass, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const LeadershipMatters = () => {
  useEffect(() => {
    document.title = "What It Means to Be a Leader: Why Leadership Matters | SmartLink Academy";
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "What It Means to Be a Leader: Why Leadership Matters",
      "author": {
        "@type": "Person",
        "name": "Jason Lopez",
        "jobTitle": "Operations Director"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SmartLink Management",
        "logo": {
          "@type": "ImageObject",
          "url": "https://smartlinkmgt.com/favicon.png"
        }
      },
      "datePublished": "2024-12-01",
      "dateModified": "2024-12-01",
      "description": "A deep exploration of what true leadership means in hospitality—the qualities that define great leaders, the impact they create, and why developing leadership at every level transforms organizations.",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://smartlinkmgt.com/academy/leadership-matters"
      }
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/academy" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Academy
          </Link>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Leadership</Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-300">Featured Article</Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            What It Means to Be a Leader: Why Leadership Matters
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            A deep exploration of what true leadership means in hospitality—the qualities that define great leaders, the impact they create, and why developing leadership at every level transforms organizations.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-semibold">
                JL
              </div>
              <div>
                <p className="text-white font-medium">Jason Lopez</p>
                <p>Operations Director</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>December 1, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>12 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            
            {/* Opening Quote */}
            <Card className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "Leadership is not about being in charge. It is about taking care of those in your charge. The moment you understand this distinction, everything about how you lead changes."
                    </p>
                    <p className="text-muted-foreground text-sm">— A lesson learned from watching the best leaders in hospitality</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Introduction */}
            <h2 className="text-2xl font-bold mb-4">The Question That Defines Everything</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              What does it mean to be a leader? This question seems simple, but the answer reveals everything about how you approach your work, your relationships, and your impact on the people around you. In two decades of hospitality operations, I have seen every imaginable answer to this question play out in real time. I have witnessed leaders who inspired extraordinary performance and loyalty. I have also seen those with impressive titles who left destruction in their wake.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The difference between these two outcomes has nothing to do with intelligence, experience, or technical skill. It comes down to something more fundamental: a deep understanding of what leadership actually is and a genuine commitment to living it every single day.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This article is not a collection of leadership theories or management techniques. It is an exploration of what I have learned about leadership from watching it succeed and fail across hundreds of properties, thousands of employees, and countless guest interactions. My hope is that whether you manage one person or one thousand, these insights will help you become the kind of leader people want to follow.
            </p>

            <Separator className="my-10" />

            {/* Section 1 */}
            <h2 className="text-2xl font-bold mb-4">Leadership Is a Responsibility, Not a Reward</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              One of the most damaging misconceptions about leadership is that it represents the reward for hard work and success. In this view, reaching a leadership position means you have earned the right to give orders, make decisions, and have others serve your needs. This perspective is backwards, and organizations that operate this way suffer tremendously.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              True leadership is not a reward. It is a responsibility. When someone joins your team, they are placing a portion of their professional life in your hands. They are trusting you to guide their development, protect their wellbeing, and create an environment where they can do meaningful work. That trust is sacred, and violating it through self-serving behavior or neglect is one of the most destructive things a person in authority can do.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The best leaders I have encountered approach their roles with humility. They recognize that having people report to them does not make them more important or more valuable. It makes them more accountable. Every person on their team represents a responsibility they take seriously.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold">A Tale of Two Managers</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Early in my career, I worked at a property with two department heads who had similar responsibilities but radically different approaches. The first viewed her role as something she had earned. She arrived late, delegated unpleasant tasks, and expected her team to make her look good. She had been promoted because of her technical expertise, and she believed that expertise entitled her to special treatment.
                </p>
                <p className="text-muted-foreground mb-4">
                  The second manager saw things differently. He arrived early and stayed late, not because he had to, but because he wanted to be available when his team needed him. He took on difficult tasks himself rather than pushing them onto others. When his team succeeded, he gave them credit. When they struggled, he took responsibility and worked alongside them to find solutions.
                </p>
                <p className="text-muted-foreground font-medium">
                  The first manager's team had turnover that cost the property tens of thousands of dollars annually. The second manager's team had people who stayed for years, developed into leaders themselves, and consistently outperformed every metric that mattered. Same organization. Same resources. Radically different results.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold mb-4">The Qualities That Define Great Leaders</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If leadership is a responsibility, then what qualities enable someone to fulfill that responsibility well? I have observed many characteristics in exceptional leaders, but certain qualities appear consistently among those who create lasting positive impact.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold">Genuine Care for People</h3>
                </div>
                <p className="text-muted-foreground">
                  This cannot be faked. People know the difference between a leader who genuinely cares about their wellbeing and one who is simply performing concern. Genuine care shows up in small moments: remembering personal details, noticing when someone seems off, advocating for team members even when it is inconvenient. Leaders who truly care about their people create environments of psychological safety where honesty and vulnerability are possible. Without genuine care, everything else in leadership becomes transactional and shallow.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Integrity in All Things</h3>
                </div>
                <p className="text-muted-foreground">
                  Integrity means that what you say, what you believe, and what you do are aligned. It means keeping promises even when breaking them would be easier. It means admitting mistakes rather than covering them up. It means treating people the same whether or not anyone is watching. Leaders with integrity create trust, and trust is the foundation upon which all effective organizations are built. Without integrity, a leader may achieve short-term results, but they will never inspire the kind of commitment that produces sustained excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold">Clarity of Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  People cannot follow someone who does not know where they are going. Great leaders have a clear vision of what they are trying to build and why it matters. They communicate this vision in ways that connect with people emotionally, not just intellectually. They help team members understand how their daily work contributes to something larger than themselves. A compelling vision provides meaning, and meaning is one of the most powerful motivators that exists.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold">Courage to Make Hard Decisions</h3>
                </div>
                <p className="text-muted-foreground">
                  Leadership requires courage. It requires addressing performance issues that others want to ignore. It requires having difficult conversations that would be easier to postpone. It requires making decisions with incomplete information and accepting responsibility for the outcomes. It requires standing up for what is right even when doing so is unpopular or risky. Leaders who avoid hard decisions may preserve short-term harmony, but they allow problems to fester until they become crises. Courage is uncomfortable in the moment but essential for long-term health.
                </p>
              </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Section 3 */}
            <h2 className="text-2xl font-bold mb-4">Why Leadership Matters So Profoundly</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Understanding what leadership is and what qualities define great leaders is important. But to truly appreciate its significance, we must examine why leadership matters so profoundly, both to organizations and to the individuals within them.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leadership matters because it shapes the lived experience of every person in an organization. The quality of someone's daily work life, their sense of purpose and fulfillment, their opportunities for growth, their stress levels and mental health, their relationships with colleagues—all of these are profoundly influenced by the leaders they work under. A great leader can transform a mundane job into meaningful work. A poor leader can make even a prestigious position feel like a prison.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The impact extends far beyond the walls of the organization. People carry their work experiences home with them. A leader who creates stress and anxiety is affecting families. A leader who creates engagement and satisfaction is improving lives. This ripple effect means that leadership quality has broader social consequences than we often recognize.
            </p>

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "I used to dread coming to work. Now I wake up excited. Same job. Same responsibilities. Different leader. That one change transformed everything about how I experience my work and my life."
                    </p>
                    <p className="text-muted-foreground text-sm">— A front desk supervisor describing the impact of a leadership change</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold mb-4">Leadership Determines Organizational Performance</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Beyond the human impact, leadership quality directly determines organizational performance. Research consistently shows that leadership is one of the strongest predictors of employee engagement, and employee engagement drives every metric that matters: productivity, quality, customer satisfaction, innovation, safety, and profitability.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              In hospitality, this connection is especially direct. Our product is service, and service is delivered by people. When employees are engaged and committed, guests have better experiences. When employees are disengaged and resentful, no amount of training or operational process can compensate. The guest experience is fundamentally a reflection of the employee experience, and the employee experience is fundamentally shaped by leadership.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              I have seen properties with older facilities and limited budgets outperform modern competitors simply because they had better leadership. I have also seen properties with every possible advantage fail because their leaders could not create an environment where people wanted to do their best work. Leadership is not everything, but it is the multiplier that determines how much value an organization extracts from all its other investments.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold">The Numbers Tell the Story</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Across the properties I have worked with, the correlation between leadership quality and performance is striking. Properties with strong leadership consistently achieve guest satisfaction scores 15 to 25 percent higher than comparable properties with weak leadership. They experience turnover rates that are 40 to 60 percent lower, saving enormous sums in hiring and training costs. Their revenue per available room typically exceeds market averages by meaningful margins.
                </p>
                <p className="text-muted-foreground font-medium">
                  These are not small differences. They represent the gap between properties that struggle and properties that thrive. And while many factors contribute to performance, leadership quality is the factor that either enables or undermines everything else.
                </p>
              </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Section 5 */}
            <h2 className="text-2xl font-bold mb-4">Leadership Creates More Leaders</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              One of the most important reasons leadership matters is that good leadership reproduces itself. Great leaders do not just accomplish goals themselves. They develop the people around them into leaders who can accomplish goals independently. This multiplicative effect is how organizations build sustainable excellence rather than depending on the heroic efforts of a few individuals.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When leaders invest in developing others, they create a legacy that extends far beyond their own tenure. The people they develop go on to lead teams and organizations of their own, carrying forward the principles and practices they learned. The impact compounds across time and across organizational boundaries.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Conversely, poor leadership creates cycles of dysfunction. People who learn under bad leaders often replicate those patterns when they move into leadership roles themselves, not because they are bad people, but because they have never seen an alternative model. Breaking these cycles requires intentional investment in developing a different kind of leader.
            </p>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold mb-4">What Leadership Is Not</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Understanding leadership also requires understanding what it is not. Many people in positions of authority confuse leadership with other things, and these confusions create real harm.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leadership is not the same as management. Management is about organizing resources and processes to achieve defined objectives. Leadership is about inspiring people to want to achieve those objectives. Both are necessary, but they are different skills. You can be an excellent manager and a poor leader. You can be a natural leader with weak management skills. The best organizational contributors develop both capabilities, but they should never be confused.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leadership is not the same as authority. Authority comes from a position. Leadership comes from character and conduct. Having authority without leadership creates compliance without commitment. People do what they must but no more. Having leadership without authority creates informal influence. People follow because they choose to, even without formal structures requiring it. The most effective leaders have both, but leadership is the more powerful force.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leadership is not the same as expertise. Being the most skilled or knowledgeable person in a domain does not make you a leader in that domain. It makes you an expert. Expertise can enhance leadership, but it does not substitute for the ability to guide, develop, and inspire others. Many organizations make the mistake of promoting their best individual contributors into leadership roles without recognizing that the skills required are entirely different.
            </p>

            <Card className="bg-slate-50 dark:bg-slate-800/50 mb-10">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-3">The Expertise Trap</h3>
                <p className="text-muted-foreground mb-4">
                  I have watched this pattern destroy promising careers. A brilliant technician gets promoted to supervisor because of their technical excellence. They have no idea how to lead people, and no one teaches them. They default to what they know: focusing on technical details while neglecting the human side of their new role. Their team becomes frustrated and disengaged. Performance suffers. The former star performer is now a struggling manager who wonders what went wrong.
                </p>
                <p className="text-muted-foreground font-medium">
                  Organizations that care about their people do not set them up to fail this way. They recognize that moving into leadership requires new skills and provide the development necessary to build them.
                </p>
              </CardContent>
            </Card>

            <Separator className="my-10" />

            {/* Section 7 */}
            <h2 className="text-2xl font-bold mb-4">Becoming the Leader You Want to Be</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If leadership matters this much, the natural question is how to become better at it. The good news is that leadership capability can be developed. While some people may have natural inclinations that make leadership easier, the core skills and mindsets of effective leadership can be learned and practiced by anyone willing to do the work.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The development process begins with self-awareness. You cannot improve what you do not understand. Honest reflection on your current leadership patterns, ideally supplemented by feedback from those you lead, provides the foundation for growth. What are your strengths? What are your blind spots? Where do your good intentions fail to translate into effective actions? Answering these questions honestly is uncomfortable but essential.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Development continues through intentional practice. Leadership is not a set of ideas to understand but a set of behaviors to embody. You become better at having difficult conversations by having them. You become better at developing others by doing the work of development. You become better at casting vision by practicing articulating and communicating what matters. Like any skill, leadership improves through deliberate, repeated effort with feedback and adjustment.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Development is accelerated by learning from others. Finding mentors who exemplify the leadership you want to embody, studying how effective leaders operate, joining communities of practice where you can share experiences and insights—all of these provide perspectives and models that speed your growth. No one develops great leadership in isolation.
            </p>

            {/* Final Thoughts */}
            <h2 className="text-2xl font-bold mb-4">The Call to Lead</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Leadership is not reserved for those with formal titles or designated authority. Every person in every role has opportunities to lead: to influence others positively, to set an example worth following, to contribute to building something larger than themselves. The choice to embrace these opportunities is a choice anyone can make.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              For those who do hold formal leadership positions, the call is even more urgent. You have been entrusted with responsibility for other people's professional lives. How you fulfill that responsibility will shape their experiences, their development, and their wellbeing. It will determine whether your organization achieves its potential or falls short. It will influence whether the people you lead go on to become great leaders themselves or replicate patterns of dysfunction.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This responsibility should not be taken lightly. But it should also not be feared. Leadership, done well, is one of the most rewarding experiences available in professional life. There is profound satisfaction in helping others grow, in building something meaningful together, in knowing that your presence makes a positive difference. The challenges are real, but so are the rewards.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The world needs more great leaders. Not more people with impressive titles, but more people who genuinely care about others, lead with integrity, provide clear direction, and have the courage to do what is right. If you have the opportunity to become that kind of leader, take it. The people you lead, the organization you serve, and your own sense of purpose will all be better for it.
            </p>

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500 mb-10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Quote className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg italic text-foreground mb-2">
                      "At the end of your career, you will not remember the reports you filed or the meetings you attended. You will remember the people you helped grow, the teams you built, and the difference you made in others' lives. That is what leadership is really about."
                    </p>
                    <p className="text-muted-foreground text-sm">— A reflection on what truly matters</p>
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
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold flex-shrink-0">
                  JL
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Jason Lopez</h3>
                  <p className="text-muted-foreground mb-4">Operations Director</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Jason leads operations at SmartLink Management, where he focuses on building systems that empower teams and developing leaders at every level of the organization. With over twenty years of experience in hospitality operations, he has seen firsthand how leadership quality determines organizational outcomes and is passionate about sharing what he has learned.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Develop Leaders Across Your Organization</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              SmartLink Management partners with owners who understand that great hospitality starts with great leadership. Let us help you build the leadership culture your property deserves.
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
    </PublicLayout>
  );
};

export default LeadershipMatters;