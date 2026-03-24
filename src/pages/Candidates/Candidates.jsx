import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, UserPlus } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import { fetchCandidates, createCandidate, updateCandidate, fetchPositions } from '../../services/api';
import './Candidates.css';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', role: '', experience: '', stage: 'R1-Technical', status: 'In Progress',
    feedback: '', source: 'LinkedIn', domain: '', technicalDetails: '', hiringManager: ''
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [positions, setPositions] = useState([]);

  const loadCandidates = async () => {
    try {
      const data = await fetchCandidates();
      setCandidates(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load candidates');
      setLoading(false);
    }
  };

  const loadPositionsData = async () => {
    try {
      const data = await fetchPositions();
      setPositions(data);
    } catch (err) {
      console.error('Failed to load positions', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCandidates(), loadPositionsData()]);
    };
    init();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createCandidate({ ...formData });
      setIsAddModalOpen(false);
      setFormData({
        name: '', role: '', experience: '', stage: 'R1-Technical', status: 'In Progress', 
        feedback: '', source: 'LinkedIn', domain: '', technicalDetails: '', hiringManager: ''
      });
      await loadCandidates();
    } catch (error) {
      console.error('Failed to create candidate', error);
      alert('Failed to create candidate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (candidate) => {
    setSelectedCandidate({ ...candidate });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateCandidate(selectedCandidate._id || selectedCandidate.id, { ...selectedCandidate });
      setIsEditModalOpen(false);
      setSelectedCandidate(null);
      await loadCandidates();
    } catch (error) {
      console.error('Failed to update candidate', error);
      alert('Failed to update candidate.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="cand-page cand-loading">
        <Loader2 className="spinner" size={40} />
        <p>Loading Candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cand-page cand-error">
        <p>{error}</p>
      </div>
    );
  }

  const statuses = ['All', 'Selected', 'Not Selected', 'In Progress', 'To be Scheduled'];

  const filtered = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="cand-page" id="candidates-page">
      {/* Header */}
      <div className="cand-header">
        <div className="cand-header__left">
          <h1 className="cand-header__title">Candidates</h1>
          <p className="cand-header__subtitle">Track and manage {filtered.length} candidates in the pipeline</p>
        </div>
        <button className="cand-btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Add Candidate
        </button>
      </div>

      {/* Filters Bar */}
      <div className="cand-filters animate-fade-in-up">
        <div className="cand-search">
          <Search size={18} className="cand-search__icon" />
          <input
            type="text"
            placeholder="Search candidates by name or role..."
            className="cand-search__input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cand-chips">
          {statuses.map(status => (
            <button
              key={status}
              className={`cand-chip ${statusFilter === status ? 'cand-chip--active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="cand-table-wrapper animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <table className="cand-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Applied For</th>
              <th>Hiring Manager</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate, i) => (
              <tr
                key={candidate._id || candidate.id || i}
                className="cand-row"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => handleEditClick(candidate)}
              >
                <td>
                  <div className="cand-info">
                    <div className="cand-avatar" style={{ background: getAvatarColor(candidate._id || i) }}>
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="cand-name">{candidate.name}</div>
                      <div className="cand-exp">{candidate.experience}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="cand-role">{candidate.role}</span>
                </td>
                <td>
                  <span className="cand-hm">{candidate.hiringManager || '-'}</span>
                </td>
                <td>
                  <span className="cand-stage">{candidate.stage}</span>
                </td>
                <td>
                  <StatusBadge status={candidate.status} />
                </td>
                <td>
                  <span className="cand-source">{candidate.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="cand-empty">
            <p>No candidates found matching criteria.</p>
          </div>
        )}
      </div>

      {/* --- ADD CANDIDATE MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Candidate" subtitle="Enter details to add to pipeline" icon={UserPlus}>
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input required type="text" className="form-input" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Position Applied</label>
              <select required className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="" disabled>Select a position</option>
                {positions.map(p => (
                  <option key={p._id || p.id} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Exp</label>
              <input required type="text" className="form-input" placeholder="e.g. 4 yrs" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Domain</label>
              <input type="text" className="form-input" placeholder="e.g. E-Commerce" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Technical Details</label>
              <input type="text" className="form-input" placeholder="React, Node" value={formData.technicalDetails} onChange={e => setFormData({...formData, technicalDetails: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hiring Manager</label>
              <input type="text" className="form-input" placeholder="e.g. Jane Smith" value={formData.hiringManager} onChange={e => setFormData({...formData, hiringManager: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-select" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                <option>R1-Technical</option><option>R2-Technical</option><option>Client Interaction</option><option>HR Round</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option>Selected</option><option>Not Selected</option><option>In Progress</option><option>To be Scheduled</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="spinner" size={18} /> Saving...</> : 'Add Candidate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT CANDIDATE MODAL --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Candidate Details">
        {selectedCandidate && (
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" className="form-input" value={selectedCandidate.name} onChange={e => setSelectedCandidate({...selectedCandidate, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Position Applied</label>
                <select required className="form-select" value={selectedCandidate.role} onChange={e => setSelectedCandidate({...selectedCandidate, role: e.target.value})}>
                  <option value="" disabled>Select a position</option>
                  {positions.map(p => (
                    <option key={p._id || p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Exp</label>
                <input required type="text" className="form-input" value={selectedCandidate.experience} onChange={e => setSelectedCandidate({...selectedCandidate, experience: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Domain</label>
                <input type="text" className="form-input" value={selectedCandidate.domain || ''} onChange={e => setSelectedCandidate({...selectedCandidate, domain: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Technical Details</label>
                <input type="text" className="form-input" value={selectedCandidate.technicalDetails || ''} onChange={e => setSelectedCandidate({...selectedCandidate, technicalDetails: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select className="form-select" value={selectedCandidate.stage} onChange={e => setSelectedCandidate({...selectedCandidate, stage: e.target.value})}>
                  <option>R1-Technical</option><option>R2-Technical</option><option>Client Interaction</option><option>HR Round</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={selectedCandidate.status} onChange={e => setSelectedCandidate({...selectedCandidate, status: e.target.value})}>
                  <option>Selected</option><option>Not Selected</option><option>In Progress</option><option>To be Scheduled</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" value={selectedCandidate.source} onChange={e => setSelectedCandidate({...selectedCandidate, source: e.target.value})}>
                  <option>LinkedIn</option><option>Naukri</option><option>Reference</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea className="form-textarea" placeholder="Enter feedback..." value={selectedCandidate.feedback || ''} onChange={e => setSelectedCandidate({...selectedCandidate, feedback: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hiring Manager</label>
              <input type="text" className="form-input" value={selectedCandidate.hiringManager || ''} onChange={e => setSelectedCandidate({...selectedCandidate, hiringManager: e.target.value})} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isUpdating}>
                {isUpdating ? <><Loader2 className="spinner" size={18} /> Updating...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function getAvatarColor(id) {
  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
    'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
  ];
  let numId = 1;
  if (typeof id === 'string') {
    numId = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  } else if (typeof id === 'number') {
    numId = id;
  }
  return colors[numId % colors.length];
}
