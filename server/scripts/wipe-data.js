const mongoose = require('mongoose');
require('dotenv').config();

const Candidate = require('../models/Candidate');
const Position = require('../models/Position');
const Update = require('../models/Update');
const { HiringStats, HiringTrend, DepartmentBreakdown, PipelineStage, RecruiterPerformance, SourceAnalytics } = require('../models/Analytics');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talenthub';

const cleanup = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Candidate.deleteMany({});
    console.log('🗑️  Cleared Candidates');

    await Position.deleteMany({});
    console.log('🗑️  Cleared Positions');

    await Update.deleteMany({});
    console.log('🗑️  Cleared Updates');

    await HiringStats.deleteMany({});
    await HiringTrend.deleteMany({});
    await DepartmentBreakdown.deleteMany({});
    await PipelineStage.deleteMany({});
    await RecruiterPerformance.deleteMany({});
    await SourceAnalytics.deleteMany({});
    console.log('🗑️  Cleared Analytics');

    console.log('\n✨ Database wiped clean and ready for fresh data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
