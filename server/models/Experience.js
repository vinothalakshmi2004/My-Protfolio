const mongoose = require('mongoose');
const { FileRefSchema, emptyFileRef } = require('./schemas/fileRef');

const ExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: [true, 'Company name is required'], trim: true, maxlength: 120 },
    role: { type: String, required: [true, 'Role / job title is required'], trim: true, maxlength: 120 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    // Month precision dates stored as "YYYY-MM" ('' when unknown)
    startDate: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
    isCurrent: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
    companyLogo: { type: FileRefSchema, default: emptyFileRef },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A current role never has an end date
ExperienceSchema.pre('save', function clearEndDate(next) {
  if (this.isCurrent) this.endDate = '';
  next();
});

module.exports = mongoose.model('Experience', ExperienceSchema);
