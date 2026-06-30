import { LifeEvent } from '../../types';

export const RELATIONSHIP_EVENTS_EXPANDED: LifeEvent[] = [
  // ─── Dating & Romance ─────────────────────────────────────────────────────────
  { id: 'rex_dating_app_match', minAge: 18, maxAge: 40, title: 'Dating App Match', description: 'You matched with someone promising. The conversation lasted three days before you met in person.', statEffect: { happiness: 8, social: 6 }, choices: [
    { id: 'go_on_date', text: 'Go on the date', subtext: 'See what happens', statEffect: { happiness: 10, social: 8 } },
    { id: 'ghost_match', text: 'Ghost them', subtext: 'Lost interest', statEffect: { happiness: -3, karma: -5 } },
  ], category: 'relationship', weight: 9, color: '#EC4899' },
  { id: 'rex_blind_date', minAge: 18, maxAge: 40, title: 'Blind Date Set Up by Family', description: 'Your relatives arranged a dinner with someone they described as "perfect." They were lying.', statEffect: { happiness: -3, social: 4 }, choices: [
    { id: 'second_date', text: 'Give it another chance', subtext: 'Slow burn maybe', statEffect: { happiness: 5, social: 5 } },
    { id: 'politely_decline', text: 'Politely move on', subtext: 'Not the right fit', statEffect: { happiness: 3 } },
  ], category: 'relationship', weight: 7, color: '#EC4899' },
  { id: 'rex_secret_admirer', minAge: 14, maxAge: 35, title: 'Secret Admirer Note', description: 'An anonymous note appeared in your locker — or on your desk. Your heart raced at the mystery.', statEffect: { happiness: 10, social: 5, mentalHealth: 6 }, category: 'relationship', weight: 8, color: '#EC4899' },
  { id: 'rex_old_flame_returns', minAge: 25, maxAge: 55, title: 'Old Flame Resurfaces', description: 'A past love reappeared in your life with a message: "I think about you sometimes."', statEffect: { happiness: 5, mentalHealth: -3 }, choices: [
    { id: 'reconnect_flame', text: 'See where it leads', subtext: 'Some fires never go out', statEffect: { happiness: 10, mentalHealth: 5 } },
    { id: 'leave_past', text: 'Leave the past behind', subtext: 'That chapter is closed', statEffect: { happiness: 3, mentalHealth: 6 } },
  ], category: 'relationship', weight: 6, color: '#EC4899' },
  { id: 'rex_friend_zone', minAge: 16, maxAge: 35, title: 'Friendzoned', description: 'You confessed your feelings. They replied: "I really value you as a friend."', statEffect: { happiness: -8, mentalHealth: -5, social: -3 }, category: 'relationship', weight: 8, color: '#8B5CF6' },
  { id: 'rex_love_at_first_sight', minAge: 18, maxAge: 40, title: 'Love at First Sight', description: 'You locked eyes across a crowded room and felt something shift. This one was different.', statEffect: { happiness: 15, mentalHealth: 8, social: 5 }, category: 'relationship', weight: 5, color: '#EC4899', rarity: 'rare' },
  { id: 'rex_open_relationship', minAge: 20, maxAge: 40, title: 'Open Relationship Conversation', description: 'Your partner proposed an open arrangement. You had a long, honest conversation.', statEffect: { social: 3, mentalHealth: -4 }, choices: [
    { id: 'agree_open', text: 'Agree to explore it', subtext: 'Communication is key', statEffect: { happiness: 5, mentalHealth: 3 } },
    { id: 'decline_open', text: 'Decline respectfully', subtext: 'Not for you', statEffect: { happiness: -5, mentalHealth: 6 } },
  ], category: 'relationship', weight: 5, color: '#8B5CF6' },
  { id: 'rex_dating_multiple', minAge: 20, maxAge: 35, title: 'Dating Multiple People', description: 'You were casually seeing three people simultaneously. Scheduling became a part-time job.', statEffect: { social: 6, happiness: 5, mentalHealth: -4 }, category: 'relationship', weight: 7, color: '#EC4899' },
  { id: 'rex_stood_up', minAge: 16, maxAge: 40, title: 'Stood Up on a Date', description: 'You sat alone for forty-five minutes before checking your phone. They cancelled in the same message where they apologised.', statEffect: { happiness: -10, mentalHealth: -6, social: -3 }, category: 'relationship', weight: 7, color: '#EF4444' },
  { id: 'rex_whirlwind_romance', minAge: 18, maxAge: 40, title: 'Whirlwind Romance Abroad', description: 'You met someone incredible on a holiday. Two weeks of perfect bliss, then back to reality.', statEffect: { happiness: 14, social: 8, mentalHealth: 6 }, category: 'relationship', weight: 5, color: '#EC4899', rarity: 'uncommon' },

  // ─── Friendship ───────────────────────────────────────────────────────────────
  { id: 'rex_best_friend_wedding', minAge: 20, maxAge: 45, title: "Best Friend's Wedding", description: 'You were the best man or maid of honour. The speech you wrote made people laugh and cry.', statEffect: { happiness: 14, social: 10, mentalHealth: 8 }, bankEffect: -2000, category: 'relationship', weight: 7, color: '#10B981' },
  { id: 'rex_toxic_friendship', minAge: 15, maxAge: 50, title: 'Toxic Friend Recognized', description: 'You finally saw it clearly: this friendship was draining you. Every interaction left you worse off.', statEffect: { mentalHealth: -8, happiness: -6 }, choices: [
    { id: 'end_friendship', text: 'End the friendship', subtext: 'Protect your energy', statEffect: { mentalHealth: 12, happiness: 8 } },
    { id: 'distance_friend', text: 'Create distance gradually', subtext: 'Soft exit', statEffect: { mentalHealth: 6, social: -5 } },
  ], category: 'relationship', weight: 7, color: '#EF4444' },
  { id: 'rex_unexpected_friendship', minAge: 10, maxAge: 70, title: 'Unlikely Friendship', description: 'You became close friends with someone you had nothing obvious in common with. These connections run deep.', statEffect: { happiness: 10, social: 8, mentalHealth: 6 }, category: 'relationship', weight: 9, color: '#10B981' },
  { id: 'rex_friend_betrayal', minAge: 15, maxAge: 55, title: 'Friend Betrayal', description: 'Someone you trusted shared your secret. The entire social circle knew by Monday.', statEffect: { happiness: -14, social: -10, mentalHealth: -10 }, category: 'relationship', weight: 5, color: '#EF4444' },
  { id: 'rex_childhood_reunion', minAge: 25, maxAge: 60, title: 'Childhood Reunion', description: 'A school reunion brought back people you\'d nearly forgotten. Some improved with age. Others really hadn\'t.', statEffect: { happiness: 8, social: 8, mentalHealth: 3 }, category: 'relationship', weight: 7, color: '#10B981' },
  { id: 'rex_online_friendship', minAge: 14, maxAge: 35, title: 'Deep Online Friendship', description: 'You met someone in an online community and discovered a genuine connection across the distance.', statEffect: { social: 8, happiness: 8, mentalHealth: 5 }, category: 'relationship', weight: 8, color: '#10B981' },

  // ─── Marriage & Partnership ───────────────────────────────────────────────────
  { id: 'rex_surprise_proposal', minAge: 22, maxAge: 45, title: 'Surprise Proposal', description: 'They got down on one knee somewhere unexpected. You said yes before they finished the question.', statEffect: { happiness: 20, mentalHealth: 12, social: 8 }, category: 'relationship', weight: 6, color: '#EC4899', rarity: 'rare' },
  { id: 'rex_premarital_counselling', minAge: 22, maxAge: 40, title: 'Premarital Counselling', description: 'Your partner suggested premarital counselling. The conversations were uncomfortable and necessary.', statEffect: { mentalHealth: 10, social: 8, happiness: 6 }, bankEffect: -3000, category: 'relationship', weight: 6, color: '#10B981' },
  { id: 'rex_divorce', minAge: 25, maxAge: 65, title: 'Divorce', description: 'The marriage ended. The paperwork was the easiest part.', statEffect: { happiness: -20, mentalHealth: -15, wealth: -10, social: -5 }, bankEffect: -30000, category: 'relationship', weight: 5, color: '#EF4444', choices: [
    { id: 'amicable_divorce', text: 'Part amicably', subtext: 'Both agree it is best', statEffect: { mentalHealth: 10, happiness: 5 } },
    { id: 'contested_divorce', text: 'Contested divorce', subtext: 'Lawyers are involved', statEffect: { mentalHealth: -10, wealth: -10 }, bankEffect: -20000 },
  ] },
  { id: 'rex_renew_vows', minAge: 35, maxAge: 70, title: 'Vow Renewal', description: 'You and your partner renewed your wedding vows at the same venue you first said them.', statEffect: { happiness: 16, mentalHealth: 12, social: 8 }, bankEffect: -5000, category: 'relationship', weight: 6, color: '#EC4899' },
  { id: 'rex_spouse_job_loss', minAge: 25, maxAge: 55, title: 'Partner Lost Their Job', description: 'Your partner was made redundant. The financial and emotional pressure fell on both of you.', statEffect: { mentalHealth: -8, happiness: -7, wealth: -5 }, category: 'relationship', weight: 7, color: '#F97316' },
  { id: 'rex_cultural_differences', minAge: 20, maxAge: 40, title: 'Cultural Differences in Relationship', description: 'Your backgrounds are different in ways that created real friction. Learning took effort from both sides.', statEffect: { intelligence: 6, social: 4, mentalHealth: -5 }, category: 'relationship', weight: 7, color: '#8B5CF6' },

  // ─── Family Dynamics ──────────────────────────────────────────────────────────
  { id: 'rex_estranged_family', minAge: 20, maxAge: 60, title: 'Estranged Family Reconnects', description: 'A family member you hadn\'t spoken to in years reached out. The silence between you felt smaller.', statEffect: { happiness: 8, mentalHealth: 5, social: 6 }, choices: [
    { id: 'reconnect_estranged', text: 'Open the door', subtext: 'Families can heal', statEffect: { happiness: 10, social: 8 } },
    { id: 'maintain_distance', text: 'Maintain your distance', subtext: 'Some doors stay closed', statEffect: { mentalHealth: 8 } },
  ], category: 'relationship', weight: 6, color: '#8B5CF6' },
  { id: 'rex_in_laws', minAge: 22, maxAge: 50, title: 'Difficult In-Laws', description: 'Your partner\'s family has opinions about everything — especially you.', statEffect: { mentalHealth: -8, happiness: -6, social: -4 }, choices: [
    { id: 'set_boundaries', text: 'Set firm boundaries', subtext: 'Protect your marriage', statEffect: { mentalHealth: 8, happiness: 5 } },
    { id: 'keep_peace', text: 'Keep the peace', subtext: 'For your partner\'s sake', statEffect: { karma: 5, mentalHealth: -5 } },
  ], category: 'relationship', weight: 7, color: '#F97316' },
  { id: 'rex_sibling_new_baby', minAge: 20, maxAge: 50, title: 'Sibling Has a Baby', description: 'Your sibling became a parent. The family dynamic shifted overnight.', statEffect: { happiness: 8, social: 6 }, category: 'relationship', weight: 8, color: '#10B981' },
  { id: 'rex_adoption_support', minAge: 25, maxAge: 55, title: 'Supported a Friend Through Adoption', description: 'You were there every step as your closest friend navigated the long adoption process.', statEffect: { karma: 8, social: 8, happiness: 6 }, category: 'relationship', weight: 7, color: '#10B981' },

  // ─── Loss & Grief ─────────────────────────────────────────────────────────────
  { id: 'rex_friend_dies_young', minAge: 16, maxAge: 40, title: 'Friend Died Too Young', description: 'Someone you loved died before their time. The loss reshaped how you thought about everything.', statEffect: { happiness: -20, mentalHealth: -18, karma: 5, health: -4 }, category: 'relationship', weight: 4, color: '#EF4444', rarity: 'rare' },
  { id: 'rex_pet_dies', minAge: 8, maxAge: 70, title: 'Beloved Pet Dies', description: 'You said goodbye to a companion who loved you unconditionally. The house felt quiet for weeks.', statEffect: { happiness: -12, mentalHealth: -8 }, category: 'relationship', weight: 7, color: '#EF4444' },
  { id: 'rex_loss_of_pregnancy', minAge: 25, maxAge: 42, title: 'Pregnancy Loss', description: 'You experienced a miscarriage. The grief was private and profound.', statEffect: { happiness: -22, mentalHealth: -20, health: -5 }, category: 'relationship', weight: 3, color: '#EF4444', rarity: 'rare' },

  // ─── Social & Community ───────────────────────────────────────────────────────
  { id: 'rex_social_circle_expanded', minAge: 18, maxAge: 45, title: 'New Social Circle', description: 'A career change or move introduced you to a completely new group of friends. You felt alive again.', statEffect: { social: 14, happiness: 10, mentalHealth: 8 }, category: 'relationship', weight: 8, color: '#10B981' },
  { id: 'rex_rumour_spread', minAge: 14, maxAge: 50, title: 'Rumour Spread About You', description: 'Someone started a story that wasn\'t true. By the time you heard it, everyone else already had.', statEffect: { happiness: -10, social: -8, mentalHealth: -7 }, category: 'relationship', weight: 6, color: '#EF4444' },
  { id: 'rex_social_anxiety_event', minAge: 16, maxAge: 45, title: 'Social Anxiety Spike', description: 'A party or large event triggered overwhelming social anxiety. You left early and felt embarrassed.', statEffect: { mentalHealth: -8, social: -5, happiness: -6 }, category: 'relationship', weight: 7, color: '#8B5CF6' },
  { id: 'rex_public_fight', minAge: 18, maxAge: 55, title: 'Public Argument', description: 'You and your partner had a very public disagreement. Bystanders tried to look elsewhere.', statEffect: { happiness: -8, social: -6, mentalHealth: -5 }, category: 'relationship', weight: 6, color: '#EF4444' },
  { id: 'rex_apology_accepted', minAge: 15, maxAge: 65, title: 'Heartfelt Apology Accepted', description: 'You apologised for something that had been weighing on you for years. They forgave you. The relief was immediate.', statEffect: { mentalHealth: 12, happiness: 10, karma: 8 }, category: 'relationship', weight: 7, color: '#10B981' },
  { id: 'rex_forgiving_someone', minAge: 18, maxAge: 70, title: 'You Forgave Someone', description: 'You chose to forgive someone who hurt you badly. It was harder than staying angry and more freeing.', statEffect: { mentalHealth: 12, happiness: 8, karma: 10 }, category: 'relationship', weight: 7, color: '#10B981' },
];
