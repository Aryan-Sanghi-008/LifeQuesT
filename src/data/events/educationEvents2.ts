import { LifeEvent } from '../../types';

export const EDUCATION_EVENTS_2: LifeEvent[] = [
  // ─── Primary School ──────────────────────────────────────────────────────
  { id: 'school_spelling_bee', title: 'Spelling Bee Champion', description: 'You won the school spelling bee! Teachers are impressed.', category: 'education', minAge: 7, maxAge: 12, weight: 5, statEffect: { intelligence: 5, social: 5, happiness: 8 }, color: '#3B82F6', choices: [] },
  { id: 'struggle_in_math', title: 'Struggling with Math', description: 'You are falling behind in math class.', category: 'education', minAge: 7, maxAge: 14, weight: 7, statEffect: { intelligence: -3, happiness: -5 }, color: '#F97316', choices: [
    { id: 'get_tutor', text: 'Get a tutor', subtext: 'Extra practice', statEffect: { intelligence: 10, happiness: 5 }, bankEffect: -500 },
    { id: 'work_harder_math', text: 'Study harder yourself', subtext: 'Self-discipline', statEffect: { intelligence: 6, ambition: 4 } },
    { id: 'give_up_math', text: 'Give up on math', subtext: 'It is not for you', statEffect: { intelligence: -5, ambition: -3 } },
  ]},
  { id: 'science_fair_win', title: 'Science Fair Winner', description: 'Your science project won first place at the school fair!', category: 'education', minAge: 8, maxAge: 14, weight: 5, statEffect: { intelligence: 8, ambition: 5, happiness: 10 }, color: '#3B82F6', choices: [] },

  // ─── High School ──────────────────────────────────────────────────────────
  { id: 'exam_stress', title: 'Exam Pressure', description: 'Final exams are coming up and the pressure is immense.', category: 'education', minAge: 14, maxAge: 18, weight: 9, statEffect: { mentalHealth: -8, happiness: -6 }, color: '#F97316', choices: [
    { id: 'intensive_study', text: 'Study intensively', subtext: 'All-nighters', statEffect: { intelligence: 12, health: -5, mentalHealth: -5 } },
    { id: 'balanced_study', text: 'Balanced revision', subtext: 'Study and sleep', statEffect: { intelligence: 8, health: 2, mentalHealth: 3 } },
    { id: 'cheat_exam', text: 'Consider cheating', subtext: 'Risk it', statEffect: { intelligence: -2, karma: -15 } },
  ]},
  { id: 'top_of_class', title: 'Top of the Class', description: 'You finished the school year with the highest grades in your class!', category: 'education', minAge: 13, maxAge: 18, weight: 5, statEffect: { intelligence: 12, ambition: 8, happiness: 10, social: 3 }, color: '#10B981', choices: [] },
  { id: 'drop_out_risk', title: 'Dropping Out?', description: 'You are seriously considering dropping out of school.', category: 'education', minAge: 14, maxAge: 17, weight: 4, statEffect: { ambition: -10, intelligence: -5 }, color: '#EF4444', choices: [
    { id: 'stay_in_school', text: 'Stay in school', subtext: 'Power through', statEffect: { ambition: 8, intelligence: 6 } },
    { id: 'drop_out', text: 'Drop out', subtext: 'Find another path', statEffect: { ambition: -15, intelligence: -8 }, updatesEducation: 'none' },
  ]},
  { id: 'scholarship_opportunity', title: 'Scholarship Opportunity', description: 'A prestigious scholarship opened applications. Your teachers encourage you to apply.', category: 'education', minAge: 16, maxAge: 18, weight: 5, statEffect: { ambition: 5 }, color: '#3B82F6', choices: [
    { id: 'apply_scholarship', text: 'Apply for the scholarship', subtext: 'Give it your best shot', statEffect: { intelligence: 8, ambition: 10, happiness: 10 }, successChance: 55 },
    { id: 'skip_scholarship', text: 'Skip the application', subtext: 'Not worth the effort', statEffect: { ambition: -5 } },
  ]},
  { id: 'debate_club_win', title: 'Debate Competition', description: 'You competed in a regional debate championship.', category: 'education', minAge: 14, maxAge: 18, weight: 5, statEffect: { intelligence: 6, social: 8, ambition: 5 }, color: '#3B82F6', choices: [] },

  // ─── University ────────────────────────────────────────────────────────────
  { id: 'university_acceptance', title: 'University Acceptance!', description: 'You received an acceptance letter from your top choice university!', category: 'education', minAge: 17, maxAge: 19, weight: 6, statEffect: { happiness: 20, ambition: 15, intelligence: 5 }, updatesEducation: 'university', color: '#10B981', choices: [] },
  { id: 'professor_mentor', title: 'A Mentor Professor', description: 'A professor took a special interest in your work and became your mentor.', category: 'education', minAge: 18, maxAge: 25, weight: 5, statEffect: { intelligence: 10, ambition: 8, social: 5 }, color: '#3B82F6', choices: [] },
  { id: 'failed_subject', title: 'Failed a Course', description: 'You failed an important course and need to retake it.', category: 'education', minAge: 18, maxAge: 25, weight: 7, statEffect: { intelligence: -5, happiness: -10, mentalHealth: -8 }, bankEffect: -2000, color: '#EF4444', choices: [
    { id: 'retake_course', text: 'Retake the course', subtext: 'Learn from the mistake', statEffect: { intelligence: 8, ambition: 5 }, bankEffect: -2000 },
    { id: 'switch_major', text: 'Switch your major', subtext: 'Try a different path', statEffect: { intelligence: 3, happiness: 5 } },
  ]},
  { id: 'research_opportunity', title: 'Research Paper Published', description: 'Your research was accepted for publication in an academic journal!', category: 'education', minAge: 20, maxAge: 30, weight: 4, statEffect: { intelligence: 15, ambition: 12, social: 5 }, color: '#10B981', choices: [] },
  { id: 'internship_offer', title: 'Internship Offer', description: 'A top company offered you a competitive internship.', category: 'education', minAge: 18, maxAge: 25, weight: 6, statEffect: { ambition: 10, intelligence: 5 }, bankEffect: 5000, color: '#3B82F6', choices: [] },

  // ─── Graduate ─────────────────────────────────────────────────────────────
  { id: 'masters_acceptance', title: 'Masters Degree Admission', description: 'You were accepted into a prestigious Masters program.', category: 'education', minAge: 21, maxAge: 30, weight: 5, statEffect: { intelligence: 8, ambition: 10 }, updatesEducation: 'graduate', color: '#10B981', choices: [] },
  { id: 'thesis_defense', title: 'Thesis Defense', description: 'You successfully defended your thesis before the academic committee.', category: 'education', minAge: 22, maxAge: 35, weight: 4, statEffect: { intelligence: 15, ambition: 12, happiness: 15, social: 8 }, updatesEducation: 'graduate', color: '#10B981', choices: [] },
  { id: 'phd_acceptance', title: 'PhD Program', description: 'You were accepted into a doctoral program with a full stipend.', category: 'education', minAge: 23, maxAge: 35, weight: 3, statEffect: { intelligence: 10, ambition: 12 }, color: '#10B981', choices: [] },

  // ─── Adult Learning ────────────────────────────────────────────────────────
  { id: 'online_certification', title: 'Online Certification', description: 'You completed an online certification course in your field.', category: 'education', minAge: 22, maxAge: 55, weight: 9, statEffect: { intelligence: 8, ambition: 6 }, bankEffect: -500, color: '#3B82F6', choices: [] },
  { id: 'language_learning', title: 'Learning a New Language', description: 'You dedicated yourself to learning a new language.', category: 'education', minAge: 15, maxAge: 65, weight: 7, statEffect: { intelligence: 8, social: 6, happiness: 5 }, color: '#3B82F6', choices: [] },
  { id: 'coding_bootcamp', title: 'Coding Bootcamp', description: 'You enrolled in an intensive coding bootcamp.', category: 'education', minAge: 18, maxAge: 45, weight: 6, statEffect: { intelligence: 15, ambition: 10 }, bankEffect: -8000, color: '#3B82F6', choices: [] },
  { id: 'executive_education', title: 'Executive Education', description: 'Your company sponsored you for an executive education program.', category: 'education', minAge: 30, maxAge: 55, weight: 5, statEffect: { intelligence: 10, ambition: 8, social: 6 }, color: '#10B981', choices: [] },
];
