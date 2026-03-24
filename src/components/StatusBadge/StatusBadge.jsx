import './StatusBadge.css';

const statusConfig = {
  'Active': { className: 'active', dot: true },
  'Paused': { className: 'paused', dot: true },
  'Closed': { className: 'closed', dot: true },
  'To be scheduled': { className: 'review' },
  'In Progress': { className: 'interview' },
  'Shortlisted': { className: 'shortlisted' },
  'Offer Extended': { className: 'offer' },
  'Offer Accepted': { className: 'accepted' },
  'Hired': { className: 'accepted' },
  'Rejected': { className: 'rejected' },
  'High': { className: 'high' },
  'Medium': { className: 'medium' },
  'Low': { className: 'low' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { className: 'default' };

  return (
    <span className={`status-badge status-badge--${config.className}`}>
      {config.dot && <span className="status-badge__dot"></span>}
      {status}
    </span>
  );
}
