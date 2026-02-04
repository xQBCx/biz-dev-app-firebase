import processDirty from "@/assets/process-dirty.jpg";
import processFoam from "@/assets/process-foam.jpg";
import processHandwash from "@/assets/process-handwash.jpg";
import processInterior from "@/assets/process-interior.jpg";
import processEngine from "@/assets/process-engine.jpg";
import processTires from "@/assets/process-tires.jpg";

const processSteps = [
  {
    id: 1,
    image: processDirty,
    title: "Assessment",
    description: "We evaluate your vehicle's condition to customize our approach",
    step: "01",
  },
  {
    id: 2,
    image: processFoam,
    title: "Foam Bath",
    description: "Premium snow foam loosens dirt without scratching",
    step: "02",
  },
  {
    id: 3,
    image: processHandwash,
    title: "Hand Wash",
    description: "Meticulous two-bucket method with microfiber mitts",
    step: "03",
  },
  {
    id: 4,
    image: processInterior,
    title: "Interior Detail",
    description: "Deep cleaning, conditioning, and protection for every surface",
    step: "04",
  },
  {
    id: 5,
    image: processEngine,
    title: "Engine Bay",
    description: "Safe, thorough cleaning that restores under-hood beauty",
    step: "05",
  },
  {
    id: 6,
    image: processTires,
    title: "Wheels & Tires",
    description: "Polished wheels and dressed tires complete the transformation",
    step: "06",
  },
];

export const ProcessShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want to see how we do what we do?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From exotic supercars to family SUVs, our process delivers showroom results every time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              
              <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">{step.step}</span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/80 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            Whether you drive a Lamborghini, a lifted truck, or a daily commuter — we treat every vehicle like it's our own.
          </p>
        </div>
      </div>
    </section>
  );
};