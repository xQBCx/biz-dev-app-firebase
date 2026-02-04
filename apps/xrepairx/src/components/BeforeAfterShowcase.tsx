import beforeAfter1 from "@/assets/before-after-1.jpg";
import beforeAfter2 from "@/assets/before-after-2.jpg";
import beforeAfter3 from "@/assets/before-after-3.jpg";
const showcaseItems = [{
  id: 1,
  image: beforeAfter1,
  title: "Luxury Sedan Detail",
  description: "From road grime to showroom shine"
}, {
  id: 2,
  image: beforeAfter2,
  title: "Lifted Truck Restoration",
  description: "Mud-caked to immaculate"
}, {
  id: 3,
  image: beforeAfter3,
  title: "Interior Revival",
  description: "Stained seats to pristine comfort"
}];
export const BeforeAfterShowcase = () => {
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to see how well we do?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real results from real vehicles. Every detail matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseItems.map(item => <div key={item.id} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="aspect-video overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-white/80">{item.description}</p>
              </div>
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Before & After
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};