import { LifeEvent } from '../../types';
import { COLORS } from '@theme';

// ─── Classic Scenario (modern life extras not in the main pool) ───────────────
const CLASSIC_EVENTS: LifeEvent[] = [
  { id: 'scl_viral_project', minAge: 20, maxAge: 40, title: 'Side Project Goes Viral', description: 'Something you built for fun attracted thousands of users overnight. You did not expect this.', statEffect: { ambition: 10, happiness: 10, social: 8 }, category: 'career', weight: 3, color: COLORS.orchid, requiresScenario: ['classic'], rarity: 'rare' },
  { id: 'scl_smart_home', minAge: 25, maxAge: 55, title: 'Smart Home Automation', description: "You spent a weekend automating your home. Everything responds to your voice now. You feel like you're living in the future.", statEffect: { happiness: 8, intelligence: 5 }, category: 'random', weight: 6, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_podcast_launched', minAge: 22, maxAge: 45, title: 'Launched a Podcast', description: 'You started recording your thoughts. By episode twelve, you had a small but devoted audience.', statEffect: { social: 8, ambition: 6, happiness: 6 }, category: 'career', weight: 5, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_influencer_collab', minAge: 18, maxAge: 35, title: 'Influencer Collaboration', description: 'A popular content creator invited you to collaborate. The combined reach surprised you.', statEffect: { social: 12, happiness: 8, wealth: 4 }, category: 'career', weight: 4, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_remote_work_abroad', minAge: 22, maxAge: 45, title: 'Working Remotely from Abroad', description: 'You moved to a different country while keeping your job. A laptop, a visa, and a sea view.', statEffect: { happiness: 14, intelligence: 5, social: 6 }, bankEffect: -5000, category: 'random', weight: 4, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_subscription_empire', minAge: 25, maxAge: 50, title: 'Subscription Business Passive Income', description: 'You built a software product generating consistent monthly recurring revenue.', statEffect: { ambition: 10, wealth: 8, happiness: 8 }, bankEffect: 5000, category: 'financial', weight: 3, color: COLORS.orchid, requiresScenario: ['classic'], rarity: 'uncommon' },
  { id: 'scl_therapy_breakthrough', minAge: 22, maxAge: 55, title: 'Therapy Breakthrough', description: 'After months in therapy, a single session unlocked something. You understood yourself differently.', statEffect: { mentalHealth: 18, happiness: 10, intelligence: 5 }, category: 'health', weight: 5, color: COLORS.emerald, requiresScenario: ['classic'] },
  { id: 'scl_bought_first_car_ev', minAge: 22, maxAge: 40, title: 'First Electric Vehicle', description: 'You bought an EV. The charging infrastructure was occasionally frustrating. The planet silently approved.', statEffect: { happiness: 8, karma: 5 }, bankEffect: -30000, category: 'financial', weight: 5, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_cowork_community', minAge: 20, maxAge: 40, title: 'Coworking Community', description: 'A coworking space introduced you to a startup founder, a journalist, and a musician in the same week.', statEffect: { social: 12, ambition: 8 }, category: 'random', weight: 6, color: COLORS.orchid, requiresScenario: ['classic'] },
  { id: 'scl_food_critic', minAge: 25, maxAge: 55, title: 'Amateur Food Critic Fame', description: 'Your restaurant review blog developed a following. Restaurants started reserving tables for you.', statEffect: { social: 8, happiness: 10 }, category: 'random', weight: 4, color: COLORS.orchid, requiresScenario: ['classic'] },
];

// ─── Royal Dynasty Scenario ────────────────────────────────────────────────────
const ROYAL_EVENTS: LifeEvent[] = [
  { id: 'roy_coronation', minAge: 18, maxAge: 35, title: 'Coronation Ceremony', description: 'The crown was placed on your head before ten thousand subjects. The weight was more than symbolic.', statEffect: { social: 15, ambition: 12, happiness: 10 }, category: 'milestone', weight: 5, color: COLORS.gold, requiresScenario: ['royal'], rarity: 'epic', oneTime: true },
  { id: 'roy_arranged_marriage', minAge: 18, maxAge: 30, title: 'Diplomatic Marriage Arranged', description: 'Your marriage was negotiated between two kingdoms. You met your future spouse at the announcement.', statEffect: { social: 10, happiness: -5, mentalHealth: -5 }, choices: [
    { id: 'accept_marriage', text: 'Accept for the kingdom', subtext: 'Duty over desire', statEffect: { karma: 10, social: 10 } },
    { id: 'refuse_marriage', text: 'Refuse and choose your own', subtext: 'Defiance has costs', statEffect: { happiness: 12, social: -8 } },
  ], category: 'relationship', weight: 6, color: COLORS.gold, requiresScenario: ['royal'] },
  { id: 'roy_coup_attempt', minAge: 20, maxAge: 55, title: 'Coup Attempt Uncovered', description: 'Intelligence reports revealed a plot against your rule. You acted before they did.', statEffect: { mentalHealth: -10, ambition: 5, social: -5 }, choices: [
    { id: 'exile_plotters', text: 'Exile the conspirators', subtext: 'Mercy over punishment', statEffect: { karma: 8, social: 5 } },
    { id: 'execute_plotters', text: 'Make an example of them', subtext: 'Fear as policy', statEffect: { karma: -15, ambition: 5 } },
  ], category: 'crime', weight: 3, color: COLORS.gold, requiresScenario: ['royal'], rarity: 'rare' },
  { id: 'roy_famine_crisis', minAge: 20, maxAge: 60, title: 'Kingdom Faces Famine', description: 'Drought decimated the harvest. Your subjects needed food. Treasury or dignity — choose.', statEffect: { mentalHealth: -8, happiness: -8 }, choices: [
    { id: 'open_treasury', text: 'Open the royal granaries', subtext: 'People before wealth', statEffect: { karma: 20, social: 10 }, bankEffect: -50000 },
    { id: 'trade_for_food', text: 'Negotiate emergency trade', subtext: 'Political solution', statEffect: { intelligence: 8, karma: 5 } },
  ], category: 'random', weight: 4, color: COLORS.gold, requiresScenario: ['royal'] },
  { id: 'roy_royal_heir', minAge: 20, maxAge: 40, title: 'Royal Heir Born', description: 'The dynasty continues. The birth was announced to the kingdom by cannon fire.', statEffect: { happiness: 18, social: 10, karma: 5 }, category: 'milestone', weight: 5, color: COLORS.gold, requiresScenario: ['royal'], rarity: 'uncommon', incrementsChildren: true },
  { id: 'roy_foreign_ambassador', minAge: 22, maxAge: 60, title: 'Foreign Ambassador Arrives', description: 'A delegate from across the sea brought gifts, demands, and an ulterior motive.', statEffect: { intelligence: 6, social: 5 }, choices: [
    { id: 'sign_treaty', text: 'Sign the trade treaty', subtext: 'Wealth through alliance', statEffect: { wealth: 10, karma: 5 }, bankEffect: 30000 },
    { id: 'reject_demands', text: 'Reject the terms', subtext: 'Sovereignty first', statEffect: { ambition: 8, social: -5 } },
  ], category: 'career', weight: 5, color: COLORS.gold, requiresScenario: ['royal'] },
  { id: 'roy_palace_intrigue', minAge: 18, maxAge: 50, title: 'Palace Intrigue', description: 'A trusted advisor was discovered to be feeding information to a rival noble.', statEffect: { mentalHealth: -8, happiness: -6 }, choices: [
    { id: 'dismiss_quietly', text: 'Dismiss them quietly', subtext: 'Avoid scandal', statEffect: { karma: 5, social: 3 } },
    { id: 'public_trial', text: 'Hold a public trial', subtext: 'Set an example', statEffect: { karma: -5, ambition: 5 } },
  ], category: 'random', weight: 5, color: COLORS.gold, requiresScenario: ['royal'] },
  { id: 'roy_war_declared', minAge: 22, maxAge: 60, title: 'War Declared on Neighbouring Kingdom', description: 'The border dispute escalated overnight. Your generals wanted blood. Your treasury wanted peace.', statEffect: { mentalHealth: -10, ambition: 8 }, choices: [
    { id: 'go_to_war', text: 'Mobilise the army', subtext: 'Expand the realm', statEffect: { ambition: 12, karma: -10, happiness: -10 }, bankEffect: -100000 },
    { id: 'negotiate_peace', text: 'Seek diplomacy', subtext: 'Preserve lives', statEffect: { karma: 15, social: 10 } },
  ], category: 'crime', weight: 3, color: COLORS.gold, requiresScenario: ['royal'], rarity: 'rare' },
  { id: 'roy_royal_scandal', minAge: 18, maxAge: 45, title: 'Royal Scandal Exposed', description: 'A journalist published details of your private life. The palace press office worked through the night.', statEffect: { happiness: -12, social: -8 }, choices: [
    { id: 'address_scandal', text: 'Address it publicly', subtext: 'Transparency wins trust', statEffect: { social: 8, happiness: 5 } },
    { id: 'suppress_scandal', text: 'Suppress the story', subtext: 'Control the narrative', statEffect: { karma: -8, mentalHealth: -5 } },
  ], category: 'random', weight: 4, color: COLORS.gold, requiresScenario: ['royal'] },
  { id: 'roy_abdication_choice', minAge: 50, maxAge: 75, title: 'Considered Abdication', description: 'After decades on the throne, you considered stepping aside. The realm would survive without you.', statEffect: { mentalHealth: 5, ambition: -5 }, choices: [
    { id: 'abdicate', text: 'Abdicate in favour of your heir', subtext: 'A graceful exit', statEffect: { happiness: 12, mentalHealth: 10 } },
    { id: 'reign_on', text: 'Continue to reign', subtext: 'The kingdom needs you', statEffect: { ambition: 8, health: -5 } },
  ], category: 'milestone', weight: 3, color: COLORS.gold, requiresScenario: ['royal'] },
];

// ─── Cyber Future Scenario ─────────────────────────────────────────────────────
const CYBER_EVENTS: LifeEvent[] = [
  { id: 'cyb_augmentation_offer', minAge: 18, maxAge: 50, title: 'Neural Augmentation Offered', description: 'A clinic offered you a cortex chip upgrade. Cognitive enhancement: guaranteed. Side effects: listed in paragraph eleven.', statEffect: { intelligence: 15, mentalHealth: -5 }, choices: [
    { id: 'get_augment', text: 'Accept the upgrade', subtext: 'Be more than human', statEffect: { intelligence: 10, ambition: 8 }, bankEffect: -20000 },
    { id: 'decline_augment', text: 'Stay unaugmented', subtext: 'Keep your natural mind', statEffect: { mentalHealth: 6, karma: 5 } },
  ], category: 'health', weight: 5, color: '#06B6D4', requiresScenario: ['cyber'], rarity: 'rare' },
  { id: 'cyb_corporate_hack', minAge: 20, maxAge: 45, title: 'Corporate Espionage Job', description: 'A fixer offered a contract: breach a megacorp database and extract personnel files. The pay was obscene.', statEffect: { intelligence: 8, karma: -10 }, choices: [
    { id: 'take_hack_job', text: 'Take the contract', subtext: 'Data is currency', statEffect: { wealth: 12, mentalHealth: -8 }, bankEffect: 80000 },
    { id: 'refuse_hack_job', text: 'Decline — too risky', subtext: 'Stay clean', statEffect: { karma: 8, happiness: 3 } },
  ], category: 'crime', weight: 4, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_ai_companion', minAge: 16, maxAge: 55, title: 'AI Companion Bonded', description: 'Your AI assistant developed a personality distinct enough to qualify as companionship. The line between tool and friend blurred.', statEffect: { happiness: 10, mentalHealth: 8, social: -3 }, category: 'relationship', weight: 6, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_reputation_token', minAge: 22, maxAge: 50, title: 'Reputation Token Skyrockets', description: 'Your social reputation score hit the top tier. Physical stores gave you discounts. Employers flagged your profile.', statEffect: { social: 14, wealth: 6, happiness: 8 }, category: 'random', weight: 3, color: '#06B6D4', requiresScenario: ['cyber'], rarity: 'uncommon' },
  { id: 'cyb_surveillance_flagged', minAge: 18, maxAge: 60, title: 'Flagged by AI Surveillance', description: 'The district AI flagged your movement pattern as anomalous. A compliance officer visited your home.', statEffect: { mentalHealth: -10, happiness: -8, karma: -3 }, choices: [
    { id: 'comply_surveillance', text: 'Cooperate fully', subtext: 'Nothing to hide', statEffect: { karma: 3, mentalHealth: -3 } },
    { id: 'lawyer_up', text: 'Contact a civil liberties lawyer', subtext: 'Fight back', statEffect: { ambition: 8, wealth: -5 }, bankEffect: -10000 },
  ], category: 'crime', weight: 5, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_black_market_aug', minAge: 18, maxAge: 45, title: 'Black Market Augmentation', description: 'A street clinic offered unlicensed augments — same hardware, none of the regulatory restrictions.', statEffect: { intelligence: 8, health: -8, mentalHealth: -5 }, bankEffect: -5000, choices: [
    { id: 'use_blackmarket', text: 'Get it done', subtext: 'Who needs compliance?', statEffect: { ambition: 6, karma: -5 } },
    { id: 'avoid_blackmarket', text: 'Walk away', subtext: 'Too dangerous', statEffect: { health: 5, karma: 3 } },
  ], category: 'health', weight: 4, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_megacorp_job', minAge: 20, maxAge: 45, title: 'Megacorporation Job Offer', description: 'Corp A offered corporate housing, a salary in tokens, and a loyalty implant. The benefits package was extensive.', statEffect: { wealth: 10, ambition: 8, social: -5 }, bankEffect: 50000, choices: [
    { id: 'take_corp_job', text: 'Sign the contract', subtext: 'Security in exchange for loyalty', statEffect: { wealth: 12, happiness: -5 } },
    { id: 'go_independent', text: 'Stay freelance', subtext: 'Freedom over safety', statEffect: { happiness: 10, ambition: 8 } },
  ], category: 'career', weight: 5, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_identity_fork', minAge: 25, maxAge: 50, title: 'Digital Identity Forked', description: "Your digital twin — an AI trained on your data — began making financial decisions on your behalf. You aren't sure they were all yours.", statEffect: { intelligence: 8, mentalHealth: -8, wealth: 6 }, category: 'random', weight: 3, color: '#06B6D4', requiresScenario: ['cyber'], rarity: 'epic' },
  { id: 'cyb_grid_blackout', minAge: 18, maxAge: 70, title: 'City Grid Blackout', description: 'The power grid failed for 72 hours. Everything ran on battery backups. You remembered how to talk without a screen.', statEffect: { mentalHealth: -6, happiness: -5, intelligence: 4 }, category: 'random', weight: 5, color: '#06B6D4', requiresScenario: ['cyber'] },
  { id: 'cyb_resistance_movement', minAge: 20, maxAge: 45, title: 'Joined the Resistance', description: 'An underground network opposed to corporate governance recruited you. The risk was real. So was the purpose.', statEffect: { karma: 12, ambition: 10, mentalHealth: -8 }, category: 'random', weight: 3, color: '#06B6D4', requiresScenario: ['cyber'], rarity: 'rare' },
];

// ─── Criminal Empire Scenario ──────────────────────────────────────────────────
const CRIME_SCENARIO_EVENTS: LifeEvent[] = [
  { id: 'cri_first_operation', minAge: 18, maxAge: 30, title: 'First Criminal Operation', description: 'You ran your first coordinated job. Planning took two weeks. Execution took four minutes. You were very good at this.', statEffect: { ambition: 10, karma: -12, intelligence: 5 }, bankEffect: 20000, category: 'crime', weight: 5, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_turf_war', minAge: 20, maxAge: 50, title: 'Turf War Erupts', description: 'A rival organization moved on your territory. You had 48 hours to respond or lose everything.', statEffect: { mentalHealth: -12, ambition: 8, happiness: -8 }, choices: [
    { id: 'fight_turf', text: 'Defend aggressively', subtext: 'Hold the line', statEffect: { karma: -15, ambition: 12 }, bankEffect: -10000 },
    { id: 'negotiate_turf', text: 'Negotiate a split', subtext: 'Share the market', statEffect: { intelligence: 8, karma: -5 } },
  ], category: 'crime', weight: 4, color: '#EF4444', requiresScenario: ['crime'], rarity: 'rare' },
  { id: 'cri_informant_planted', minAge: 22, maxAge: 55, title: 'Informant in Your Organisation', description: 'Police intelligence suggested someone close was feeding information. Paranoia spread through the ranks.', statEffect: { mentalHealth: -12, happiness: -8, social: -6 }, choices: [
    { id: 'find_informant', text: 'Hunt them down', subtext: 'Internal investigation', statEffect: { karma: -10, ambition: 6 } },
    { id: 'go_dark', text: 'Go dark temporarily', subtext: 'Disappear from the radar', statEffect: { mentalHealth: 5, wealth: -5 } },
  ], category: 'crime', weight: 3, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_laundering_scheme', minAge: 22, maxAge: 55, title: 'Money Laundering Network', description: 'You established a chain of legitimate businesses to clean incoming revenue. The accountant charged handsomely.', statEffect: { intelligence: 8, wealth: 10, karma: -10 }, bankEffect: 50000, category: 'financial', weight: 4, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_corrupt_official', minAge: 22, maxAge: 55, title: 'Corrupt Official on Payroll', description: 'A local official agreed to look the other way in exchange for a monthly arrangement. The relationship was productive.', statEffect: { wealth: 8, karma: -12, social: 5 }, bankEffect: -5000, category: 'crime', weight: 4, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_empire_threatened', minAge: 28, maxAge: 55, title: 'Empire Under Threat', description: 'A federal taskforce announced they were investigating your operations. Your lawyer said it was serious.', statEffect: { mentalHealth: -15, happiness: -12 }, choices: [
    { id: 'flee_empire', text: 'Move operations abroad', subtext: 'Out of jurisdiction', statEffect: { happiness: -8, wealth: -10 }, bankEffect: -50000 },
    { id: 'fight_legal', text: 'Fight it legally', subtext: 'Let the lawyers earn their fees', statEffect: { mentalHealth: -8, wealth: -12 }, bankEffect: -80000 },
    { id: 'cooperate_empire', text: 'Cut a deal', subtext: 'Cooperate for immunity', statEffect: { karma: 8, happiness: 5, wealth: -15 } },
  ], category: 'crime', weight: 2, color: '#EF4444', requiresScenario: ['crime'], rarity: 'epic' },
  { id: 'cri_street_respect', minAge: 18, maxAge: 40, title: 'Earned Street Respect', description: 'Word spread about how you handled a difficult situation. Doors opened that had been locked before.', statEffect: { social: 10, ambition: 8, karma: -5 }, category: 'crime', weight: 6, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_safehouse_discovered', minAge: 20, maxAge: 50, title: 'Safehouse Compromised', description: 'Police raided the property. You were not there. Your equipment was.', statEffect: { mentalHealth: -10, happiness: -8, wealth: -8 }, bankEffect: -20000, category: 'crime', weight: 3, color: '#EF4444', requiresScenario: ['crime'] },
  { id: 'cri_exit_opportunity', minAge: 35, maxAge: 60, title: 'Chance to Go Legitimate', description: 'A legitimate investor offered to acquire your business interests — no questions asked about their origins.', statEffect: { happiness: 5, mentalHealth: 5 }, choices: [
    { id: 'go_legitimate', text: 'Take the exit', subtext: 'Leave it behind', statEffect: { karma: 15, happiness: 15, ambition: -5 }, bankEffect: 300000 },
    { id: 'stay_criminal', text: 'Stay in the game', subtext: 'You built this — no one takes it', statEffect: { ambition: 10, wealth: 8, mentalHealth: -8 } },
  ], category: 'crime', weight: 3, color: '#EF4444', requiresScenario: ['crime'], rarity: 'rare' },
  { id: 'cri_witness_protection', minAge: 25, maxAge: 55, title: 'Key Witness Placed in Protection', description: 'Someone with knowledge of your operations agreed to testify. Prosecutors had a strong case.', statEffect: { mentalHealth: -15, happiness: -12, wealth: -10 }, category: 'crime', weight: 2, color: '#EF4444', requiresScenario: ['crime'], rarity: 'epic' },
];

// ─── Fantasy Scenario ──────────────────────────────────────────────────────────
const FANTASY_EVENTS: LifeEvent[] = [
  { id: 'fan_magic_awakening', minAge: 8, maxAge: 16, title: 'Magic Awakens', description: 'During a moment of intense emotion, the air around you shimmered. You had abilities. The Academy would hear of it.', statEffect: { intelligence: 12, ambition: 10, happiness: 8 }, category: 'milestone', weight: 4, color: '#8B5CF6', requiresScenario: ['fantasy'], rarity: 'epic', oneTime: true },
  { id: 'fan_magic_academy', minAge: 11, maxAge: 18, title: 'Enrolled at the Academy', description: 'The letter arrived by falcon. You were accepted to the most prestigious school of magic in the realm.', statEffect: { intelligence: 10, social: 8, happiness: 12 }, bankEffect: -5000, category: 'education', weight: 5, color: '#8B5CF6', requiresScenario: ['fantasy'] },
  { id: 'fan_dragon_encounter', minAge: 16, maxAge: 50, title: 'Dragon Encounter', description: 'You came face to face with an ancient dragon. It did not eat you. This was considered a successful encounter.', statEffect: { mentalHealth: -8, ambition: 10, happiness: 5 }, choices: [
    { id: 'befriend_dragon', text: 'Attempt to communicate', subtext: 'Brave or foolish', statEffect: { intelligence: 10, social: 8 }, bankEffect: 0 },
    { id: 'flee_dragon', text: 'Run for your life', subtext: 'Discretion is wisdom', statEffect: { health: 5, mentalHealth: 5 } },
  ], category: 'random', weight: 3, color: '#8B5CF6', requiresScenario: ['fantasy'], rarity: 'legendary' },
  { id: 'fan_quest_accepted', minAge: 18, maxAge: 45, title: 'Quest Accepted', description: 'A mysterious stranger in the tavern offered a map, a destination, and a very large number of gold coins. You left before dawn.', statEffect: { ambition: 12, happiness: 10, health: -3 }, bankEffect: 5000, category: 'random', weight: 5, color: '#8B5CF6', requiresScenario: ['fantasy'] },
  { id: 'fan_artifact_found', minAge: 18, maxAge: 55, title: 'Magical Artifact Discovered', description: 'Among the ruins, partially buried, was an object that hummed with energy. You were not sure what it did yet.', statEffect: { intelligence: 8, ambition: 6, happiness: 8 }, category: 'random', weight: 4, color: '#8B5CF6', requiresScenario: ['fantasy'], rarity: 'rare' },
  { id: 'fan_guild_membership', minAge: 16, maxAge: 40, title: 'Joined the Adventurers\' Guild', description: 'You paid the membership fee, took the oath, and received your bronze badge. The notice board had several interesting jobs.', statEffect: { social: 10, ambition: 8, happiness: 8 }, bankEffect: -500, category: 'career', weight: 5, color: '#8B5CF6', requiresScenario: ['fantasy'] },
  { id: 'fan_curse_inflicted', minAge: 16, maxAge: 50, title: 'Afflicted by a Curse', description: 'An encounter with a hedge witch went poorly. The effects were inconvenient but not fatal — mostly.', statEffect: { health: -8, mentalHealth: -8, happiness: -10 }, choices: [
    { id: 'seek_cure', text: 'Find a cure immediately', subtext: 'Seek the remedy', statEffect: { health: 8, ambition: 5 }, bankEffect: -8000 },
    { id: 'live_with_curse', text: 'Adapt and live with it', subtext: 'It builds character', statEffect: { intelligence: 5, mentalHealth: 4 } },
  ], category: 'health', weight: 4, color: '#8B5CF6', requiresScenario: ['fantasy'] },
  { id: 'fan_prophecy_revealed', minAge: 18, maxAge: 35, title: 'A Prophecy About You', description: 'An oracle spoke your name. The prophecy was vague, dramatic, and entirely too accurate to ignore.', statEffect: { ambition: 12, mentalHealth: -5, happiness: 6 }, category: 'milestone', weight: 2, color: '#8B5CF6', requiresScenario: ['fantasy'], rarity: 'epic', oneTime: true },
  { id: 'fan_rival_mage', minAge: 18, maxAge: 50, title: 'Rivalry with Another Mage', description: 'Someone challenged your standing in the magical community. The duel was verbal at first. Then it was not.', statEffect: { ambition: 8, social: -5, mentalHealth: -5 }, choices: [
    { id: 'duel_mage', text: 'Accept the formal duel', subtext: 'Settle it with magic', statEffect: { ambition: 10, social: 8 } },
    { id: 'ignore_rival', text: 'Rise above it', subtext: 'Success is the best reply', statEffect: { karma: 6, happiness: 5 } },
  ], category: 'relationship', weight: 4, color: '#8B5CF6', requiresScenario: ['fantasy'] },
  { id: 'fan_kingdom_saved', minAge: 22, maxAge: 55, title: 'Saved the Kingdom', description: 'At the moment of greatest darkness, you did the thing only you could do. The realm was not destroyed. Largely because of you.', statEffect: { happiness: 20, social: 15, ambition: 10, karma: 15 }, category: 'milestone', weight: 1, color: '#8B5CF6', requiresScenario: ['fantasy'], rarity: 'legendary', oneTime: true },
];

export const SCENARIO_EVENTS: LifeEvent[] = [
  ...CLASSIC_EVENTS,
  ...ROYAL_EVENTS,
  ...CYBER_EVENTS,
  ...CRIME_SCENARIO_EVENTS,
  ...FANTASY_EVENTS,
];
