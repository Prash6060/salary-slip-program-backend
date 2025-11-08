const Counter = require('../model/Counter');

function formatCode(prefix, n, width = 3) {
  return `${prefix}${String(n).padStart(width, '0')}`;
}

// All schemas call this with the SAME key, e.g., 'global_code'
async function getNextGlobalSequence(key = 'global_code') {
  const doc = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, lean: true }
  );
  return doc.seq;
}

module.exports = { getNextGlobalSequence, formatCode };
