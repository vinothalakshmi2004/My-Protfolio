const mongoose = require('mongoose');
const { FileRefSchema, emptyFileRef } = require('./schemas/fileRef');

const AchievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Achievement title is required'], trim: true, maxlength: 150 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    date: { type: String, default: '', trim: true }, // "YYYY-MM"
    image: { type: FileRefSchema, default: emptyFileRef },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', AchievementSchema);
