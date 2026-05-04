const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory leaderboard (persists while server is up)
// For permanent storage, swap this with a file or DB
let leaderboard = [];
const MAX_ENTRIES = 50;

// GET leaderboard
app.get('/leaderboard', (req, res) => {
  const top = leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json(top);
});

// POST new score
app.post('/leaderboard', (req, res) => {
  const { name, score, mode } = req.body;
  if (!name || typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  // Sanitize name
  const cleanName = String(name).replace(/[^a-zA-Z0-9_\- ]/g, '').substring(0, 16).trim() || 'Anonymous';
  const cleanMode = ['classic','blitz','rush'].includes(mode) ? mode : 'classic';
  const entry = {
    name: cleanName,
    score: Math.floor(score),
    mode: cleanMode,
    ts: Date.now()
  };
  leaderboard.push(entry);
  // Keep top MAX_ENTRIES
  leaderboard = leaderboard.sort((a,b) => b.score - a.score).slice(0, MAX_ENTRIES);
  res.json({ ok: true, rank: leaderboard.findIndex(e => e === entry) + 1 });
});

// Health check
app.get('/', (req, res) => res.json({ status: 'VOID MERGE server online', entries: leaderboard.length }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VOID MERGE server running on port ${PORT}`));
