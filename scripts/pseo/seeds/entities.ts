// scripts/pseo/seeds/entities.ts — Entity registry for cross-page linking
import type { EntitySeed } from '@/types/pseo';

export const ENTITIES: EntitySeed[] = [
  // ─── Trek Entities ──────────────────────────────────────────────────────────
  { name: 'Kedarkantha Trek', slug: 'kedarkantha-trek', type: 'trek', circuit: 'uttarkashi-circuit', destinations: ['kedarkantha'], description: 'One of India\'s best winter treks at 12,500 ft with stunning summit views of the Greater Himalayan range.' },
  { name: 'Tungnath–Chandrashila Trek', slug: 'tungnath-chandrashila-trek', type: 'trek', circuit: 'chopta-circuit', destinations: ['chopta', 'tungnath'], description: 'A 5 km trek to the world\'s highest Shiva temple and a 360° Himalayan summit viewpoint.' },
  { name: 'Valley of Flowers Trek', slug: 'valley-of-flowers-trek', type: 'trek', circuit: 'joshimath-auli-circuit', destinations: ['valley-of-flowers', 'joshimath'], description: 'UNESCO World Heritage trek through a valley of 600+ species of wildflowers in the monsoon season.' },
  { name: 'Har Ki Dun Trek', slug: 'har-ki-dun-trek', type: 'trek', circuit: 'uttarkashi-circuit', destinations: ['har-ki-dun'], description: 'A 7-day cradle-shaped valley trek in Govind Pashu Vihar National Park, known for ancient villages and alpine beauty.' },
  { name: 'Dayara Bugyal Trek', slug: 'dayara-bugyal-trek', type: 'trek', circuit: 'uttarkashi-circuit', destinations: ['dayara-bugyal'], description: 'Trek to one of Asia\'s largest and most beautiful alpine meadows at 3,408m, carpeted in wildflowers during summer.' },
  { name: 'Deoria Tal Trek', slug: 'deoria-tal-trek', type: 'trek', circuit: 'chopta-circuit', destinations: ['deoria-tal', 'chopta'], description: 'A short 3 km trek to a high-altitude lake that perfectly mirrors the Chaukhamba peaks.' },

  // ─── Attraction Entities ────────────────────────────────────────────────────
  { name: 'Lakshman Jhula', slug: 'lakshman-jhula', type: 'attraction', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'Iconic 450-foot suspension bridge over the Ganges, a landmark of Rishikesh.' },
  { name: 'Beatles Ashram', slug: 'beatles-ashram', type: 'attraction', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'The abandoned Maharishi Mahesh Yogi ashram where The Beatles stayed in 1968, now an open-air art gallery.' },
  { name: 'Triveni Ghat', slug: 'triveni-ghat', type: 'attraction', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'Sacred bathing ghat at the confluence of three rivers, hosting the famous evening Ganga Aarti.' },
  { name: 'Har Ki Pauri', slug: 'har-ki-pauri', type: 'attraction', circuit: 'haridwar-circuit', destinations: ['haridwar'], description: 'The most sacred ghat in Haridwar where Lord Vishnu is said to have left his footprint, hosting the spectacular evening Ganga Aarti.' },
  { name: 'Kempty Falls', slug: 'kempty-falls', type: 'attraction', circuit: 'dehradun-circuit', destinations: ['mussoorie'], description: 'Uttarakhand\'s most visited waterfall near Mussoorie, cascading from 40 feet into a natural pool.' },
  { name: 'George Everest Peak', slug: 'george-everest-peak', type: 'attraction', circuit: 'dehradun-circuit', destinations: ['mussoorie'], description: 'The ruins of Sir George Everest\'s house offering panoramic views of the Doon Valley and snow-capped Himalayas.' },
  { name: 'Robber\'s Cave', slug: 'robbers-cave', type: 'attraction', circuit: 'dehradun-circuit', destinations: ['dehradun'], description: 'A natural cave formation near Dehradun where a river stream mysteriously disappears and reappears underground.' },
  { name: 'Neer Garh Waterfall', slug: 'neer-garh-waterfall', type: 'attraction', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'A beautiful two-tiered waterfall just 5 km from Rishikesh, perfect for a refreshing dip in natural rock pools.' },
  { name: 'Kunjapuri Temple', slug: 'kunjapuri-temple', type: 'attraction', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'A Shakti Peeth temple at 1,645m offering spectacular sunrise views of the Himalayan range and Ganges valley.' },
  { name: 'Mansa Devi Temple', slug: 'mansa-devi-temple', type: 'attraction', circuit: 'haridwar-circuit', destinations: ['haridwar'], description: 'An ancient hilltop temple accessible by cable car, dedicated to the wish-fulfilling goddess Mansa Devi.' },
  { name: 'Chandrashila Peak', slug: 'chandrashila-peak', type: 'attraction', circuit: 'chopta-circuit', destinations: ['chopta', 'tungnath'], description: 'Summit at 4,000m above Tungnath offering a 360° view of Himalayan giants including Nanda Devi, Trishul, and Chaukhamba.' },
  { name: 'Deoria Tal', slug: 'deoria-tal', type: 'attraction', circuit: 'chopta-circuit', destinations: ['chopta'], description: 'A high-altitude emerald lake that perfectly mirrors the Chaukhamba peaks, surrounded by dense oak and rhododendron forests.' },
  { name: 'Surkanda Devi Temple', slug: 'surkanda-devi-temple', type: 'attraction', circuit: 'dehradun-circuit', destinations: ['kanatal'], description: 'A Shakti Peeth temple near Kanatal with 360° panoramic views of the snow-capped Himalayan range.' },
  { name: 'Auli Artificial Lake', slug: 'auli-artificial-lake', type: 'attraction', circuit: 'joshimath-auli-circuit', destinations: ['auli'], description: 'One of the highest artificial lakes in the world at 2,500m, built for snowmaking on Auli\'s ski slopes.' },
  { name: 'Jageshwar Temple Complex', slug: 'jageshwar-temples', type: 'attraction', circuit: 'kumaon-circuit', destinations: ['jageshwar'], description: 'A complex of 124 ancient stone temples dating from 7th to 14th century, set in a deodar forest valley — one of the oldest temple sites in India.' },
  { name: 'Patal Bhuvaneshwar Cave', slug: 'patal-bhuvaneshwar-cave', type: 'attraction', circuit: 'kumaon-circuit', destinations: ['patal-bhuvaneshwar'], description: 'A mystical underground limestone cave temple at 1,350m with stalactite formations believed to depict scenes from Hindu mythology.' },
  { name: 'Anasakti Ashram', slug: 'anasakti-ashram', type: 'attraction', circuit: 'kumaon-circuit', destinations: ['kausani'], description: 'The ashram where Mahatma Gandhi stayed in 1929 and wrote Anashakti Yoga, overlooking the Himalayan panorama.' },
  { name: 'Mukteshwar Dham', slug: 'mukteshwar-dham', type: 'attraction', circuit: 'kumaon-circuit', destinations: ['mukteshwar'], description: 'A 350-year-old Shiva temple perched dramatically on a cliff edge with views of the Kumaon Himalayas.' },

  // ─── Activity Entities (cross-reference) ────────────────────────────────────
  { name: 'White Water Rafting', slug: 'rafting-entity', type: 'activity', circuit: 'rishikesh-circuit', destinations: ['rishikesh', 'shivpuri', 'kaudiyala'], description: 'World-class rafting on the Ganges with Grade II–IV rapids.' },
  { name: 'Bungee Jumping', slug: 'bungee-entity', type: 'activity', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'India\'s highest commercial bungee jump at 83m near Rishikesh.' },
  { name: 'Skiing at Auli', slug: 'skiing-entity', type: 'activity', circuit: 'joshimath-auli-circuit', destinations: ['auli'], description: 'India\'s premier ski resort with professional slopes and courses.' },

  // ─── Destination Entities ───────────────────────────────────────────────────
  { name: 'Rishikesh', slug: 'rishikesh-entity', type: 'destination', circuit: 'rishikesh-circuit', destinations: ['rishikesh'], description: 'Yoga Capital of the World and adventure sports hub on the Ganges.' },
  { name: 'Mussoorie', slug: 'mussoorie-entity', type: 'destination', circuit: 'dehradun-circuit', destinations: ['mussoorie'], description: 'The Queen of Hills — colonial-era hill station with Himalayan views.' },
  { name: 'Haridwar', slug: 'haridwar-entity', type: 'destination', circuit: 'haridwar-circuit', destinations: ['haridwar'], description: 'One of India\'s seven holiest cities, gateway to the Char Dham.' },
  { name: 'Chopta', slug: 'chopta-entity', type: 'destination', circuit: 'chopta-circuit', destinations: ['chopta'], description: 'Mini Switzerland of Uttarakhand — base camp for Tungnath trek.' },
  { name: 'Auli', slug: 'auli-entity', type: 'destination', circuit: 'joshimath-auli-circuit', destinations: ['auli'], description: 'India\'s premier skiing destination with panoramic Himalayan views.' },
  { name: 'Kausani', slug: 'kausani-entity', type: 'destination', circuit: 'kumaon-circuit', destinations: ['kausani'], description: 'Gandhi\'s Switzerland of India — 300 km Himalayan panorama.' },
];
