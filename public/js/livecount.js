let chartInstance = null;

async function fetchCounts(detail = false) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const url = '/api/livecount' + (detail ? '?detail=true' : '');
  const headers = {};
  if (auth && auth.username) {
    headers['Content-Type'] = 'application/json';
    headers['x-username'] = auth.username;
    headers['x-password'] = auth.password;
  }
  const res = await fetch(url, { headers });
  const data = await res.json();
  
  if (!res.ok) {
    console.error(data.error || 'Failed');
    return;
  }
  
  if (data.counts) {
    updateChart(data.counts);
    updateStats(data.counts);
  }
  
  if (detail && data.votes) {
    updateVoteDetails(data.votes);
  }
}

function updateChart(counts) {
  const ctx = document.getElementById('voteChart');
  if (!ctx) return;
  
  const labels = counts.map(c => c.name);
  const votes = counts.map(c => c.votes);
  const totalVotes = votes.reduce((a, b) => a + b, 0);
  
  const gradientColors = [
    '#ff4fa8',
    '#ff9a3c'
  ];
  
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = votes;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: votes,
            backgroundColor: gradientColors,
            borderColor: '#1a1e23',
            borderWidth: 3,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: { size: 14, weight: 'bold' },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ff4fa8',
            bodyColor: '#ffffff',
            borderColor: '#ff4fa8',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                const votes = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((votes / total) * 100).toFixed(1);
                return `Votes: ${votes} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}

function updateStats(counts) {
  const statsContainer = document.getElementById('candidateStats');
  if (!statsContainer) return;
  
  const totalVotes = counts.reduce((a, b) => a + b.votes, 0);
  
  const sortedCounts = [...counts].sort((a, b) => b.votes - a.votes);
  
  const statsHtml = sortedCounts.map((c, idx) => {
    const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
    const isLeading = idx === 0 && (sortedCounts.length === 1 || sortedCounts[0].votes > sortedCounts[1].votes);
    
    return `
      <div class="stat-card ${isLeading ? 'leading' : ''}">
        <div class="stat-header">
          <h3>${c.name}</h3>
          ${isLeading ? '<span class="leading-badge">🏆 Leading</span>' : ''}
        </div>
        <div class="stat-body">
          <div class="vote-count">${c.votes}</div>
          <div class="vote-percentage">${percentage}%</div>
          <div class="stat-bar">
            <div class="stat-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  statsContainer.innerHTML = statsHtml;
}

function updateVoteDetails(votes) {
  const voteDetailsEl = document.getElementById('voteDetails');
  if (!voteDetailsEl) return;
  
  const voteListHtml = votes.slice(0, 10).map(v => `
    <div class="vote-log-item">
      <span class="vote-user">👤 ${v.username}</span>
      <span class="vote-arrow">→</span>
      <span class="vote-candidate">✓ ${v.candidate_name}</span>
      <span class="vote-time">🕐 ${new Date(v.created_at).toLocaleTimeString()}</span>
    </div>
  `).join('');
  
  voteDetailsEl.innerHTML = `
    <h3>Recent Votes</h3>
    <div class="vote-log">
      ${voteListHtml}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  const refreshBtn = document.getElementById('refreshBtn');
  
  if (path.endsWith('livecount.html')) {
    fetchCounts(false);
    setInterval(() => fetchCounts(false), 5000);
    if (refreshBtn) {
      refreshBtn.onclick = () => fetchCounts(false);
    }
  } else if (path.endsWith('supervise.html')) {
    fetchCounts(true);
    setInterval(() => fetchCounts(true), 5000);
    if (refreshBtn) {
      refreshBtn.onclick = () => fetchCounts(true);
    }
  }
});
