import { LifeEvent } from '../../types';

export const WORLD_EVENTS_EXPANDED: LifeEvent[] = [
  // ─── Economic Shocks ──────────────────────────────────────────────────────────
  { id: 'wex_housing_crisis', minAge: 18, maxAge: 70, title: 'Housing Market Collapse', description: 'Prices fell forty percent in one year. Homeowners panicked; renters saw opportunity.', statEffect: { wealth: -8, mentalHealth: -5 }, choices: [
    { id: 'buy_housing_dip', text: 'Buy property at the dip', subtext: 'Contrarian move', statEffect: { wealth: 10, ambition: 6 }, bankEffect: -200000 },
    { id: 'wait_housing', text: 'Wait and see', subtext: 'Let it stabilise', statEffect: { happiness: 3 } },
  ], category: 'random', weight: 4, color: '#EF4444' },
  { id: 'wex_hyperinflation', minAge: 18, maxAge: 70, title: 'Hyperinflation Wave', description: 'Prices doubled in six months. Your salary bought half of what it used to. Grocery shopping became painful.', statEffect: { wealth: -10, mentalHealth: -8, happiness: -8 }, category: 'random', weight: 4, color: '#EF4444' },
  { id: 'wex_recession_personal', minAge: 22, maxAge: 65, title: 'Recession Hits Close to Home', description: 'The economic downturn hit your industry particularly hard. Contracts were cancelled and colleagues let go.', statEffect: { wealth: -6, mentalHealth: -6, happiness: -6 }, category: 'random', weight: 5, color: '#EF4444' },
  { id: 'wex_supply_chain_crisis', minAge: 18, maxAge: 65, title: 'Global Supply Chain Disruption', description: 'Shelves were empty, shipping took months, and prices for basic goods were unpredictable. You adapted.', statEffect: { wealth: -4, mentalHealth: -3, intelligence: 3 }, category: 'random', weight: 5, color: '#F97316' },
  { id: 'wex_oil_price_spike', minAge: 18, maxAge: 70, title: 'Oil Price Spike', description: 'Energy prices tripled. Petrol, heating, and goods prices followed. Your monthly budget needed revision.', statEffect: { wealth: -5, happiness: -5, mentalHealth: -3 }, category: 'random', weight: 5, color: '#F97316' },

  // ─── Political Events ─────────────────────────────────────────────────────────
  { id: 'wex_landmark_election', minAge: 18, maxAge: 80, title: 'Landmark Election', description: 'A historic election with enormous consequences for the country. You voted and watched the results all night.', statEffect: { social: 5, intelligence: 4, mentalHealth: -3 }, choices: [
    { id: 'candidate_won', text: 'Your candidate won', subtext: 'Hope restored', statEffect: { happiness: 10, mentalHealth: 8 } },
    { id: 'candidate_lost', text: 'Your candidate lost', subtext: 'Disappointment', statEffect: { happiness: -8, mentalHealth: -6 } },
  ], category: 'random', weight: 6, color: '#8B5CF6' },
  { id: 'wex_protest_movement', minAge: 16, maxAge: 65, title: 'Historic Protest Movement', description: 'Millions marched worldwide. Whether you joined or watched, the scale was impossible to ignore.', statEffect: { social: 6, intelligence: 4 }, choices: [
    { id: 'joined_protest', text: 'Joined the movement', subtext: 'Be on the right side of history', statEffect: { karma: 8, social: 8, happiness: 5 } },
    { id: 'watched_protest', text: 'Watched from home', subtext: 'Observed carefully', statEffect: { intelligence: 4 } },
  ], category: 'random', weight: 5, color: '#8B5CF6' },
  { id: 'wex_new_law_impact', minAge: 18, maxAge: 70, title: 'Landmark Law Passed', description: 'A new government policy directly affected your tax bracket, rights, or industry.', statEffect: { wealth: 5, intelligence: 3 }, category: 'random', weight: 6, color: '#8B5CF6' },
  { id: 'wex_war_breaks_out', minAge: 18, maxAge: 70, title: 'Armed Conflict Nearby', description: 'War broke out in a neighbouring country. Refugees arrived. Prices for certain goods rose sharply.', statEffect: { mentalHealth: -10, happiness: -8, karma: 4 }, category: 'random', weight: 2, color: '#EF4444', rarity: 'rare' },
  { id: 'wex_peace_agreement', minAge: 18, maxAge: 70, title: 'Historic Peace Agreement', description: 'A long-standing conflict ended with a signed accord. You watched the ceremony and felt something rare — hope.', statEffect: { happiness: 8, mentalHealth: 6, karma: 5 }, category: 'random', weight: 3, color: '#10B981' },

  // ─── Technology & Society ─────────────────────────────────────────────────────
  { id: 'wex_ai_revolution', minAge: 18, maxAge: 65, title: 'AI Revolution Changes Everything', description: 'Artificial intelligence displaced entire job categories overnight. You scrambled to retrain and stay relevant.', statEffect: { intelligence: 8, mentalHealth: -6, wealth: -4, ambition: 6 }, category: 'random', weight: 5, color: '#8B5CF6' },
  { id: 'wex_social_media_outage', minAge: 14, maxAge: 55, title: 'Major Social Media Outage', description: 'Every major platform went down for 36 hours. Society mostly survived. The quiet was unsettling.', statEffect: { mentalHealth: 6, happiness: 5, social: -4 }, category: 'random', weight: 6, color: '#F97316' },
  { id: 'wex_data_privacy_scandal', minAge: 18, maxAge: 65, title: 'Global Data Privacy Scandal', description: 'It emerged that a major company had been selling your data for years. You read the privacy policy for the first time.', statEffect: { intelligence: 5, mentalHealth: -3, happiness: -3 }, category: 'random', weight: 6, color: '#F97316' },
  { id: 'wex_green_energy_transition', minAge: 18, maxAge: 65, title: 'Green Energy Policy Enacted', description: 'The government mandated a rapid shift to renewable energy. Your electricity bill changed. The air quality improved.', statEffect: { health: 5, intelligence: 4, wealth: -2 }, category: 'random', weight: 5, color: '#10B981' },
  { id: 'wex_space_discovery', minAge: 10, maxAge: 80, title: 'Major Space Discovery', description: 'Scientists confirmed signs of something extraordinary beyond Earth. The implications were too large to fully process.', statEffect: { intelligence: 8, happiness: 6, mentalHealth: 5 }, category: 'random', weight: 4, color: '#8B5CF6', rarity: 'uncommon' },

  // ─── Natural Events ───────────────────────────────────────────────────────────
  { id: 'wex_earthquake_local', minAge: 5, maxAge: 80, title: 'Significant Earthquake', description: 'The ground shook for thirty seconds. Windows cracked. You stayed in the doorframe like you were taught.', statEffect: { health: -3, mentalHealth: -8, happiness: -5 }, category: 'random', weight: 4, color: '#EF4444' },
  { id: 'wex_flood_area', minAge: 10, maxAge: 70, title: 'Major Flooding', description: 'The river broke its banks. Emergency services worked through the night. You helped where you could.', statEffect: { health: -4, happiness: -8, karma: 5 }, category: 'random', weight: 4, color: '#EF4444' },
  { id: 'wex_wildfire', minAge: 14, maxAge: 70, title: 'Wildfires Nearby', description: 'Air quality alerts, evacuation warnings, and smoke you could smell from miles away. Climate change made it worse.', statEffect: { health: -5, mentalHealth: -6, happiness: -5 }, category: 'random', weight: 4, color: '#EF4444' },
  { id: 'wex_pandemic_outbreak', minAge: 18, maxAge: 70, title: 'Pandemic Lockdowns', description: 'A novel virus spread globally. Borders closed. You worked from home, ate sourdough, and got through it.', statEffect: { health: -5, mentalHealth: -12, happiness: -10, social: -8 }, bankEffect: -5000, category: 'random', weight: 3, color: '#EF4444', rarity: 'rare' },
  { id: 'wex_heatwave_record', minAge: 18, maxAge: 80, title: 'Record-Breaking Heatwave', description: 'Temperatures broke every record. You stayed indoors, drank litres of water, and worried about the future.', statEffect: { health: -4, happiness: -5, mentalHealth: -3 }, category: 'random', weight: 5, color: '#F97316' },

  // ─── Cultural Moments ─────────────────────────────────────────────────────────
  { id: 'wex_cultural_movement', minAge: 16, maxAge: 65, title: 'Defining Cultural Moment', description: 'A book, film, song, or event became a generational touchstone. You were there when it happened.', statEffect: { happiness: 8, social: 6, intelligence: 4 }, category: 'random', weight: 5, color: '#8B5CF6' },
  { id: 'wex_sporting_event_national', minAge: 8, maxAge: 80, title: 'National Sporting Triumph', description: 'Your country won something significant. Strangers hugged in the street. You cried at the anthem.', statEffect: { happiness: 12, social: 10 }, category: 'random', weight: 5, color: '#10B981' },
  { id: 'wex_famous_death', minAge: 10, maxAge: 80, title: 'Loss of a Cultural Icon', description: 'Someone whose work had been the soundtrack or backdrop of your life died. You paused to acknowledge what they meant.', statEffect: { happiness: -8, mentalHealth: -4 }, category: 'random', weight: 5, color: '#8B5CF6' },
];
