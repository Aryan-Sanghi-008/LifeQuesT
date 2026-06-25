import { LifeEvent } from '../../types';

export const RELATIONSHIP_EVENTS: LifeEvent[] = [
  // ─── Childhood & Teen ──────────────────────────────────────────────────────
  { id: 'best_friend_moves', title: 'Best Friend Moves Away', description: 'Your best friend is moving to another city. It is heartbreaking.', category: 'relationship', minAge: 7, maxAge: 16, weight: 7, statEffect: { happiness: -10, social: -8, mentalHealth: -5 }, color: '#8B5CF6', choices: [] },
  { id: 'childhood_crush', title: 'First Crush', description: 'You developed your first crush. Your heart is racing every time you see them.', category: 'relationship', minAge: 10, maxAge: 16, weight: 9, statEffect: { happiness: 8, social: 5 }, color: '#EC4899', choices: [
    { id: 'confess_crush', text: 'Tell them how you feel', subtext: 'Take the risk', statEffect: { social: 8, happiness: 5 } },
    { id: 'keep_secret', text: 'Keep it to yourself', subtext: 'Stay safe', statEffect: { mentalHealth: -3, happiness: 3 } },
  ]},
  { id: 'school_bully', title: 'Bullying Incident', description: 'A bully at school has been targeting you.', category: 'relationship', minAge: 8, maxAge: 17, weight: 6, statEffect: { social: -10, mentalHealth: -12, happiness: -8 }, color: '#EF4444', choices: [
    { id: 'stand_up', text: 'Stand up to the bully', subtext: 'Fight back', statEffect: { social: 10, mentalHealth: 8, fitness: 3 } },
    { id: 'report_bully', text: 'Report to a teacher', subtext: 'Get authority help', statEffect: { mentalHealth: 5, social: 3 } },
    { id: 'avoid_bully', text: 'Avoid them', subtext: 'Stay out of the way', statEffect: { mentalHealth: -5, social: -5 } },
  ]},
  { id: 'first_relationship', title: 'First Relationship', description: 'You entered your first romantic relationship!', category: 'relationship', minAge: 15, maxAge: 20, weight: 8, statEffect: { happiness: 12, social: 8, mentalHealth: 5 }, color: '#EC4899', choices: [] },
  { id: 'teenage_breakup', title: 'First Heartbreak', description: 'Your first relationship ended. The pain feels overwhelming.', category: 'relationship', minAge: 15, maxAge: 22, weight: 8, statEffect: { happiness: -15, mentalHealth: -12, social: -5 }, color: '#EF4444', choices: [
    { id: 'lean_on_friends', text: 'Lean on friends', subtext: 'Talk it out', statEffect: { mentalHealth: 10, social: 8 } },
    { id: 'rebound', text: 'Rebound quickly', subtext: 'Move on fast', statEffect: { happiness: 5, mentalHealth: -5 } },
    { id: 'isolate_breakup', text: 'Need time alone', subtext: 'Process the pain', statEffect: { mentalHealth: 5, social: -8 } },
  ]},

  // ─── Young Adult ────────────────────────────────────────────────────────────
  { id: 'college_romance', title: 'College Romance', description: 'You fell hard for someone in your college cohort.', category: 'relationship', minAge: 18, maxAge: 24, weight: 7, statEffect: { happiness: 15, social: 10, intelligence: -3 }, color: '#EC4899', choices: [] },
  { id: 'long_distance', title: 'Long-Distance Relationship', description: 'Your partner moved away for work. Can the relationship survive?', category: 'relationship', minAge: 20, maxAge: 35, weight: 6, statEffect: { happiness: -8, social: -5 }, color: '#8B5CF6', choices: [
    { id: 'make_it_work', text: 'Commit to making it work', subtext: 'Video calls, visits', statEffect: { happiness: 5, social: 5 } },
    { id: 'end_distance', text: 'End the relationship', subtext: 'It is too hard', statEffect: { happiness: -10, mentalHealth: -5 } },
  ]},
  { id: 'moving_in_together', title: 'Moving In Together', description: 'You and your partner decided to share a home.', category: 'relationship', minAge: 20, maxAge: 35, weight: 7, statEffect: { happiness: 12, social: 8, mentalHealth: 5 }, bankEffect: -5000, color: '#10B981', choices: [] },
  { id: 'toxic_relationship', title: 'Toxic Relationship', description: 'You realized your relationship has become unhealthy and controlling.', category: 'relationship', minAge: 18, maxAge: 40, weight: 5, statEffect: { mentalHealth: -18, happiness: -15, social: -8 }, color: '#EF4444', choices: [
    { id: 'leave_toxic', text: 'Leave the relationship', subtext: 'Put yourself first', statEffect: { mentalHealth: 20, happiness: 12, social: 5 } },
    { id: 'stay_toxic', text: 'Try to fix things', subtext: 'Hope they will change', statEffect: { mentalHealth: -10, happiness: -8 } },
  ]},
  { id: 'reconnect_old_friend', title: 'Reconnecting with an Old Friend', description: 'You ran into an old friend and it felt like no time had passed.', category: 'relationship', minAge: 20, maxAge: 60, weight: 9, statEffect: { happiness: 10, social: 12, mentalHealth: 8 }, color: '#10B981', choices: [] },

  // ─── Adult ──────────────────────────────────────────────────────────────────
  { id: 'engagement', title: 'Engagement!', description: 'You got engaged! The future looks bright together.', category: 'relationship', minAge: 22, maxAge: 40, weight: 6, statEffect: { happiness: 20, social: 10, mentalHealth: 10 }, color: '#EC4899', choices: [] },
  { id: 'wedding_planning_stress', title: 'Wedding Planning Stress', description: 'Planning your wedding is exciting but stressful.', category: 'relationship', minAge: 22, maxAge: 42, weight: 7, statEffect: { happiness: -5, mentalHealth: -8 }, bankEffect: -20000, color: '#F97316', choices: [
    { id: 'big_wedding', text: 'Go all out', subtext: 'Lavish celebration', statEffect: { happiness: 15, social: 12 }, bankEffect: -30000 },
    { id: 'small_wedding', text: 'Keep it intimate', subtext: 'Small, meaningful ceremony', statEffect: { happiness: 12, mentalHealth: 5 }, bankEffect: -5000 },
  ]},
  { id: 'infidelity_discovered', title: 'Infidelity', description: 'You discovered your partner has been unfaithful.', category: 'relationship', minAge: 22, maxAge: 55, weight: 4, statEffect: { happiness: -25, mentalHealth: -20, social: -10 }, color: '#EF4444', choices: [
    { id: 'forgive_infidelity', text: 'Try to forgive and rebuild', subtext: 'Work through it together', statEffect: { happiness: 10, mentalHealth: 5 } },
    { id: 'leave_infidelity', text: 'Walk away', subtext: 'Protect your dignity', statEffect: { mentalHealth: 15, happiness: -5 } },
  ]},
  { id: 'couples_therapy', title: 'Couples Therapy', description: 'You and your partner started couples therapy to work through issues.', category: 'relationship', minAge: 25, maxAge: 60, weight: 7, statEffect: { mentalHealth: 10, happiness: 8, social: 5 }, bankEffect: -3000, color: '#10B981', choices: [] },
  { id: 'parent_passes', title: 'Loss of a Parent', description: 'Your parent passed away after an illness. Grief is overwhelming.', category: 'relationship', minAge: 25, maxAge: 65, weight: 6, statEffect: { happiness: -20, mentalHealth: -18, health: -5 }, color: '#EF4444', choices: [] },
  { id: 'sibling_rivalry', title: 'Family Conflict', description: 'A serious dispute erupted between you and a family member.', category: 'relationship', minAge: 15, maxAge: 60, weight: 7, statEffect: { happiness: -10, social: -8, mentalHealth: -7 }, color: '#F97316', choices: [
    { id: 'resolve_family', text: 'Work to resolve it', subtext: 'Have an honest conversation', statEffect: { social: 10, happiness: 8 } },
    { id: 'cut_ties', text: 'Cut ties for now', subtext: 'Space is needed', statEffect: { mentalHealth: 5, social: -10 } },
  ]},

  // ─── Middle-Age & Senior ────────────────────────────────────────────────────
  { id: 'mentoring_youth', title: 'Becoming a Mentor', description: 'You started mentoring young people in your community.', category: 'relationship', minAge: 35, maxAge: 65, weight: 7, statEffect: { happiness: 12, social: 10, karma: 8, ambition: 5 }, color: '#10B981', choices: [] },
  { id: 'friend_group_changes', title: 'Friend Group Drifts Apart', description: 'Life has taken old friends in different directions. You feel the distance.', category: 'relationship', minAge: 25, maxAge: 50, weight: 8, statEffect: { social: -10, happiness: -7, mentalHealth: -5 }, color: '#8B5CF6', choices: [
    { id: 'make_effort_friends', text: 'Make a real effort to reconnect', subtext: 'Plan a reunion', statEffect: { social: 12, happiness: 10 } },
    { id: 'accept_drift', text: 'Accept it gracefully', subtext: 'Build new connections', statEffect: { social: 5, happiness: -3 } },
  ]},
  { id: 'empty_nest', title: 'Empty Nest Syndrome', description: 'Your last child left home for college. The house feels very quiet.', category: 'relationship', minAge: 40, maxAge: 60, weight: 6, statEffect: { happiness: -10, mentalHealth: -8, social: -5 }, color: '#8B5CF6', choices: [
    { id: 'new_hobbies', text: 'Embrace new hobbies', subtext: 'Rediscover yourself', statEffect: { happiness: 15, social: 10 } },
    { id: 'grieve_empty_nest', text: 'Take time to adjust', subtext: 'Allow yourself to grieve', statEffect: { mentalHealth: 8 } },
  ]},
  { id: 'anniversary_celebration', title: 'Wedding Anniversary', description: 'You celebrated a major wedding anniversary with your partner.', category: 'relationship', minAge: 30, maxAge: 80, weight: 8, statEffect: { happiness: 15, social: 8, mentalHealth: 10 }, bankEffect: -2000, color: '#EC4899', choices: [] },
  { id: 'caring_for_elderly_parent', title: 'Caring for an Elderly Parent', description: 'Your parent can no longer live alone. You stepped in to help.', category: 'relationship', minAge: 40, maxAge: 65, weight: 6, statEffect: { karma: 12, happiness: -5, ambition: -5, mentalHealth: -8 }, bankEffect: -8000, color: '#8B5CF6', choices: [] },

  // ─── Community ──────────────────────────────────────────────────────────────
  { id: 'community_volunteer', title: 'Community Volunteering', description: 'You spent weekends volunteering at a local shelter.', category: 'relationship', minAge: 16, maxAge: 70, weight: 9, statEffect: { karma: 15, social: 10, happiness: 8 }, color: '#10B981', choices: [] },
  { id: 'neighborhood_dispute', title: 'Neighbor Dispute', description: 'An ongoing conflict with your neighbor has reached a boiling point.', category: 'relationship', minAge: 25, maxAge: 70, weight: 7, statEffect: { happiness: -8, social: -5 }, color: '#F97316', choices: [
    { id: 'mediate_neighbor', text: 'Seek mediation', subtext: 'Find a compromise', statEffect: { happiness: 8, karma: 5, social: 5 } },
    { id: 'escalate_neighbor', text: 'File a formal complaint', subtext: 'Escalate it', statEffect: { happiness: -3, karma: -5 } },
  ]},
  { id: 'join_social_club', title: 'Joined a Social Club', description: 'You joined a club for your hobby and met like-minded people.', category: 'relationship', minAge: 18, maxAge: 75, weight: 9, statEffect: { social: 12, happiness: 10, mentalHealth: 8 }, color: '#10B981', choices: [] },
];
