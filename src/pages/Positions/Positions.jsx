import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users as UsersIcon, ChevronDown, Loader2, Plus, UserPlus, Briefcase, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import { fetchPositions, fetchCandidates, createPosition, createCandidate, updatePosition, deletePosition } from '../../services/api';
import './Positions.css';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', department: 'Engineering', location: '', type: 'Full-time',
    experience: '', description: '', skills: '', status: 'Active', priority: 'Medium',
    taPartner: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [viewApplicantsForPosition, setViewApplicantsForPosition] = useState(null);

  const loadPositions = async () => {
    try {
      const [posData, candData] = await Promise.all([
        fetchPositions(),
        fetchCandidates()
      ]);
      setPositions(posData);
      setAllCandidates(candData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load positions and candidates');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createPosition(formData);
      setIsAddModalOpen(false);
      setFormData({
        title: '', department: 'Engineering', location: '', type: 'Full-time',
        experience: '', description: '', skills: '', status: 'Active', priority: 'Medium',
        taPartner: ''
      });
      await loadPositions();
    } catch (error) {
      console.error('Failed to create position', error);
      alert('Failed to create position. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (pos, e) => {
    e.stopPropagation();
    setSelectedPosition({
      ...pos,
      skills: Array.isArray(pos.skills) ? pos.skills.join(', ') : pos.skills
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updatePosition(selectedPosition._id || selectedPosition.id, selectedPosition);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
      await loadPositions();
    } catch (error) {
      console.error('Failed to update position', error);
      alert('Failed to update position. Check console.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePosition = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this position?')) return;
    
    try {
      await deletePosition(id);
      await loadPositions();
    } catch (error) {
      console.error('Failed to delete position', error);
      alert('Failed to delete position. Check console.');
    }
  };

  if (loading) {
    return (
      <div className="pos-page pos-loading">
        <Loader2 className="spinner" size={40} />
        <p>Loading Positions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pos-page pos-error">
        <p>{error}</p>
      </div>
    );
  }

  const departments = ['All', ...new Set(positions.map(p => p.department))];
  const filtered = positions.filter(pos => {
    const matchSearch = pos.title.toLowerCase().includes(search.toLowerCase()) ||
                        pos.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || pos.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="pos-page" id="positions-page">
      {/* Header */}
      <div className="pos-header">
        <div className="pos-header__left">
          <h1 className="pos-header__title">Open Positions</h1>
          <p className="pos-header__subtitle">{filtered.length} active positions across {departments.length - 1} departments</p>
        </div>
        <button className="pos-btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> Add Position
        </button>
      </div>

      {/* Filters Bar */}
      <div className="pos-filters animate-fade-in-up">
        <div className="pos-search">
          <Search size={18} className="pos-search__icon" />
          <input
            type="text"
            placeholder="Search positions..."
            className="pos-search__input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pos-chips">
          {departments.map(dept => (
            <button
              key={dept}
              className={`pos-chip ${deptFilter === dept ? 'pos-chip--active' : ''}`}
              onClick={() => setDeptFilter(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Positions List */}
      <div className="pos-list">
        {filtered.map((pos, i) => (
          <div
            key={pos._id || pos.id || i}
            className={`pos-card animate-fade-in-up ${expandedId === (pos._id || pos.id) ? 'pos-card--expanded' : ''}`}
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => setExpandedId(expandedId === (pos._id || pos.id) ? null : (pos._id || pos.id))}
          >
            <div className="pos-card__main">
              <div className="pos-card__left">
                <div className="pos-card__dept-badge" style={{ background: getDeptBg(pos.department), color: getDeptColor(pos.department) }}>
                  <Briefcase size={20} />
                </div>
                <div className="pos-card__info">
                  <h3 className="pos-card__title">{pos.title}</h3>
                  <div className="pos-card__meta">
                    <span className="pos-card__meta-item">
                      <MapPin size={14} /> {pos.location}
                    </span>
                    <span className="pos-card__meta-item">
                      <Clock size={14} /> {pos.experience}
                    </span>
                    {pos.taPartner && (
                      <span className="pos-card__meta-item">
                        <strong>TA:</strong> {pos.taPartner}
                      </span>
                    )}
                    <span 
                      className="pos-card__meta-item pos-link" 
                      onClick={(e) => { e.stopPropagation(); setViewApplicantsForPosition(pos); }}
                      title="View Applicants"
                    >
                      <UsersIcon size={14} /> {allCandidates.filter(c => c.role === pos.title).length} applicants
                    </span>
                  </div>
                </div>
              </div>
              <div className="pos-card__right">
                <StatusBadge status={pos.status} />
                <StatusBadge status={pos.priority} />
                <ChevronDown size={18} className={`pos-chevron ${expandedId === (pos._id || pos.id) ? 'pos-chevron--up' : ''}`} />
              </div>
            </div>

            {expandedId === (pos._id || pos.id) && (
              <div className="pos-card__details">
                <p className="pos-card__desc">{pos.description}</p>
                <div className="pos-card__skills">
                  {Array.isArray(pos.skills) ? pos.skills.map(skill => (
                    <span key={skill} className="pos-skill">{skill}</span>
                  )) : pos.skills.split(',').map(skill => (
                    <span key={skill.trim()} className="pos-skill">{skill.trim()}</span>
                  ))}
                </div>
                <div className="pos-card__footer">
                  <div className="pos-card__footer-left">
                    <span className="pos-card__posted">
                      Posted: {new Date(pos.posted).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="pos-card__type">{pos.type}</span>
                  </div>
                  <div className="pos-card__actions">
                    <button className="pos-action-btn" onClick={(e) => { e.stopPropagation(); setViewApplicantsForPosition(pos); }}>
                      <UsersIcon size={16} /> View Candidates
                    </button>
                    <button className="pos-action-btn" onClick={(e) => handleEditClick(pos, e)}>
                      Edit
                    </button>
                    <button className="pos-action-btn pos-action-btn--delete" onClick={(e) => handleDeletePosition(pos._id || pos.id, e)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="pos-empty animate-fade-in-up">
          <p>No positions found matching your criteria.</p>
        </div>
      )}

      {/* --- MODALS (Reused Logic, Updated Styling Hooks where applicable) --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Position">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input required type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option>Engineering</option><option>Product</option><option>Design</option>
                <option>Marketing</option><option>Sales</option><option>HR</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input required type="text" className="form-input" placeholder="e.g. Remote, NY, SF" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              <input required type="text" className="form-input" placeholder="e.g. 3-5 yrs" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input type="text" className="form-input" placeholder="React, Node, CSS" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">TA Partner</label>
              <input required type="text" className="form-input" placeholder="e.g. John Doe" value={formData.taPartner} onChange={e => setFormData({...formData, taPartner: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea required className="form-textarea" placeholder="Job responsibilities..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="spinner" size={18} /> Saving...</> : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Position details">
        {selectedPosition && (
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input required type="text" className="form-input" value={selectedPosition.title} onChange={e => setSelectedPosition({...selectedPosition, title: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={selectedPosition.department} onChange={e => setSelectedPosition({...selectedPosition, department: e.target.value})}>
                  <option>Engineering</option><option>Product</option><option>Design</option>
                  <option>Marketing</option><option>Sales</option><option>HR</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input required type="text" className="form-input" value={selectedPosition.location} onChange={e => setSelectedPosition({...selectedPosition, location: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={selectedPosition.type} onChange={e => setSelectedPosition({...selectedPosition, type: e.target.value})}>
                  <option>Full-time</option><option>Part-time</option><option>Contract</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <input required type="text" className="form-input" value={selectedPosition.experience} onChange={e => setSelectedPosition({...selectedPosition, experience: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input type="text" className="form-input" value={selectedPosition.skills} onChange={e => setSelectedPosition({...selectedPosition, skills: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">TA Partner</label>
              <input required type="text" className="form-input" placeholder="e.g. Jane Doe" value={selectedPosition.taPartner || ''} onChange={e => setSelectedPosition({...selectedPosition, taPartner: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={selectedPosition.priority} onChange={e => setSelectedPosition({...selectedPosition, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={selectedPosition.status} onChange={e => setSelectedPosition({...selectedPosition, status: e.target.value})}>
                  <option>Active</option><option>On Hold</option><option>Closed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea required className="form-textarea" value={selectedPosition.description} onChange={e => setSelectedPosition({...selectedPosition, description: e.target.value})}></textarea>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isUpdating}>
                {isUpdating ? <><Loader2 className="spinner" size={18} /> Updating...</> : 'Update Position'}
              </button>
            </div>
          </form>
        )}
      </Modal>


      {/* View Applicants Modal Removed */}


      <Modal isOpen={!!viewApplicantsForPosition} onClose={() => setViewApplicantsForPosition(null)} title={`Applicants for ${viewApplicantsForPosition?.title}`}>
        <div className="pos-applicants-list">
          {viewApplicantsForPosition && (() => {
            const applicants = allCandidates.filter(c => c.role === viewApplicantsForPosition.title);
            if (applicants.length === 0) return <p className="pos-empty">No candidates found for this position yet.</p>;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {applicants.map(c => (
                  <div key={c._id || c.id} className="pos-applicant-card">
                    <div>
                      <h4 className="pos-applicant-card__name">{c.name}</h4>
                      <p className="pos-applicant-card__meta">{c.experience} • Source: {c.source}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
}

function getDeptBg(dept) {
  const colors = {
    Engineering: 'rgba(99, 102, 241, 0.15)',
    Product: 'rgba(168, 85, 247, 0.15)',
    Design: 'rgba(236, 72, 153, 0.15)',
    Marketing: 'rgba(16, 185, 129, 0.15)',
    Sales: 'rgba(245, 158, 11, 0.15)',
    HR: 'rgba(56, 189, 248, 0.15)',
  };
  return colors[dept] || 'rgba(148, 163, 184, 0.15)';
}

function getDeptColor(dept) {
  const colors = {
    Engineering: '#818cf8',
    Product: '#c084fc',
    Design: '#f472b6',
    Marketing: '#34d399',
    Sales: '#fbbf24',
    HR: '#38bdf8',
  };
  return colors[dept] || '#94a3b8';
}
