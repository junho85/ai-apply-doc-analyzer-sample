require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/api/analyze', async (req, res) => {
  // Live AI analysis only available when GEMINI_API_KEY is set (local dev)
  if (process.env.GEMINI_API_KEY) {
    const { analyzeDocuments } = require('./lib/analyzer');
    try {
      const documents = [
        { id: 'doc1', filename: 'doc1_admission.png', type: 'admission', label: 'Hangang National University - Emily Johnson', expectedValid: true },
        { id: 'doc2', filename: 'doc2_admission.png', type: 'admission', label: 'Donggang International University - Lucas Müller', expectedValid: true },
        { id: 'doc3', filename: 'doc3_fake_admission.png', type: 'admission', label: 'Admission Letter - James Kim (Suspicious)', expectedValid: false },
      ];
      const results = await analyzeDocuments(documents);
      return res.json({ success: true, results });
    } catch (err) {
      console.error('Analysis error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Static pre-computed results for deployment (no API key needed)
  const resultsPath = path.join(__dirname, 'public', 'results.json');
  const cached = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  res.json(cached);
});

app.listen(PORT, () => {
  console.log(`Document Analyzer running at http://localhost:${PORT}`);
});
