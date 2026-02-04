import VenueCard from "./VenueCard";

const VenueGrid = () => {
  const mockVenues = [
    {
      id: "1",
      name: "The Velvet Room",
      type: "Nightclub",
      genre: "EDM",
      crowdLevel: "high" as const,
      image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80",
      distance: "0.3 mi",
      openUntil: "3 AM",
    },
    {
      id: "2",
      name: "Texas Roadhouse",
      type: "Restaurant",
      genre: "American",
      crowdLevel: "medium" as const,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      distance: "0.5 mi",
      openUntil: "10 PM",
    },
    {
      id: "3",
      name: "Ball Arena",
      type: "Sports Venue",
      genre: "NBA Game",
      crowdLevel: "packed" as const,
      image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
      distance: "2.1 mi",
      openUntil: "11 PM",
    },
    {
      id: "4",
      name: "Washington Park",
      type: "Park & Recreation",
      genre: "Sunday Funday",
      crowdLevel: "medium" as const,
      image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
      distance: "0.8 mi",
      openUntil: "Sunset",
    },
    {
      id: "5",
      name: "Breakfast Queen",
      type: "Brunch Spot",
      genre: "Brunch",
      crowdLevel: "high" as const,
      image: "https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&q=80",
      distance: "0.4 mi",
      openUntil: "3 PM",
    },
    {
      id: "6",
      name: "AMC Theatres",
      type: "Movie Theater",
      genre: "Latest Releases",
      crowdLevel: "low" as const,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
      distance: "1.2 mi",
      openUntil: "12 AM",
    },
    {
      id: "7",
      name: "Red Rocks Amphitheatre",
      type: "Concert Venue",
      genre: "Live Concert",
      crowdLevel: "packed" as const,
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
      distance: "8.5 mi",
      openUntil: "11 PM",
    },
    {
      id: "8",
      name: "Skyline Rooftop",
      type: "Rooftop Bar",
      genre: "Live Band",
      crowdLevel: "medium" as const,
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
      distance: "0.6 mi",
      openUntil: "1 AM",
    },
    {
      id: "9",
      name: "Denver X Games",
      type: "Event",
      genre: "Extreme Sports",
      crowdLevel: "packed" as const,
      image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
      distance: "3.2 mi",
      openUntil: "9 PM",
    },
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockVenues.map((venue, index) => (
            <VenueCard key={index} {...venue} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VenueGrid;
