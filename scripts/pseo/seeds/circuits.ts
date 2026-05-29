// scripts/pseo/seeds/circuits.ts — 7 Uttarakhand travel circuits
import type { CircuitSeed } from '@/types/pseo';

export const CIRCUITS: CircuitSeed[] = [
  {
    name: 'Rishikesh Circuit',
    slug: 'rishikesh-circuit',
    tagline: 'Adventure Capital of India — Rafting, Yoga & Himalayan Thrills',
    overview:
      'The Rishikesh Circuit is Uttarakhand\'s most popular adventure destination, stretching along the Ganges from the sacred town of Rishikesh through the rafting corridors of Shivpuri and Kaudiyala to the serene trails of Kunjapuri and Rajaji National Park. Known globally as the Yoga Capital of the World, Rishikesh blends adrenaline-pumping activities like white-water rafting, bungee jumping, and cliff camping with spiritual experiences at ancient ashrams and temples along the Ganges.',
    base_city: 'Rishikesh',
    hub_city: 'Rishikesh',
    destinations: [
      'rishikesh', 'shivpuri', 'kaudiyala', 'mohanchatti',
      'neer-garh-waterfall', 'beatles-ashram', 'triveni-ghat',
      'kunjapuri-temple', 'rajaji-national-park',
    ],
    primary_activities: [
      'rafting', 'camping', 'yoga', 'bungee-jumping',
      'trekking', 'cliff-jumping', 'kayaking', 'meditation',
    ],
    best_seasons: ['summer', 'autumn', 'winter'],
    image: '/images/pseo/circuits/rishikesh.jpg',
  },
  {
    name: 'Dehradun Circuit',
    slug: 'dehradun-circuit',
    tagline: 'Hill Station Heritage — From Mussoorie\'s Charm to Kanatal\'s Solitude',
    overview:
      'The Dehradun Circuit encompasses the capital city of Uttarakhand and its surrounding hill stations, from the colonial-era charm of Mussoorie to the offbeat serenity of Chakrata and Kanatal. This circuit offers a perfect blend of history, nature, and adventure. Visit the iconic George Everest viewpoint for panoramic Himalayan views, explore underground caves at Robber\'s Cave, soak in the natural sulphur springs of Sahastradhara, and find spiritual peace at the Mindrolling Monastery.',
    base_city: 'Dehradun',
    hub_city: 'Dehradun',
    destinations: [
      'dehradun', 'mussoorie', 'george-everest', 'robbers-cave',
      'sahastradhara', 'mindrolling-monastery', 'chakrata', 'kanatal',
    ],
    primary_activities: [
      'sightseeing', 'nature-walks', 'camping', 'stargazing',
      'photography', 'cable-car', 'cave-exploration', 'trekking',
    ],
    best_seasons: ['summer', 'autumn', 'winter'],
    image: '/images/pseo/circuits/dehradun.jpg',
  },
  {
    name: 'Haridwar Circuit',
    slug: 'haridwar-circuit',
    tagline: 'Gateway to the Gods — Sacred Ganges & Spiritual Immersion',
    overview:
      'The Haridwar Circuit is the spiritual gateway to Uttarakhand\'s Char Dham pilgrimage. Haridwar, one of the seven holiest cities in Hinduism, hosts the mesmerizing Ganga Aarti at Har Ki Pauri every evening. This circuit connects to Rishikesh\'s adventure corridors, Rajaji National Park\'s wildlife sanctuaries, and ancient temple routes. Perfect for spiritual travelers, pilgrims, and those seeking a deeper connection with India\'s sacred geography.',
    base_city: 'Haridwar',
    hub_city: 'Haridwar',
    destinations: [
      'haridwar', 'har-ki-pauri', 'mansa-devi', 'chandi-devi',
      'rajaji-national-park', 'saptrishi-ashram',
    ],
    primary_activities: [
      'ganga-aarti', 'temple-visits', 'wildlife-safari',
      'spiritual-walks', 'yoga', 'meditation', 'river-bathing',
    ],
    best_seasons: ['autumn', 'winter', 'summer'],
    image: '/images/pseo/circuits/haridwar.jpg',
  },
  {
    name: 'Chopta / Rudraprayag Circuit',
    slug: 'chopta-circuit',
    tagline: 'Mini Switzerland of India — Alpine Meadows, Ancient Temples & Sacred Treks',
    overview:
      'The Chopta–Rudraprayag Circuit is a paradise for trekkers and temple devotees alike. Chopta, often called the Mini Switzerland of Uttarakhand, sits at 2,680m surrounded by dense oak and rhododendron forests with panoramic views of the Himalayan peaks including Trishul, Nanda Devi, and Chaukhamba. The Tungnath temple — the highest Shiva temple in the world at 3,680m — and the sacred Triyuginarayan Temple where Lord Shiva married Goddess Parvati are jewels of this circuit.',
    base_city: 'Rudraprayag',
    hub_city: 'Rudraprayag',
    destinations: [
      'chopta', 'tungnath', 'chandrashila', 'kartik-swami',
      'triyuginarayan-temple', 'dhari-devi-temple', 'deoria-tal',
    ],
    primary_activities: [
      'trekking', 'temple-visits', 'meadow-camping', 'photography',
      'bird-watching', 'stargazing', 'snow-trekking',
    ],
    best_seasons: ['summer', 'autumn', 'winter', 'snowfall'],
    image: '/images/pseo/circuits/chopta.jpg',
  },
  {
    name: 'Joshimath / Auli Circuit',
    slug: 'joshimath-auli-circuit',
    tagline: 'High Himalayan Gateway — Skiing, Valley of Flowers & Sacred Peaks',
    overview:
      'The Joshimath–Auli Circuit is Uttarakhand\'s highest-altitude travel destination, serving as the gateway to the Valley of Flowers, Hemkund Sahib, and the last Indian village of Mana near the Tibetan border. Auli is India\'s premier skiing destination in winter, while summer transforms the region into a carpet of wildflowers and alpine meadows. Joshimath itself is a significant religious center — one of the four cardinal mathas established by Adi Shankaracharya.',
    base_city: 'Joshimath',
    hub_city: 'Joshimath',
    destinations: [
      'auli', 'joshimath', 'valley-of-flowers', 'hemkund-sahib',
      'mana-village', 'badrinath',
    ],
    primary_activities: [
      'skiing', 'trekking', 'pilgrimage', 'photography',
      'cable-car', 'meadow-walks', 'snow-activities',
    ],
    best_seasons: ['summer', 'winter', 'snowfall'],
    image: '/images/pseo/circuits/auli.jpg',
  },
  {
    name: 'Uttarkashi Circuit',
    slug: 'uttarkashi-circuit',
    tagline: 'Trekker\'s Paradise — Kedarkantha, Dayara Bugyal & Pristine Valleys',
    overview:
      'The Uttarkashi Circuit is the heartland of high-altitude trekking in Uttarakhand. Home to legendary treks like Kedarkantha (12,500 ft), Dayara Bugyal (one of Asia\'s largest alpine meadows), and the ancient Har Ki Dun valley trail, this circuit offers pristine wilderness far from tourist crowds. The charming village of Harshil, nestled at 7,860 ft along the Bhagirathi river, is the region\'s hidden gem — surrounded by apple orchards and deodar forests with views of snow-capped peaks.',
    base_city: 'Uttarkashi',
    hub_city: 'Uttarkashi',
    destinations: [
      'harshil', 'kedarkantha', 'dayara-bugyal', 'har-ki-dun',
      'uttarkashi', 'dodital',
    ],
    primary_activities: [
      'high-altitude-trekking', 'camping', 'photography',
      'snow-trekking', 'village-walks', 'fishing',
    ],
    best_seasons: ['summer', 'autumn', 'winter', 'snowfall'],
    image: '/images/pseo/circuits/uttarkashi.jpg',
  },
  {
    name: 'Kumaon Circuit',
    slug: 'kumaon-circuit',
    tagline: 'Serene Kumaon — Ancient Temples, Himalayan Views & Quiet Retreats',
    overview:
      'The Kumaon Circuit traverses the quieter, more reflective side of Uttarakhand. From the hilltop orchards of Mukteshwar to the wildlife sanctuary of Binsar, the panoramic dawn views of Kausani (Gandhi\'s Switzerland of India), the rugged frontier beauty of Munsiyari, and the ancient temple complex of Jageshwar — this circuit is perfect for travelers seeking depth over adventure. Patal Bhuvaneshwar, a legendary limestone cave temple, adds a mystical dimension to the journey.',
    base_city: 'Almora',
    hub_city: 'Almora',
    destinations: [
      'mukteshwar', 'binsar', 'kausani', 'munsiyari',
      'jageshwar', 'patal-bhuvaneshwar', 'almora', 'ranikhet',
    ],
    primary_activities: [
      'temple-visits', 'nature-walks', 'photography',
      'bird-watching', 'heritage-walks', 'stargazing', 'trekking',
    ],
    best_seasons: ['summer', 'autumn', 'winter'],
    image: '/images/pseo/circuits/kumaon.jpg',
  },
];
