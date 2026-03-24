const mongoose = require('mongoose');

const hiringStatsSchema = new mongoose.Schema({
  totalOpenPositions: Number,
  totalCandidates: Number,
  interviewsScheduled: Number,
  offersExtended: Number,
  offerAcceptanceRate: Number,
  avgTimeToHire: Number,
  activeRecruiters: Number,
  departmentsHiring: Number,
});

const hiringTrendSchema = new mongoose.Schema({
  month: String,
  hires: Number,
  applications: Number,
});

const departmentBreakdownSchema = new mongoose.Schema({
  name: String,
  openRoles: Number,
  color: String,
});

const pipelineStageSchema = new mongoose.Schema({
  name: String,
  count: Number,
  color: String,
});

const recruiterPerformanceSchema = new mongoose.Schema({
  name: String,
  hires: Number,
  interviews: Number,
  pipeline: Number,
});

const sourceAnalyticsSchema = new mongoose.Schema({
  source: String,
  candidates: Number,
  hires: Number,
  conversionRate: Number,
});

module.exports = {
  HiringStats: mongoose.model('HiringStats', hiringStatsSchema),
  HiringTrend: mongoose.model('HiringTrend', hiringTrendSchema),
  DepartmentBreakdown: mongoose.model('DepartmentBreakdown', departmentBreakdownSchema),
  PipelineStage: mongoose.model('PipelineStage', pipelineStageSchema),
  RecruiterPerformance: mongoose.model('RecruiterPerformance', recruiterPerformanceSchema),
  SourceAnalytics: mongoose.model('SourceAnalytics', sourceAnalyticsSchema),
};
