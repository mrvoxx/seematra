// types/pseo.ts — Canonical type definitions for the Seematra pSEO engine

// ─── Page Types ───────────────────────────────────────────────────────────────

export const PSEO_PAGE_TYPES = [
  'circuit_hub',
  'destination_guide',
  'itinerary',
  'comparison',
  'activity',
  'seasonal',
  'persona',
  'intent',
  'faq_hub',
  'nearby_places',
] as const;

export type PseoPageType = (typeof PSEO_PAGE_TYPES)[number];

// ─── Entity Types ─────────────────────────────────────────────────────────────

export const ENTITY_TYPES = ['destination', 'activity', 'attraction', 'trek'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export interface EntityTag {
  type: EntityType;
  name: string;
  slug: string;
  circuit?: string;
}

// ─── Travel Enums ─────────────────────────────────────────────────────────────

export const TRAVELER_PERSONAS = [
  'couple', 'honeymoon', 'family', 'solo', 'backpacker',
  'luxury', 'spiritual', 'adventure', 'photographer',
  'workation', 'senior',
] as const;
export type TravelerPersona = (typeof TRAVELER_PERSONAS)[number];

export const SEASONS = ['summer', 'monsoon', 'autumn', 'winter', 'snowfall'] as const;
export type Season = (typeof SEASONS)[number];

export const TRAVEL_STYLES = ['budget', 'mid-range', 'luxury'] as const;
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export const ITINERARY_DURATIONS = ['1D', '2D/1N', '3D/2N', '4D/3N', '5D/4N', '6D/5N'] as const;
export type ItineraryDuration = (typeof ITINERARY_DURATIONS)[number];

// ─── Intent SEO Layer ─────────────────────────────────────────────────────────

export const INTENT_CATEGORIES = [
  'best_time',
  'budget_trip',
  'weekend_trip',
  'how_to_reach',
  'hidden_places',
  'couple_trip',
  'adventure',
  'family_trip',
  'things_to_do',
  'travel_tips',
] as const;
export type IntentCategory = (typeof INTENT_CATEGORIES)[number];

export interface IntentTemplate {
  category: IntentCategory;
  slug_pattern: string;
  title_pattern: string;
  meta_pattern: string;
  target_intent: string;
  applicable_to: ('circuit' | 'destination')[];
  min_words: number;
}

// ─── Internal Linking ─────────────────────────────────────────────────────────

export const LINK_WEIGHTS = ['high', 'medium', 'low'] as const;
export type LinkWeight = (typeof LINK_WEIGHTS)[number];

export const LINK_RELATIONSHIPS = ['parent', 'child', 'sibling', 'cross'] as const;
export type LinkRelationship = (typeof LINK_RELATIONSHIPS)[number];

export interface WeightedLink {
  slug: string;
  title: string;
  weight: LinkWeight;
  relationship: LinkRelationship;
}

// ─── CTR-Optimized SEO Fields ─────────────────────────────────────────────────

export interface PseoSeo {
  title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  target_intent: string;
}

// ─── Page Document (stored in MongoDB pseo_pages) ─────────────────────────────

export interface PseoPage {
  _id?: string;
  slug: string;
  page_type: PseoPageType;
  status: 'draft' | 'published' | 'archived';
  circuit: string;
  title: string;
  content: PseoPageContent;
  seo: PseoSeo;
  internal_links: WeightedLink[];
  related_pages: WeightedLink[];
  faq: PseoFaq[];
  entity_tags: EntityTag[];
  schema_markup: Record<string, unknown>;
  generated_at: Date;
  updated_at: Date;
  word_count: number;
  content_hash: string;
}

export interface PseoFaq {
  question: string;
  answer: string;
}

// ─── Page Content by Type ─────────────────────────────────────────────────────

export type PseoPageContent =
  | CircuitHubContent
  | DestinationGuideContent
  | ItineraryContent
  | ComparisonContent
  | ActivityContent
  | SeasonalContent
  | PersonaContent
  | IntentContent
  | FaqHubContent
  | NearbyPlacesContent;

// Circuit Hub
export interface CircuitHubContent {
  type: 'circuit_hub';
  overview: string;
  destinations: CircuitDestinationEntry[];
  activities: string[];
  best_seasons: SeasonInfo[];
  budget_overview: BudgetRange;
  transportation: TransportInfo;
  sample_itineraries: string[];
}

export interface CircuitDestinationEntry {
  name: string;
  slug: string;
  description: string;
  image: string;
  altitude?: string;
  distance_from_hub: string;
  highlights: string[];
}

export interface SeasonInfo {
  season: Season;
  months: string;
  description: string;
  recommended: boolean;
  weather: string;
  road_conditions?: string;
}

export interface BudgetRange {
  budget: { min: number; max: number };
  mid_range: { min: number; max: number };
  luxury: { min: number; max: number };
  currency: 'INR';
  note: string;
}

export interface TransportInfo {
  from_delhi: { distance_km: number; drive_hours: number; bus_available?: boolean; bus?: boolean; train_to?: string };
  from_dehradun?: { distance_km: number; drive_hours: number };
  nearest_airport: string;
  nearest_railway: string;
  local_transport: string;
  route_summary: string;
}

// Destination Guide
export interface DestinationGuideContent {
  type: 'destination_guide';
  introduction: string;
  why_visit: string[];
  best_time: SeasonInfo[];
  how_to_reach: TransportInfo;
  things_to_do: ThingToDo[];
  nearby_places: NearbyPlace[];
  hotels: HotelSuggestion[];
  trip_cost: BudgetRange;
  itinerary_suggestions: string[];
}

export interface ThingToDo {
  name: string;
  category: string;
  description: string;
  duration: string;
  difficulty?: string;
  best_season?: string;
}

export interface NearbyPlace {
  name: string;
  slug: string;
  distance_km: number;
  travel_hours: number;
  description: string;
  image?: string;
}

export interface HotelSuggestion {
  tier: TravelStyle;
  area: string;
  price_range: string;
  description: string;
}

// Itinerary
export interface ItineraryContent {
  type: 'itinerary';
  circuit: string;
  duration: { days: number; nights: number };
  travel_style: TravelStyle;
  traveler_persona: TravelerPersona;
  best_season: Season[];
  destinations_covered: string[];
  starting_point: string;
  ending_point: string;
  estimated_budget: { min: number; max: number; currency: 'INR' };
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  activities: string[];
  itinerary_days: ItineraryDay[];
  hotels: ItineraryHotel[];
  transportation: ItineraryTransport;
}

export interface ItineraryDay {
  day: number;
  title: string;
  overnight_stay: string;
  timeline: ItineraryTimelineEntry[];
}

export interface ItineraryTimelineEntry {
  time: string;
  activity: string;
  description: string;
  location: string;
}

export interface ItineraryHotel {
  destination: string;
  hotel_type: string;
  suggested_area: string;
}

export interface ItineraryTransport {
  pickup_available: boolean;
  vehicle_type: string;
  route_summary: string;
}

// Comparison
export interface ComparisonContent {
  type: 'comparison';
  destination_a: ComparisonEntry;
  destination_b: ComparisonEntry;
  comparison_table: ComparisonRow[];
  verdict: string;
  persona_recommendations: { persona: TravelerPersona; recommendation: string }[];
}

export interface ComparisonEntry {
  name: string;
  slug: string;
  circuit: string;
  image: string;
  tagline: string;
}

export interface ComparisonRow {
  category: string;
  destination_a: string;
  destination_b: string;
}

// Activity
export interface ActivityContent {
  type: 'activity';
  activity_name: string;
  overview: string;
  best_spots: ActivitySpot[];
  seasonal_availability: SeasonInfo[];
  what_to_bring: string[];
  safety_tips: string[];
  cost_estimate: string;
  related_itineraries: string[];
}

export interface ActivitySpot {
  name: string;
  location: string;
  difficulty: string;
  description: string;
  best_season: string;
}

// Seasonal
export interface SeasonalContent {
  type: 'seasonal';
  season: Season;
  circuit: string;
  overview: string;
  weather: { temp_range: string; rainfall: string; conditions: string };
  activities: string[];
  road_conditions: string;
  packing_list: string[];
  accommodation_notes: string;
  travel_warnings: string[];
  recommended_destinations: string[];
}

// Persona
export interface PersonaContent {
  type: 'persona';
  persona: TravelerPersona;
  circuit: string;
  overview: string;
  why_this_circuit: string;
  recommended_activities: string[];
  budget_tier: TravelStyle;
  accommodation_style: string;
  itinerary_suggestions: string[];
  tips: string[];
}

// Intent
export interface IntentContent {
  type: 'intent';
  intent_category: IntentCategory;
  target_destination: string;
  target_circuit: string;
  overview: string;
  sections: IntentSection[];
}

export interface IntentSection {
  heading: string;
  body: string;
  data?: Record<string, unknown>;
}

// FAQ Hub
export interface FaqHubContent {
  type: 'faq_hub';
  circuit: string;
  overview: string;
  categories: { name: string; faqs: PseoFaq[] }[];
}

// Nearby Places
export interface NearbyPlacesContent {
  type: 'nearby_places';
  hub_destination: string;
  overview: string;
  places: NearbyPlace[];
}

// ─── Seed Data Types ──────────────────────────────────────────────────────────

export interface CircuitSeed {
  name: string;
  slug: string;
  tagline: string;
  overview: string;
  base_city: string;
  hub_city: string;
  destinations: string[];
  primary_activities: string[];
  best_seasons: Season[];
  image: string;
}

export interface TravelTimeEntry {
  to: string;
  km: number;
  hours: number;
}

export interface SeasonWeather {
  season: Season;
  months: string;
  temp_min: number;
  temp_max: number;
  rainfall: string;
  road_conditions: string;
  crowd_level: 'low' | 'medium' | 'high';
  accessible: boolean;
}

export interface DestinationSeed {
  name: string;
  slug: string;
  circuit: string;
  district: string;
  coords: { lat: number; lng: number };
  altitude_m: number;
  description: string;
  why_visit: string[];
  image: string;
  best_months: string;
  from_delhi: { distance_km: number; drive_hours: number; bus: boolean; train_to?: string };
  from_dehradun: { distance_km: number; drive_hours: number };
  nearest_airport: string;
  nearest_railway: string;
  travel_times: TravelTimeEntry[];
  activities: string[];
  attractions: string[];
  accommodation: { budget: string; mid: string; luxury: string };
  weather: SeasonWeather[];
}

export interface ActivitySeed {
  name: string;
  slug: string;
  category: string;
  destinations: string[];
  difficulty: string;
  duration: string;
  best_seasons: Season[];
  description: string;
  safety_notes: string;
  cost_range: string;
}

export interface EntitySeed {
  name: string;
  slug: string;
  type: EntityType;
  circuit: string;
  destinations: string[];
  description: string;
}
