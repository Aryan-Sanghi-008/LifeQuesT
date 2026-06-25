import { LifeEvent } from '../../types';

export const HEALTH_EVENTS: LifeEvent[] = [
  // ─── Early Life ───────────────────────────────────────────────────────────
  { id: 'childhood_flu', title: 'Childhood Flu', description: 'You caught a bad flu and were bedridden for a week.', category: 'health', minAge: 3, maxAge: 10, weight: 10, statEffect: { health: -5, happiness: -3 }, color: '#EF4444', choices: [] },
  { id: 'childhood_vaccine', title: 'Vaccination Day', description: 'Your parents took you to get vaccinated against common illnesses.', category: 'health', minAge: 2, maxAge: 8, weight: 8, statEffect: { health: 8 }, color: '#2DD4BF', choices: [] },
  { id: 'broken_arm', title: 'Broken Arm', description: 'You broke your arm playing outside. Six weeks in a cast.', category: 'health', minAge: 5, maxAge: 14, weight: 6, statEffect: { health: -8, fitness: -5, happiness: -4 }, color: '#F97316', choices: [] },
  { id: 'sports_injury', title: 'Sports Injury', description: 'You pulled a muscle during practice and need to rest.', category: 'health', minAge: 10, maxAge: 25, weight: 8, statEffect: { health: -6, fitness: -8 }, color: '#F97316', choices: [] },

  // ─── Teen ─────────────────────────────────────────────────────────────────
  { id: 'teen_mental_health_crisis', title: 'Mental Health Struggle', description: 'The pressures of school and social life are taking a toll on your mental health.', category: 'health', minAge: 13, maxAge: 19, weight: 7, statEffect: { mentalHealth: -12, happiness: -8, social: -5 }, color: '#8B5CF6', choices: [
    { id: 'seek_help', text: 'Talk to a counselor', subtext: 'Seek professional support', statEffect: { mentalHealth: 15, happiness: 5 } },
    { id: 'ignore', text: 'Push through alone', subtext: 'Bottle it up', statEffect: { mentalHealth: -5, ambition: -3 } },
  ]},
  { id: 'gym_habit', title: 'Gym Habit', description: 'You started going to the gym regularly and feel great.', category: 'health', minAge: 14, maxAge: 25, weight: 9, statEffect: { fitness: 10, health: 5, looks: 3, happiness: 4 }, color: '#2DD4BF', choices: [] },
  { id: 'junk_food_phase', title: 'Junk Food Phase', description: 'You went through a phase of eating nothing but junk food.', category: 'health', minAge: 13, maxAge: 22, weight: 7, statEffect: { fitness: -6, health: -4 }, color: '#F97316', choices: [] },

  // ─── Adult ───────────────────────────────────────────────────────────────
  { id: 'annual_checkup', title: 'Annual Checkup', description: 'Your doctor gave you a clean bill of health.', category: 'health', minAge: 20, maxAge: 60, weight: 10, statEffect: { health: 5, happiness: 3 }, color: '#2DD4BF', choices: [] },
  { id: 'high_bp_diagnosis', title: 'High Blood Pressure', description: 'Your doctor diagnosed you with high blood pressure.', category: 'health', minAge: 30, maxAge: 60, weight: 7, statEffect: { health: -10, happiness: -5 }, color: '#EF4444', choices: [
    { id: 'medication', text: 'Start medication', subtext: 'Take it seriously', statEffect: { health: 8, fitness: -2 } },
    { id: 'lifestyle_change', text: 'Change lifestyle', subtext: 'Diet and exercise', statEffect: { health: 10, fitness: 8, happiness: 3 } },
    { id: 'ignore_bp', text: 'Ignore it', subtext: 'Hope for the best', statEffect: { health: -8, mentalHealth: -3 } },
  ]},
  { id: 'marathon', title: 'Running a Marathon', description: 'You signed up for and completed your first marathon!', category: 'health', minAge: 18, maxAge: 50, weight: 4, statEffect: { fitness: 15, health: 10, happiness: 12, ambition: 5 }, color: '#10B981', choices: [] },
  { id: 'work_stress_burnout', title: 'Work Burnout', description: 'Months of overworking left you completely burned out.', category: 'health', minAge: 25, maxAge: 55, weight: 8, statEffect: { mentalHealth: -15, health: -8, happiness: -10, ambition: -8 }, color: '#EF4444', choices: [
    { id: 'take_leave', text: 'Take a medical leave', subtext: 'Rest and recover', statEffect: { mentalHealth: 20, health: 10, happiness: 8 } },
    { id: 'push_through_burnout', text: 'Keep pushing', subtext: 'Work through it', statEffect: { mentalHealth: -10, health: -5, ambition: 5 } },
  ]},
  { id: 'diabetes_risk', title: 'Diabetes Warning', description: 'Blood tests revealed you are at risk for type 2 diabetes.', category: 'health', minAge: 35, maxAge: 65, weight: 6, statEffect: { health: -8 }, color: '#F97316', choices: [
    { id: 'diet_overhaul', text: 'Overhaul your diet', subtext: 'Cut sugar and carbs', statEffect: { health: 12, fitness: 6 } },
    { id: 'ignore_diabetes', text: 'Ignore the warning', subtext: 'Keep eating the same', statEffect: { health: -12, happiness: -3 } },
  ]},
  { id: 'yoga_meditation', title: 'Yoga & Meditation', description: 'You took up yoga and meditation, finding inner calm.', category: 'health', minAge: 20, maxAge: 70, weight: 7, statEffect: { mentalHealth: 12, health: 5, fitness: 4, happiness: 8 }, color: '#8B5CF6', choices: [] },

  // ─── Middle Age ───────────────────────────────────────────────────────────
  { id: 'knee_surgery', title: 'Knee Surgery', description: 'Years of wear and tear led to a necessary knee surgery.', category: 'health', minAge: 40, maxAge: 60, weight: 6, statEffect: { health: -10, fitness: -15, happiness: -8 }, bankEffect: -8000, color: '#F97316', choices: [] },
  { id: 'heart_attack_scare', title: 'Heart Attack Scare', description: 'You experienced chest pains and were rushed to hospital. It was a warning.', category: 'health', minAge: 45, maxAge: 70, weight: 5, statEffect: { health: -20, mentalHealth: -10, happiness: -12 }, bankEffect: -15000, color: '#EF4444', choices: [
    { id: 'lifestyle_reform', text: 'Complete lifestyle reform', subtext: 'Diet, exercise, stress reduction', statEffect: { health: 15, fitness: 10, mentalHealth: 8 } },
    { id: 'mild_changes', text: 'Make some changes', subtext: 'A few tweaks', statEffect: { health: 5 } },
  ]},
  { id: 'back_pain_chronic', title: 'Chronic Back Pain', description: 'Years of poor posture at a desk job caught up with you.', category: 'health', minAge: 35, maxAge: 65, weight: 8, statEffect: { health: -8, fitness: -5, happiness: -6, ambition: -3 }, color: '#F97316', choices: [] },
  { id: 'weight_loss_journey', title: 'Weight Loss Journey', description: 'You committed to losing weight and transformed your body.', category: 'health', minAge: 25, maxAge: 60, weight: 5, statEffect: { fitness: 20, health: 15, looks: 10, happiness: 12 }, color: '#10B981', choices: [] },

  // ─── Senior ───────────────────────────────────────────────────────────────
  { id: 'joint_replacement', title: 'Joint Replacement', description: 'You needed a hip replacement surgery.', category: 'health', minAge: 60, maxAge: 80, weight: 7, statEffect: { health: -5, fitness: -10 }, bankEffect: -20000, color: '#F97316', choices: [] },
  { id: 'cancer_diagnosis', title: 'Cancer Diagnosis', description: 'You were diagnosed with early-stage cancer.', category: 'health', minAge: 45, maxAge: 80, weight: 4, statEffect: { health: -25, mentalHealth: -20, happiness: -15 }, bankEffect: -30000, color: '#EF4444', choices: [
    { id: 'aggressive_treatment', text: 'Aggressive treatment', subtext: 'Fight with everything you have', statEffect: { health: 20, mentalHealth: 10 } },
    { id: 'palliative_care', text: 'Focus on quality of life', subtext: 'Comfort-focused care', statEffect: { happiness: 15, mentalHealth: 15, health: 5 } },
  ]},
  { id: 'dementia_onset', title: 'Memory Concerns', description: 'You have been experiencing memory lapses. Tests suggest early cognitive decline.', category: 'health', minAge: 65, maxAge: 85, weight: 5, statEffect: { intelligence: -15, mentalHealth: -10, happiness: -8 }, color: '#EF4444', choices: [] },
  { id: 'senior_yoga', title: 'Senior Fitness Program', description: 'You joined a senior yoga and aquatics program.', category: 'health', minAge: 60, maxAge: 85, weight: 8, statEffect: { fitness: 8, health: 6, social: 8, happiness: 10 }, color: '#10B981', choices: [] },

  // ─── General ─────────────────────────────────────────────────────────────
  { id: 'quit_smoking', title: 'Quit Smoking', description: 'You quit smoking after years of the habit.', category: 'health', minAge: 18, maxAge: 70, weight: 5, statEffect: { health: 15, fitness: 10, happiness: 8 }, color: '#10B981', choices: [] },
  { id: 'start_smoking', title: 'Started Smoking', description: 'Social pressure led you to start smoking.', category: 'health', minAge: 15, maxAge: 35, weight: 6, statEffect: { health: -10, fitness: -5 }, color: '#EF4444', choices: [
    { id: 'refuse_smoke', text: 'Refuse', subtext: 'Say no', statEffect: { health: 0, mentalHealth: 3 } },
    { id: 'try_smoke', text: 'Try it', subtext: 'Give in', statEffect: { health: -10, fitness: -5 } },
  ]},
  { id: 'alcohol_dependency', title: 'Alcohol Dependency', description: 'Your drinking has become a problem affecting your health and relationships.', category: 'health', minAge: 21, maxAge: 60, weight: 5, statEffect: { health: -15, mentalHealth: -12, social: -8, happiness: -10 }, color: '#EF4444', choices: [
    { id: 'rehab', text: 'Enter rehab program', subtext: 'Get professional help', statEffect: { health: 15, mentalHealth: 15, happiness: 10 } },
    { id: 'quit_cold_turkey', text: 'Quit cold turkey', subtext: 'Willpower only', statEffect: { health: 10, mentalHealth: 8, happiness: 5 } },
    { id: 'continue_drinking', text: 'Keep drinking', subtext: 'Denial', statEffect: { health: -20, mentalHealth: -15, social: -10 } },
  ]},
  { id: 'new_diet_plan', title: 'New Diet Plan', description: 'You started a structured healthy eating plan.', category: 'health', minAge: 18, maxAge: 70, weight: 9, statEffect: { health: 6, fitness: 4, happiness: 3 }, color: '#10B981', choices: [] },
  { id: 'insomnia_struggle', title: 'Insomnia', description: 'You have been unable to sleep properly for months.', category: 'health', minAge: 22, maxAge: 65, weight: 7, statEffect: { health: -8, mentalHealth: -10, intelligence: -4, happiness: -7 }, color: '#8B5CF6', choices: [
    { id: 'sleep_doctor', text: 'See a sleep specialist', subtext: 'Proper diagnosis', statEffect: { health: 10, mentalHealth: 8 } },
    { id: 'natural_remedies', text: 'Try natural remedies', subtext: 'Melatonin, no screens', statEffect: { health: 5, mentalHealth: 5 } },
  ]},
  { id: 'allergy_season', title: 'Severe Allergies', description: 'Allergy season hit you hard this year.', category: 'health', minAge: 5, maxAge: 60, weight: 10, statEffect: { health: -3, happiness: -4 }, color: '#F97316', choices: [] },
  { id: 'healthy_cooking', title: 'Healthy Cooking Classes', description: 'You took a healthy cooking class and learned to love nutritious food.', category: 'health', minAge: 18, maxAge: 65, weight: 8, statEffect: { health: 8, fitness: 4, intelligence: 3, happiness: 6 }, color: '#10B981', choices: [] },
];
