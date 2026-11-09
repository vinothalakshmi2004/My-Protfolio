const mongoose = require('mongoose');

const SCORE_TYPES = ['CGPA', 'Percentage', 'Grade'];

const EducationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: [true, 'Degree / qualification is required'], trim: true, maxlength: 150 },
    institution: { type: String, required: [true, 'Institution name is required'], trim: true, maxlength: 150 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    // 4-digit years as strings; endYear '' means "ongoing"
    startYear: { type: String, default: '', trim: true },
    endYear: { type: String, default: '', trim: true },
    scoreType: { type: String, enum: SCORE_TYPES, default: 'CGPA' },
    score: { type: String, default: '', trim: true, maxlength: 20 },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Education', EducationSchema);
module.exports.SCORE_TYPES = SCORE_TYPES;
