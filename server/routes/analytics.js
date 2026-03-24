const express = require('express');
const router = express.Router();
const Position = require('../models/Position');
const Candidate = require('../models/Candidate');
const { 
  HiringStats, 
  HiringTrend, 
  DepartmentBreakdown, 
  PipelineStage, 
  RecruiterPerformance, 
  SourceAnalytics 
} = require('../models/Analytics');

// Get all analytics data
router.get('/', async (req, res) => {
  console.log('📊 Analytics request received - Serving structured data');
  try {
    const duration = req.query.duration || 'all';
    let positionDateMatch = {};
    let candidateDateMatch = {};
    
    if (duration !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      if (duration === '7days') startDate.setDate(now.getDate() - 7);
      else if (duration === '30days') startDate.setDate(now.getDate() - 30);
      else if (duration === '3months') startDate.setMonth(now.getMonth() - 3);
      else if (duration === '6months') startDate.setMonth(now.getMonth() - 6);
      else if (duration === '1year') startDate.setFullYear(now.getFullYear() - 1);
      
      positionDateMatch = { posted: { $gte: startDate } };
      candidateDateMatch = { appliedDate: { $gte: startDate } };
    }

    const stats = await HiringStats.findOne();
    const departmentStr = await DepartmentBreakdown.find();
    const pipeline = await PipelineStage.find();
    const recruiters = await RecruiterPerformance.find();

    // Live source aggregation from Candidates with hires & rejections
    const sourceSteps = [];
    if (duration !== 'all') {
      sourceSteps.push({ $match: candidateDateMatch });
    }
    sourceSteps.push({
      $group: {
        _id: '$source',
        count: { $sum: 1 },
        hires: { 
          $sum: { 
            $cond: [
              { $and: [ { $eq: ['$status', 'Selected'] }, { $eq: ['$stage', 'HR Round'] } ] }, 
              1, 
              0
            ] 
          } 
        },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'Not Selected'] }, 1, 0] } }
      }
    });
    const sourceAgg = await Candidate.aggregate(sourceSteps);
    // Build a structured array with all source options
    const allSources = ['LinkedIn', 'Naukri', 'Reference'];
    const sources = allSources.map(s => {
      const found = sourceAgg.find(a => a._id === s) || { count: 0, hires: 0, rejected: 0 };
      const conversionRate = found.count > 0 ? parseFloat(((found.hires / found.count) * 100).toFixed(1)) : 0;
      return {
        source: s,
        count: found.count,
        hires: found.hires,
        rejected: found.rejected,
        conversionRate
      };
    });

    // Dynamically calculate Hiring Trend from Candidates across last 7 months
    const trendMap = {};
    const nowTrend = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(nowTrend.getFullYear(), nowTrend.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trendMap[monthKey] = {
            month: monthNames[d.getMonth()],
            applications: 0,
            hires: 0
        };
    }

    const rawTrend = await Candidate.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$appliedDate" } },
          applications: { $sum: 1 },
          hires: {
            $sum: { $cond: [{ $eq: ["$status", "Selected"] }, 1, 0] }
          }
        }
      }
    ]);

    rawTrend.forEach(item => {
      if (trendMap[item._id]) {
        trendMap[item._id].applications += item.applications;
        trendMap[item._id].hires += item.hires;
      }
    });

    const trend = Object.values(trendMap);

    // Compute live metrics
    const activePositionsCount = await Position.countDocuments({ status: 'Active', ...positionDateMatch });
    const closedPositionsCount = await Position.countDocuments({ status: 'Closed', ...positionDateMatch });
    const onHoldPositionsCount = await Position.countDocuments({ status: 'On Hold', ...positionDateMatch });
    const totalPositionsCount = await Position.countDocuments(positionDateMatch);
    const totalCandidatesCount = await Candidate.countDocuments(candidateDateMatch);
    
    // Group candidates by Stage and Status
    const pipelineSteps = [];
    if (duration !== 'all') {
      pipelineSteps.push({ $match: candidateDateMatch });
    }
    pipelineSteps.push({
      $group: {
        _id: { stage: '$stage', status: '$status' },
        count: { $sum: 1 }
      }
    });
    
    const candidateMatrix = await Candidate.aggregate(pipelineSteps);
    
    // Build empty structural map matching the requested matrix layout
    const matrixData = {
      'R1-Technical': { 'To be Scheduled': 0, 'Selected': 0, 'Not Selected': 0, 'In Progress': 0 },
      'R2-Technical': { 'To be Scheduled': 0, 'Selected': 0, 'Not Selected': 0, 'In Progress': 0 },
      'Client Interaction': { 'To be Scheduled': 0, 'Selected': 0, 'Not Selected': 0, 'In Progress': 0 },
      'HR Round': { 'To be Scheduled': 0, 'Selected': 0, 'Not Selected': 0, 'In Progress': 0 }
    };

    // Hydrate matrix map dynamically with MongoDB groupings
    candidateMatrix.forEach(entry => {
      const { stage, status } = entry._id;
      if (matrixData[stage] && matrixData[stage][status] !== undefined) {
        matrixData[stage][status] = entry.count;
      }
    });

    // Compute TA Partner stats
    const taPartnerSteps = [];
    if (duration !== 'all') {
      taPartnerSteps.push({ $match: positionDateMatch });
    }
    taPartnerSteps.push({
      $group: {
        _id: '$taPartner',
        totalPositions: { $sum: 1 },
        closedPositions: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
      }
    });
    taPartnerSteps.push({
      $match: { _id: { $ne: null, $ne: "" } }
    });
    
    // Sort TA partners by total positions descending
    taPartnerSteps.push({ $sort: { totalPositions: -1 } });
    
    const taPartnerData = await Position.aggregate(taPartnerSteps);

    console.log("🔥 DEBUG TREND EXACTLY BEFORE JSON: 🔥", trend);

    res.json({
      stats: {
        totalPositions: totalPositionsCount,
        closedPositions: closedPositionsCount,
        openPositions: activePositionsCount,
        onHoldPositions: onHoldPositionsCount,
        totalCandidates: totalCandidatesCount,
        candidateMatrix: matrixData
      },
      trend: trend || [],
      department: departmentStr || [],
      pipeline: pipeline || [],
      recruiters: recruiters || [],
      sources: sources || [],
      taPartners: taPartnerData || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
