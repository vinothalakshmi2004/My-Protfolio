const mongoose = require('mongoose');

const SKILL_LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SkillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Skill name is required'], trim: true, maxlength: 60 },
    // Optional icon key (e.g. "react", "mongodb"). Empty = auto-detected from the name on the client.
    icon: { type: String, default: '', trim: true, maxlength: 40 },
    level: { type: String, enum: SKILL_LEVELS, default: '' },
  },
  { _id: true }
);

const SkillSchema = new mongoose.Schema(
  {
    category: { type: String, required: [true, 'Skill category is required'], trim: true, unique: true, maxlength: 60 },
    items: { type: [SkillItemSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', SkillSchema);
module.exports.SKILL_LEVELS = SKILL_LEVELS;
