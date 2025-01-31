const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  model: { type: String, required: true },
  brand: { type: String, required: true },
  year: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  quantity: { type: Number, default: 1 }, // Новое поле для количества машин
  img: { type: String }, // Новое поле для изображения
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Car", carSchema);
