import mongoose from 'mongoose';

/**
 * Example domain model. "Resource" is a neutral placeholder — copy this file,
 * rename it, and adjust the schema to model your own entity.
 */
const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
    toJSON: {
      virtuals: true,
      // Present a clean API shape: expose `id`, hide Mongo internals.
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
