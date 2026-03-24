import { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Loader2,
  BarChart2,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';
import { fetchAnalytics } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [duration, setDuration] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const analyticsData = await fetchAnalytics(duration);
        setData(analyticsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    loadData();
  }, [duration]);

  if (loading) {
    return (
      <div className="dashboard loading-state">
        <Loader2 className="spinner" size={40} />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard error-state">
        <p>{error}</p>
      </div>
    );
  }

  const { stats: hiringStats, sources: sourceSummary, taPartners } = data;

  // Calculate Totals for Matrix
  const matrixStages = ['R1-Technical', 'R2-Technical', 'Client Interaction', 'HR Round'];
  const pipelineTotals = matrixStages.reduce((acc, stage) => {
    const row = hiringStats?.candidateMatrix?.[stage] || {};
    acc.scheduled += (row['To be Scheduled'] || 0);
    acc.selected += (row['Selected'] || 0);
    acc.rejected += (row['Not Selected'] || 0);
    acc.inProgress += (row['In Progress'] || 0);
    return acc;
  }, { scheduled: 0, selected: 0, rejected: 0, inProgress: 0 });

  // Calculate Totals for Sources
  const sourceTotals = (sourceSummary || []).reduce((acc, s) => {
    acc.count += (s.count || 0);
    acc.hires += (s.hires || 0);
    acc.rejected += (s.rejected || 0);
    return acc;
  }, { count: 0, hires: 0, rejected: 0 });
  const totalConversion = sourceTotals.count > 0 ? Math.round((sourceTotals.hires / sourceTotals.count) * 100) : 0;

  // Calculate Totals for TA Partners
  const taTotals = (taPartners || []).reduce((acc, p) => {
    acc.assigned += (p.totalPositions || 0);
    acc.closed += (p.closedPositions || 0);
    return acc;
  }, { assigned: 0, closed: 0 });
  const totalTAProgress = taTotals.assigned > 0 ? Math.round((taTotals.closed / taTotals.assigned) * 100) : 0;

  const maxSourceCount = sourceSummary && sourceSummary.length > 0 ? Math.max(...sourceSummary.map(s => s.count)) : 1;
  const safeMaxSource = maxSourceCount > 0 ? maxSourceCount : 1;

  const sourceColors = { LinkedIn: '#0a66c2', Naukri: '#ff6600', Reference: '#10b981' };
  const sourceIcons = { LinkedIn: '🔗', Naukri: '📋', Reference: '🤝' };

  return (
    <div className="dashboard" id="dashboard-page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header__left">
          <h1 className="dash-header__title">Hiring Dashboard</h1>
        </div>
        <div className="dash-header__right">
          <select 
            className="dash-duration-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="7days">Last Week</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <span className="dash-header__date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Quick Stat Pills */}
      <h2 className="dash-section-title">Position Updates</h2>
      <div className="dash-stat-pills">
        <div className="dash-pill dash-pill--primary">
          <div className="dash-pill__icon"><Briefcase size={20} /></div>
          <div className="dash-pill__content">
            <span className="dash-pill__value">{hiringStats?.totalPositions || 0}</span>
            <span className="dash-pill__label">Total Positions</span>
          </div>
        </div>
        <div className="dash-pill dash-pill--success">
          <div className="dash-pill__icon"><ChevronUp size={20} /></div>
          <div className="dash-pill__content">
            <span className="dash-pill__value">{hiringStats?.closedPositions || 0}</span>
            <span className="dash-pill__label">Filled</span>
          </div>
        </div>
        <div className="dash-pill dash-pill--info">
          <div className="dash-pill__icon"><Minus size={20} /></div>
          <div className="dash-pill__content">
            <span className="dash-pill__value">{hiringStats?.openPositions || 0}</span>
            <span className="dash-pill__label">Open</span>
          </div>
        </div>
        <div className="dash-pill dash-pill--warning">
          <div className="dash-pill__icon"><ChevronDown size={20} /></div>
          <div className="dash-pill__content">
            <span className="dash-pill__value">{hiringStats?.onHoldPositions || 0}</span>
            <span className="dash-pill__label">On Hold</span>
          </div>
        </div>
        <div className="dash-pill dash-pill--accent">
          <div className="dash-pill__icon"><Users size={20} /></div>
          <div className="dash-pill__content">
            <span className="dash-pill__value">{hiringStats?.totalCandidates || 0}</span>
            <span className="dash-pill__label">Total Candidates</span>
          </div>
        </div>
      </div>

      {/* Grid: Candidate Matrix */}
      <div className="dash-cards-row dash-cards-row--full">
        {/* Candidate Summary Matrix */}
        <div className="dash-card dash-card--matrix animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="dash-card__header">
            <div className="dash-card__header-left">
              <div className="dash-card__icon dash-card__icon--green">
                <Users size={20} />
              </div>
              <h2 className="dash-card__title">Candidate Pipeline</h2>
            </div>
            <span className="dash-card__badge">{hiringStats?.totalCandidates || 0} total</span>
          </div>
          <div className="dash-matrix-wrap">
            <table className="dash-matrix">
              <thead>
                <tr>
                  <th className="dash-matrix__th dash-matrix__th--stage">Stage</th>
                  <th className="dash-matrix__th">Scheduled</th>
                  <th className="dash-matrix__th">Selected</th>
                  <th className="dash-matrix__th">Rejected</th>
                  <th className="dash-matrix__th">In Progress</th>
                </tr>
              </thead>
              <tbody>
                {['R1-Technical', 'R2-Technical', 'Client Interaction', 'HR Round'].map((stage, idx) => {
                  const row = hiringStats?.candidateMatrix?.[stage] || {};
                  const total = (row['To be Scheduled'] || 0) + (row['Selected'] || 0) + (row['Not Selected'] || 0) + (row['In Progress'] || 0);
                  return (
                    <tr key={stage} className="dash-matrix__row">
                      <td className="dash-matrix__td dash-matrix__td--stage">
                        <span className="dash-matrix__stage-dot" style={{ background: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][idx] }} />
                        {stage}
                      </td>
                      <td className="dash-matrix__td">
                        <span className={`dash-matrix__cell ${(row['To be Scheduled'] || 0) > 0 ? 'dash-matrix__cell--active' : ''}`}>
                          {row['To be Scheduled'] || 0}
                        </span>
                      </td>
                      <td className="dash-matrix__td">
                        <span className={`dash-matrix__cell dash-matrix__cell--selected ${(row['Selected'] || 0) > 0 ? 'dash-matrix__cell--active' : ''}`}>
                          {row['Selected'] || 0}
                        </span>
                      </td>
                      <td className="dash-matrix__td">
                        <span className={`dash-matrix__cell dash-matrix__cell--rejected ${(row['Not Selected'] || 0) > 0 ? 'dash-matrix__cell--active' : ''}`}>
                          {row['Not Selected'] || 0}
                        </span>
                      </td>
                      <td className="dash-matrix__td">
                        <span className={`dash-matrix__cell dash-matrix__cell--progress ${(row['In Progress'] || 0) > 0 ? 'dash-matrix__cell--active' : ''}`}>
                          {row['In Progress'] || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="dash-matrix__row dash-matrix__row--total">
                  <td className="dash-matrix__td dash-matrix__td--stage">Total</td>
                  <td className="dash-matrix__td"><span className="dash-matrix__cell dash-matrix__cell--total">{pipelineTotals.scheduled}</span></td>
                  <td className="dash-matrix__td"><span className="dash-matrix__cell dash-matrix__cell--total">{pipelineTotals.selected}</span></td>
                  <td className="dash-matrix__td"><span className="dash-matrix__cell dash-matrix__cell--total">{pipelineTotals.rejected}</span></td>
                  <td className="dash-matrix__td"><span className="dash-matrix__cell dash-matrix__cell--total">{pipelineTotals.inProgress}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Source Effectiveness + TA Partners */}
      <div className="dash-cards-row dash-cards-row--stats">
        {/* Source Effectiveness */}
        <div className="dash-card dash-card--sources animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="dash-card__header">
            <div className="dash-card__header-left">
              <div className="dash-card__icon dash-card__icon--amber">
                <BarChart2 size={20} />
              </div>
              <h2 className="dash-card__title">Source Effectiveness</h2>
            </div>
          </div>
          <div className="dash-sources">
            {/* Table Header */}
            <div className="dash-source-head">
              <span className="dash-source-head__src">Source</span>
              <span className="dash-source-head__col">Candidates</span>
              <span className="dash-source-head__col">Hired</span>
              <span className="dash-source-head__col">Rejected</span>
              <span className="dash-source-head__col">Conv.</span>
            </div>
            {sourceSummary && sourceSummary.map((item, i) => {
              const color = sourceColors[item.source] || '#6366f1';
              return (
                <div key={i} className="dash-source-row">
                  <div className="dash-source-row__src">
                    <span className="dash-source-row__emoji">{sourceIcons[item.source] || '📌'}</span>
                    <span className="dash-source-row__name">{item.source}</span>
                  </div>
                  <span className="dash-source-row__val" style={{ color }}>{item.count}</span>
                  <span className="dash-source-row__val dash-source-row__val--hired">{item.hires || 0}</span>
                  <span className="dash-source-row__val dash-source-row__val--rejected">{item.rejected || 0}</span>
                  <span className={`dash-source-row__conv ${(item.conversionRate || 0) > 0 ? 'dash-source-row__conv--high' : ''}`}>
                    {item.conversionRate || 0}%
                  </span>
                </div>
              );
            })}
            {(!sourceSummary || sourceSummary.every(s => s.count === 0)) && (
              <p className="dash-sources__empty">No candidate data for selected period.</p>
            )}
            {sourceSummary && sourceSummary.length > 0 && (
              <div className="dash-source-row dash-source-row--total">
                <div className="dash-source-row__src">
                  <span className="dash-source-row__emoji">📊</span>
                  <span className="dash-source-row__name">Total</span>
                </div>
                <span className="dash-source-row__val" style={{ color: '#fff' }}>{sourceTotals.count}</span>
                <span className="dash-source-row__val dash-source-row__val--hired" style={{ fontWeight: 700 }}>{sourceTotals.hires}</span>
                <span className="dash-source-row__val dash-source-row__val--rejected" style={{ fontWeight: 700 }}>{sourceTotals.rejected}</span>
                <span className="dash-source-row__conv dash-source-row__conv--total">
                  {totalConversion}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* TA Partner vs Position */}
        <div className="dash-card dash-card--sources animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="dash-card__header">
            <div className="dash-card__header-left">
              <div className="dash-card__icon dash-card__icon--green">
                <Users size={20} />
              </div>
              <h2 className="dash-card__title">TA Partner - Assigned/Closed</h2>
            </div>
          </div>
          <div className="dash-sources">
            <div className="dash-source-head dash-source-head--ta">
              <span className="dash-source-head__src">TA Partner</span>
              <span className="dash-source-head__col">Assigned</span>
              <span className="dash-source-head__col">Closed</span>
              <span className="dash-source-head__col--progress">Progress</span>
            </div>
            {taPartners && taPartners.map((item, i) => {
              const progress = item.totalPositions > 0 ? Math.round((item.closedPositions / item.totalPositions) * 100) : 0;
              return (
                <div key={i} className="dash-source-row dash-source-row--ta">
                  <div className="dash-source-row__src">
                    <span className="dash-source-row__emoji">👤</span>
                    <span className="dash-source-row__name">{item._id}</span>
                  </div>
                  <span className="dash-source-row__val dash-source-row__val--count">{item.totalPositions}</span>
                  <span className="dash-source-row__val dash-source-row__val--hired">{item.closedPositions}</span>
                  <div className="dash-source-row__progress-wrap">
                    <div className="dash-progress-bar">
                      <div className="dash-progress-bar__fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="dash-progress-text">{progress}%</span>
                  </div>
                </div>
              );
            })}
            {(!taPartners || taPartners.length === 0) && (
              <p className="dash-sources__empty">No TA Partner data available.</p>
            )}
            {taPartners && taPartners.length > 0 && (
              <div className="dash-source-row dash-source-row--ta dash-source-row--total">
                <div className="dash-source-row__src">
                  <span className="dash-source-row__emoji">👥</span>
                  <span className="dash-source-row__name">Total</span>
                </div>
                <span className="dash-source-row__val dash-source-row__val--count" style={{ color: '#fff' }}>{taTotals.assigned}</span>
                <span className="dash-source-row__val dash-source-row__val--hired" style={{ fontWeight: 700 }}>{taTotals.closed}</span>
                <div className="dash-source-row__progress-wrap">
                  <div className="dash-progress-bar">
                    <div className="dash-progress-bar__fill" style={{ width: `${totalTAProgress}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                  </div>
                  <span className="dash-progress-text" style={{ color: '#fff' }}>{totalTAProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
