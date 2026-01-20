// Simple TF-IDF + Cosine Similarity implementation

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach(t => {
    tf[t] = (tf[t] || 0) + 1;
  });
  return tf;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let key in vecA) {
    if (vecB[key]) dot += vecA[key] * vecB[key];
    magA += vecA[key] * vecA[key];
  }

  for (let key in vecB) {
    magB += vecB[key] * vecB[key];
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function buildVector(tokens, idf) {
  const tf = termFrequency(tokens);
  const vec = {};
  for (let word in tf) {
    vec[word] = tf[word] * (idf[word] || 1);
  }
  return vec;
}

function calculateSimilarity(studentText, internshipText, allDocs) {
  const studentTokens = tokenize(studentText);
  const internshipTokens = tokenize(internshipText);

  const docs = allDocs.map(d => tokenize(d));

  const df = {};
  docs.forEach(tokens => {
    new Set(tokens).forEach(word => {
      df[word] = (df[word] || 0) + 1;
    });
  });

  const N = docs.length;
  const idf = {};
  for (let word in df) {
    idf[word] = Math.log(N / (1 + df[word]));
  }

  const vecA = buildVector(studentTokens, idf);
  const vecB = buildVector(internshipTokens, idf);

  return Math.round(cosineSimilarity(vecA, vecB) * 100);
}

module.exports = calculateSimilarity;
