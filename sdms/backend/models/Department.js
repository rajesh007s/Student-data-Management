const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    description: { type: String, default: '' },
    establishedYear: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
