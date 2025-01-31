const Car = require("../models/car.model");


// Уменьшить количество автомобилей
exports.decreaseCarQuantity = async (carId) => {
  try {
    const car = await Car.findById(carId);
    if (!car) {
      throw new Error("Автомобиль не найден");
    }

    if (car.quantity > 0) {
      car.quantity -= 1;
    }

    if (car.quantity === 0) {
      car.available = false;
    }

    await car.save();
    return car;
  } catch (err) {
    throw new Error(err.message);
  }
};




// Получить все автомобили
exports.getAllCars = async (req, res) => {
  try {
    const { brand, minPrice, maxPrice } = req.query;

    // Формируем критерии фильтрации
    const filter = {};
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" }; // Поиск по марке (независимо от регистра)
    }
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
    }

    // Получаем отфильтрованные автомобили
    const cars = await Car.find(filter);
    res.status(200).json(cars);
  } catch (err) {
    console.error("Ошибка получения автомобилей:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

// Получить автомобиль по ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден" });
    }
    res.status(200).json(car);
  } catch (err) {
    console.error("Ошибка получения автомобиля:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};


// Удаление машины
exports.deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByIdAndDelete(carId);

    if (!car) {
      return res.status(404).json({ message: "Машина не найдена" });
    }

    res.status(200).json({ message: "Машина успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении машины" });
  }
};

// Обновление атрибута машины
exports.updateCarAttribute = async (req, res) => {
  try {
    const carId = req.params.id;
    const { field, value } = req.body;

    const allowedFields = ["brand", "model", "year", "pricePerDay", "quantity"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Недопустимое поле для обновления" });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { [field]: value },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Машина не найдена" });
    }

    res.status(200).json({ message: `Поле ${field} успешно обновлено`, car: updatedCar });
  } catch (error) {
    console.error("Ошибка при обновлении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении машины" });
  }
};

// Добавление машины
exports.addCar = async (req, res) => {
  try {
    const { brand, model, year, pricePerDay, quantity } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : null;

    const newCar = new Car({ brand, model, year, pricePerDay, quantity, img });
    await newCar.save();

    res.status(201).json({ message: "Машина успешно добавлена", car: newCar });
  } catch (error) {
    console.error("Ошибка при добавлении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при добавлении машины" });
  }
};



exports.getFilters = async (req, res) => {
  try {
    const brands = await Car.distinct("brand"); // Уникальные марки автомобилей
    const minPrice = await Car.findOne().sort({ pricePerDay: 1 }).select("pricePerDay");
    const maxPrice = await Car.findOne().sort({ pricePerDay: -1 }).select("pricePerDay");

    res.status(200).json({
      brands,
      minPrice: minPrice?.pricePerDay || 0,
      maxPrice: maxPrice?.pricePerDay || 10000,
    });
  } catch (err) {
    console.error("Ошибка получения фильтров:", err.message);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

exports.updateCarImage = async (req, res) => {
  try {
    const carId = req.params.id;

    // Проверяем, был ли загружен файл
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }

    // Проверяем, существует ли автомобиль
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден" });
    }

    // Обновляем путь к изображению
    car.img = `/uploads/${req.file.filename}`;
    await car.save();

    res.status(200).json({ message: "Изображение автомобиля успешно обновлено", car });
  } catch (error) {
    console.error("Ошибка при обновлении изображения автомобиля:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении изображения автомобиля" });
  }
};
