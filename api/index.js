require('dotenv').config();
const express = require('express'); 
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const uri = process.env.MONGODB_URI;

// Настройка CORSЯ
app.use(cors({ origin: 'https://feydh.github.io/pizzeria-albretto/', credentials: true }));

// Настройка POST-запроса — JSON

app.use(express.json());

// Настройка БД
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    phoneNumber: {
        type: String,
        required: true,
    },
    birthday: Date,
    email: String,
    password: {
        type: String,
        required: true,
        min: 8
    },
    role: String,
}, {
    timestamps: true
});
const User = mongoose.model('user', userSchema);

const productSchema = new mongoose.Schema({
    name: String,
    structure: String,
    price: Number,
    image: String,
    category: String,
    weight: Number,
    purchaseCounter: Number,
    time: Number,
    count: Number
});

const Product = mongoose.model('product', productSchema);

const basketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, quantity: { type: Number, default: 1 } }]
});

const Basket = mongoose.model('basket', basketSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' }, quantity: { type: Number, required: true } }],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
}, {
    timestamps: true
});

const Order = mongoose.model('order', orderSchema);



app.use(session({
    secret: 'none',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

app.get(`/products`, async function (req, res) {
    let data = await Product.find();
    res.send(data);   
});


app.get('/products/purchaseCounter', async (req, res) => {
    let data = await Product.find().sort({purchaseCounter: -1}).limit(5);
    res.send(data)
});

// Логика для создания нового пользователя
app.post('/user', async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.json({ message: 'Не все поля введены' });
    }
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
        return res.json({ message: 'Пользователь с таким номером уже существует' });
    }
    const user = new User({
        username: '',
        phoneNumber,
        birthday: '',
        email: '',
        password,
        role: 'user'
    });
    const savedUser = await user.save();
    res.json({ userId: savedUser._id });
});

// Логика для входа пользователя
app.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.status(400).json({ message: 'Номер телефона и пароль обязательные поля' });
    }
    const user = await User.findOne({ phoneNumber });
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (user.password !== password) {
        return res.status(401).json({ message: 'Неверный пароль' });
    }
        // Установка сессии
    req.session.userId = user._id;
    res.json({
        user: {
            id: user._id,
            phoneNumber: user.phoneNumber,
            role: user.role
        }
        });
});

// Логика для выхода пользователя
app.post('/logout', (req, res) => {
    req.session.destroy
});
// Добавление товара в корзину
app.post('/basket/add', async (req, res) => {
    const { productId, userId } = req.body;
    let basket = await Basket.findOne({ userId });
    if (!basket) {
        basket = new Basket({ userId, products: [] });
    }
    const existingProduct = basket.products.find(item => item.productId.toString() === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        basket.products.push({ productId });
    }
    await basket.save(); 
    res.json(basket)
});

app.get('/basket/:userId', async (req, res) => {
    const { userId } = req.params;
        const basket = await Basket.findOne({ userId }).populate('products.productId');
        res.json(basket);
});

app.put('/basket/:userId/update', async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const basket = await Basket.findOne({ userId });
    const itemIndex = basket.products.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
        basket.products[itemIndex].quantity = quantity;
        await basket.save();
        res.json(basket);
    } else {
        res.json({ message: 'Товар не найден в корзине' });
    }
});

app.delete('/basket/:userId/remove', async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;
    const basket = await Basket.findOne({ userId });
    basket.products = basket.products.filter(item => item.productId.toString() !== productId);
    await basket.save();
    res.json(basket);
});

app.post('/orders', async (req, res) => {
    const { userId, items, totalAmount, address } = req.body;
    const newOrder = new Order({
        userId,
        items,
        totalAmount,
        address
    });

    const savedOrder = await newOrder.save();
    await Basket.findOneAndDelete({ userId }); 
    for (let item of items) {
        const { productId, quantity } = item;
        const product = await Product.findById(productId);
        if (product) {
            product.purchaseCounter += quantity;
            product.count -= quantity;
            await product.save(); 
        }
    }
    res.status(201).json(savedOrder);
});

app.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/user/:id/orders', async (req, res) => {
    try {
        const userId = req.params.id;
        const orders = await Order.find({ userId }).populate('items.productId');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'У вас нет заказов' });
        }
        res.json({ orders });
    } catch {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.put('/user/:id', async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;
    const user = await User.findById(userId);

    Object.keys(updateData).forEach(key => {
        user[key] = updateData[key];
    });

    await user.save();
});

app.delete('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await Basket.findOneAndDelete({ userId });
        await Order.deleteMany({ userId });
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json({ message: 'Пользователь и все связанные данные были удалены' });
    } catch {
        res.status(500).json({ message: 'Ошибка при удалении аккаунта' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.productId');;
        res.json({ orders });
    } catch {
        res.json({ message: 'Ошибка сервера' });
    }
});

app.post('/product', async (req, res) => {
    const { name, structure, price, image, category, purchaseCounter, time, count, weight } = req.body;

    if (!name || !price || !category || !time || !weight === undefined) {
        return res.status(400).json({ message: 'Не все поля заполнены' });
    }

    const product = new Product({
        name,
        structure,
        price,
        image,
        category,
        purchaseCounter: 0,
        time,
        weight,
        count: count || 0, 
    });

    try {
        const savedProduct = await product.save();
        res.status(201).json({message: 'Продукт добавлен!' });
    } catch {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.put('/product/:id', async (req, res) => {
    const { id } = req.params; 
    const updateData = req.body; 

    try {
        const product = await Product.findById(id);
        Object.keys(updateData).forEach(key => {
            product[key] = updateData[key];
        });

        await product.save();
        
        res.json({ message: 'Товар обновлен'});
    } catch {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.delete('/product/:id', async (req, res) => {
    const productId = req.params.id;
    try {
      await Product.findByIdAndDelete(productId);
      res.json({ message: 'Товар удалён' });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  });





