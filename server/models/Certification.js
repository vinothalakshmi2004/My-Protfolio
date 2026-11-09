const mongoose = require('mongoose');
const { TypedFileRefSchema } = require('./schemas/fileRef');

const CertificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Certification title is required'], trim: true, maxlength: 150 },
    issuer: { type: String, required: [true, 'Issuing organization is required'], trim: true, maxlength: 120 },
    issueDate: { type: String, default: '', trim: true }, // "YYYY-MM"
    credentialUrl: { type: String, default: '', trim: true },
    // Certificate image or PDF stored in GridFS
    file: { type: TypedFileRefSchema, default: () => ({ url: '', fileId: '', contentType: '' }) },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', CertificationSchema);
