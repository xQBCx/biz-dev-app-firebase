// Mock venue data for portal navigation
export interface MockVenue {
  slug: string;
  name: string;
  type: string;
  category: 'nightlife' | 'dining' | 'sports' | 'entertainment' | 'parks_recreation';
  description: string;
  address: string;
  phone: string;
  website: string;
  current_genre: string;
  open_until: string;
  crowd_level: 'low' | 'medium' | 'high' | 'packed';
  is_live: boolean;
  image_url: string;
  energy_level: number;
}

export const mockVenues: MockVenue[] = [
  {
    slug: 'club-neon-nights',
    name: 'Club Neon Nights',
    type: 'Nightclub',
    category: 'nightlife',
    description: 'The hottest nightclub in town featuring world-class DJs, stunning light shows, and an unforgettable atmosphere. Three floors of music including EDM, hip-hop, and house. VIP bottle service available with exclusive rooftop access.',
    address: '420 Electric Ave, Downtown',
    phone: '+1 (555) 123-4567',
    website: 'https://neonnights.club',
    current_genre: 'EDM / House',
    open_until: '4:00 AM',
    crowd_level: 'high',
    is_live: true,
    image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200',
    energy_level: 9,
  },
  {
    slug: 'the-velvet-lounge',
    name: 'The Velvet Lounge',
    type: 'Cocktail Bar',
    category: 'nightlife',
    description: 'An intimate speakeasy-style cocktail bar with craft cocktails, live jazz, and a sophisticated atmosphere. Perfect for date nights or catching up with friends over expertly crafted drinks.',
    address: '88 Whiskey Row, Arts District',
    phone: '+1 (555) 234-5678',
    website: 'https://velvetlounge.bar',
    current_genre: 'Live Jazz',
    open_until: '2:00 AM',
    crowd_level: 'medium',
    is_live: true,
    image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200',
    energy_level: 6,
  },
  {
    slug: 'extreme-arena',
    name: 'Extreme Arena',
    type: 'X-Games Venue',
    category: 'sports',
    description: 'The ultimate destination for extreme sports enthusiasts. Watch live skateboarding, BMX, motocross, and snowboard competitions. Full concessions, VIP viewing areas, and meet-and-greet opportunities with pro athletes.',
    address: '1 Adrenaline Blvd, Sports Complex',
    phone: '+1 (555) 345-6789',
    website: 'https://extremearena.com',
    current_genre: 'Skateboard Finals',
    open_until: '11:00 PM',
    crowd_level: 'packed',
    is_live: true,
    image_url: 'https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?w=1200',
    energy_level: 10,
  },
  {
    slug: 'the-golden-fork',
    name: 'The Golden Fork',
    type: 'Fine Dining',
    category: 'dining',
    description: 'Award-winning fine dining experience featuring farm-to-table cuisine by Chef Marcus Sterling. Multi-course tasting menus paired with an extensive wine collection. Reservations recommended.',
    address: '555 Gourmet Lane, Uptown',
    phone: '+1 (555) 456-7890',
    website: 'https://goldenfork.restaurant',
    current_genre: 'Live Piano',
    open_until: '11:00 PM',
    crowd_level: 'medium',
    is_live: false,
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    energy_level: 4,
  },
  {
    slug: 'skyline-vip',
    name: 'Skyline VIP',
    type: 'VIP Lounge',
    category: 'nightlife',
    description: 'Exclusive members-only rooftop lounge with panoramic city views, premium bottle service, and celebrity DJ sets. The ultimate destination for those seeking luxury nightlife experiences.',
    address: 'Penthouse, 100 Tower Plaza',
    phone: '+1 (555) 567-8901',
    website: 'https://skylinevip.club',
    current_genre: 'Deep House',
    open_until: '3:00 AM',
    crowd_level: 'low',
    is_live: true,
    image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200',
    energy_level: 7,
  },
  {
    slug: 'cloud-nine-rooftop',
    name: 'Cloud Nine Rooftop',
    type: 'Rooftop Bar',
    category: 'nightlife',
    description: 'Stunning open-air rooftop bar with breathtaking skyline views, craft cocktails, and a relaxed vibe. Features fire pits, cabanas, and weekend brunch service.',
    address: '200 Sunset Heights, Midtown',
    phone: '+1 (555) 678-9012',
    website: 'https://cloudnine.bar',
    current_genre: 'Tropical House',
    open_until: '1:00 AM',
    crowd_level: 'high',
    is_live: true,
    image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200',
    energy_level: 7,
  },
];

export const getVenueBySlug = (slug: string): MockVenue | undefined => {
  return mockVenues.find((venue) => venue.slug === slug);
};
