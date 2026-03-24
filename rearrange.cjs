const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard/Dashboard.jsx', 'utf8');

// 1. Remove the duration select from the header
const headerDropdownText = `<div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <select 
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--surface)', 
              color: 'var(--text-1)', 
              fontSize: '0.95rem', 
              cursor: 'pointer', 
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value="7days">Last Week</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <div className="page-header__date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>`;
        
const newHeaderDateOnly = `<div className="page-header__date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>`;

content = content.replace(headerDropdownText, newHeaderDateOnly);

// 2. Extract and remove the Hiring Trend Chart block
const trendRegex = /\{\/\* Main Content Grid \*\/\}\s*<div className="dashboard-grid">\s*\{\/\* Hiring Trend Chart \*\/\}\s*<div className="card card--wide animate-fade-in-up"[\s\S]*?<\/div>\s*<\/div>/;
let trendMatch = content.match(trendRegex);
let trendBlock = trendMatch ? trendMatch[0] : '';
content = content.replace(trendRegex, '');

// 3. Inject the select into the Hiring Trend header
const selectHtml = `            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '6px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--surface)', 
                color: 'var(--text-1)', 
                fontSize: '0.9rem', 
                cursor: 'pointer', 
                outline: 'none',
              }}
            >
              <option value="7days">Last Week</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">This Year</option>
              <option value="all">All Time</option>
            </select>`;

trendBlock = trendBlock.replace(`<span className="card__subtitle">Last 7 months</span>`, selectHtml);
trendBlock = trendBlock.replace(`<div className="card__header">`, `<div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>`);

// 4. Place the trend block BEFORE "Three Consolidated Cards"
content = content.replace(`{/* Three Consolidated Cards */}`, trendBlock + '\n\n      {/* Three Consolidated Cards */}');

fs.writeFileSync('src/pages/Dashboard/Dashboard.jsx', content);
console.log('JSX layout transformed successfully!');
