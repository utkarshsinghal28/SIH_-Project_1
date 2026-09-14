import mongoose from 'mongoose';

/**
 * Atomic sequence generator used for human-readable booking references.
 * `findOneAndUpdate` with `$inc` is atomic, so concurrent requests can never
 * receive the same sequence number.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, default: 0 },
});

counterSchema.statics.next = async function next(key) {
  const doc = await this.findByIdAndUpdate(
    key,
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return doc.value;
};

export default mongoose.model('Counter', counterSchema);
