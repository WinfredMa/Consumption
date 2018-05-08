import * as mongoose from 'mongoose';

const consumptionSchema = new mongoose.Schema({
  name: String,
  type: String,
  category: String,
  value: Number,
  source: String,
  remark: String,
  date: String
});

const Consumption = mongoose.model('Consumption', consumptionSchema);

export default Consumption;
