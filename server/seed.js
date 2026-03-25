require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Position = require('./models/Position');
const Candidate = require('./models/Candidate');
const Update = require('./models/Update');
const { 
  HiringStats, 
  HiringTrend, 
  DepartmentBreakdown, 
  PipelineStage, 
  RecruiterPerformance, 
  SourceAnalytics 
} = require('./models/Analytics');

// Data (copied from frontend mockData.js)
const hiringStats = {
  totalOpenPositions: 47,
  totalCandidates: 1284,
  interviewsScheduled: 38,
  offersExtended: 12,
  offerAcceptanceRate: 87,
  avgTimeToHire: 23,
  activeRecruiters: 8,
  departmentsHiring: 6,
};

const hiringTrend = [
  { month: 'Sep', hires: 8, applications: 120 },
  { month: 'Oct', hires: 12, applications: 185 },
  { month: 'Nov', hires: 10, applications: 210 },
  { month: 'Dec', hires: 6, applications: 95 },
  { month: 'Jan', hires: 15, applications: 280 },
  { month: 'Feb', hires: 18, applications: 320 },
  { month: 'Mar', hires: 14, applications: 260 },
];

const departmentBreakdown = [
  { name: 'Engineering', openRoles: 18, color: '#6366f1' },
  { name: 'Product', openRoles: 7, color: '#8b5cf6' },
  { name: 'Design', openRoles: 5, color: '#a78bfa' },
  { name: 'Marketing', openRoles: 6, color: '#10b981' },
  { name: 'Sales', openRoles: 8, color: '#f59e0b' },
  { name: 'Operations', openRoles: 3, color: '#f87171' },
];

const openPositions = [
  {
    title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Bangalore, India',
    type: 'Full-time', experience: '5-8 years', posted: new Date('2026-03-15'),
    applicants: 42, status: 'Active', priority: 'High', description: 'Build and maintain scalable React applications with modern architecture patterns.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
    taPartner: 'Anjali M.'
  },
  {
    title: 'Product Manager', department: 'Product', location: 'Mumbai, India',
    type: 'Full-time', experience: '4-7 years', posted: new Date('2026-03-12'),
    applicants: 38, status: 'Active', priority: 'High', description: 'Lead product strategy and roadmap for our SaaS platform.',
    skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
    taPartner: 'Ravi K.'
  },
  {
    title: 'UX Designer', department: 'Design', location: 'Remote',
    type: 'Full-time', experience: '3-5 years', posted: new Date('2026-03-10'),
    applicants: 56, status: 'Active', priority: 'Medium', description: 'Design intuitive user experiences for web and mobile products.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    taPartner: 'Sunita P.'
  },
  {
    title: 'DevOps Engineer', department: 'Engineering', location: 'Hyderabad, India',
    type: 'Full-time', experience: '3-6 years', posted: new Date('2026-03-08'),
    applicants: 29, status: 'Active', priority: 'Medium', description: 'Build and manage CI/CD pipelines, cloud infrastructure, and monitoring systems.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    taPartner: 'Amit S.'
  },
  {
    title: 'Data Scientist', department: 'Engineering', location: 'Bangalore, India',
    type: 'Full-time', experience: '3-5 years', posted: new Date('2026-03-05'),
    applicants: 64, status: 'Active', priority: 'High', description: 'Develop ML models and data pipelines for business intelligence.',
    skills: ['Python', 'TensorFlow', 'SQL', 'Spark'],
    taPartner: 'Neha R.'
  }
];

const candidates = [
  { 
    name: 'Priya Sharma', role: 'Senior Frontend Engineer', email: 'priya.s@email.com', 
    status: 'Interview Scheduled', stage: 'Technical Round', feedback: 'Very strong React skills. Good problem solver.', 
    experience: '6 years', appliedDate: new Date('2026-03-16'), avatar: 'PS', source: 'LinkedIn',
    hiringManager: 'John Doe', domain: 'E-commerce', technicalDetails: 'React, Redux, Node.js'
  },
  { 
    name: 'Arjun Patel', role: 'Product Manager', email: 'arjun.p@email.com', 
    status: 'Under Review', stage: 'Resume Screening', feedback: 'Promising background in SaaS.', 
    experience: '5 years', appliedDate: new Date('2026-03-15'), avatar: 'AP', source: 'Referral',
    hiringManager: 'Jane Smith', domain: 'Fintech', technicalDetails: 'Product Strategy, Agile'
  },
  { 
    name: 'Sneha Reddy', role: 'UX Designer', email: 'sneha.r@email.com', 
    status: 'Offer Extended', stage: 'Offer', feedback: 'Excellent design thinking and portfolio.', 
    experience: '4 years', appliedDate: new Date('2026-03-10'), avatar: 'SR', source: 'Job Portal',
    hiringManager: 'Mike Wilson', domain: 'Healthcare', technicalDetails: 'Figma, Adobe XD'
  },
  { 
    name: 'Vikram Singh', role: 'DevOps Engineer', email: 'vikram.s@email.com', 
    status: 'Interview Scheduled', stage: 'HR Round', feedback: 'Strong cloud infra knowledge.', 
    experience: '5 years', appliedDate: new Date('2026-03-12'), avatar: 'VS', source: 'LinkedIn',
    hiringManager: 'Sarah Connor', domain: 'Cloud Services', technicalDetails: 'AWS, Kubernetes'
  },
  { 
    name: 'Kavita Menon', role: 'Data Scientist', email: 'kavita.m@email.com', 
    status: 'Shortlisted', stage: 'Assignment', feedback: 'Clear understanding of ML concepts.', 
    experience: '4 years', appliedDate: new Date('2026-03-08'), avatar: 'KM', source: 'Campus',
    hiringManager: 'David G.', domain: 'AI/ML', technicalDetails: 'Python, TensorFlow'
  }
];

const updates = [
  { type: 'offer_accepted', title: 'Offer Accepted', description: 'Meera Joshi accepted the Sales Development Rep offer. Start date: April 1, 2026.', timestamp: new Date('2026-03-20T10:30:00'), department: 'Sales', icon: '🎉' },
  { type: 'interview_scheduled', title: 'Interview Scheduled', description: 'Technical round scheduled for Priya Sharma (Sr. Frontend Engineer) on March 22.', timestamp: new Date('2026-03-20T09:15:00'), department: 'Engineering', icon: '📅' },
  { type: 'new_position', title: 'New Position Opened', description: 'AI/ML Engineer position opened in the Engineering department. Priority: High.', timestamp: new Date('2026-03-19T16:00:00'), department: 'Engineering', icon: '🆕' },
  { type: 'offer_extended', title: 'Offer Extended', description: 'Offer letter sent to Sneha Reddy for UX Designer role with ₹22L package.', timestamp: new Date('2026-03-19T14:30:00'), department: 'Design', icon: '📨' },
  { type: 'milestone', title: 'Hiring Milestone', description: 'Q1 2026 target of 45 hires achieved! 🏆 Total headcount now at 320.', timestamp: new Date('2026-03-18T11:00:00'), department: 'All', icon: '🏆' },
  { type: 'candidate_rejected', title: 'Candidate Moved Out', description: 'Rahul Gupta did not clear the technical round for Sr. Frontend Engineer.', timestamp: new Date('2026-03-18T09:45:00'), department: 'Engineering', icon: '❌' },
  { type: 'new_applicants', title: 'Bulk Applications Received', description: '28 new applications received for Data Scientist role in the last 48 hours.', timestamp: new Date('2026-03-17T15:00:00'), department: 'Engineering', icon: '📥' },
  { type: 'position_closed', title: 'Position Filled', description: 'QA Lead position successfully filled. Onboarding scheduled for March 25.', timestamp: new Date('2026-03-17T10:30:00'), department: 'Engineering', icon: '✅' },
  { type: 'policy_update', title: 'Policy Update', description: 'Updated referral bonus: ₹50,000 for engineering roles, ₹30,000 for others.', timestamp: new Date('2026-03-16T13:00:00'), department: 'HR', icon: '📋' },
  { type: 'interview_scheduled', title: 'Panel Interview', description: 'System design round for Deepak Nair (Backend Engineer) with 3 panelists on March 21.', timestamp: new Date('2026-03-16T09:00:00'), department: 'Engineering', icon: '👥' }
];

const pipelineStages = [
  { name: 'Applied', count: 342, color: '#818cf8' },
  { name: 'Screening', count: 128, color: '#a78bfa' },
  { name: 'Interview', count: 64, color: '#f59e0b' },
  { name: 'Assessment', count: 38, color: '#38bdf8' },
  { name: 'Offer', count: 18, color: '#34d399' },
  { name: 'Hired', count: 12, color: '#10b981' }
];

const recruiterPerformance = [
  { name: 'Anjali M.', hires: 8, interviews: 24, pipeline: 42 },
  { name: 'Ravi K.', hires: 6, interviews: 18, pipeline: 35 },
  { name: 'Sunita P.', hires: 7, interviews: 22, pipeline: 38 },
  { name: 'Amit S.', hires: 5, interviews: 15, pipeline: 28 },
  { name: 'Neha R.', hires: 9, interviews: 28, pipeline: 48 }
];

const sourceAnalytics = [
  { source: 'LinkedIn', candidates: 420, hires: 18, conversionRate: 4.3 },
  { source: 'Referrals', candidates: 180, hires: 14, conversionRate: 7.8 },
  { source: 'Job Portals', candidates: 380, hires: 10, conversionRate: 2.6 },
  { source: 'Campus', candidates: 204, hires: 8, conversionRate: 3.9 },
  { source: 'Direct Apply', candidates: 100, hires: 4, conversionRate: 4.0 }
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talenthub';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB... clearing old data');
    
    // Clear existing data
    await Position.deleteMany({});
    await Candidate.deleteMany({});
    await Update.deleteMany({});
    await HiringStats.deleteMany({});
    await HiringTrend.deleteMany({});
    await DepartmentBreakdown.deleteMany({});
    await PipelineStage.deleteMany({});
    await RecruiterPerformance.deleteMany({});
    await SourceAnalytics.deleteMany({});

    console.log('Inserting new seed data...');
    
    await Position.insertMany(openPositions);
    await Candidate.insertMany(candidates);
    await Update.insertMany(updates);
    await HiringStats.create(hiringStats);
    await HiringTrend.insertMany(hiringTrend);
    await DepartmentBreakdown.insertMany(departmentBreakdown);
    await PipelineStage.insertMany(pipelineStages);
    await RecruiterPerformance.insertMany(recruiterPerformance);
    await SourceAnalytics.insertMany(sourceAnalytics);

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
