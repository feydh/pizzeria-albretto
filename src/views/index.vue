<script>
import '../css/index.css';
import '../js/input.js';
import '../js/scroll.js';
import axios from "axios";
axios.defaults.baseURL = 'https://pizzeria-albretto.vercel.app'

export default {
    data() {
        return {
            categories: ['Пицца', 'Закуски', 'Салаты', 'Супы', 'Десерты', 'Напитки', 'Комбо'],
            productsByCategory: {
                Пицца: [],
                Закуски: [],
                Салаты: [],
                Супы: [],
                Десерты: [],
                Напитки: [],
                Комбо: [],
            },
            product: {},
            productModalOpen: false,
            productsPurchaseCounter: [],
            loginOrRegister: false,
            login: false,
            register: false,
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            error: false,
            success: false,
            user: {},
            isUser: false,
            savedUser: {},

            phoneError: false, 
            products: [],


            category: '',

            

        };
    },
    methods: {
        async loadProducts() {
            let response = await axios.get('/products');
            let allProducts = response.data;
            this.productsByCategory = {
                Пицца: allProducts.filter(product => product.category === 'Пицца'),
                Закуски: allProducts.filter(product => product.category === 'Закуски'),
                Салаты: allProducts.filter(product => product.category === 'Салаты'),
                Супы: allProducts.filter(product => product.category === 'Супы'),
                Десерты: allProducts.filter(product => product.category === 'Десерты'),
                Напитки: allProducts.filter(product => product.category === 'Напитки'),
                Комбо: allProducts.filter(product => product.category === 'Комбо'),
            };
        },
        scrollToSection(category) {
            const section = document.getElementById(category);
            if (section) {
                const offset = 80; // Смещение в пикселях
                const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
            }
        },
        openProductModal(product) {
        if (product.count === 0) {
            return;  
        }
            this.product = product;
            this.productModalOpen = true;
            $('body').addClass('lock');
        },
        closeProductModal() {
            this.productModalOpen = false;  // Сбрасываем флаг, что окно закрыто
            this.product = {};  // Очищаем данные товара
            $('body').removeClass('lock');  // Разблокируем прокрутку страницы
        },
        async productPurchaseCounter() {
            let response = await axios.get('/products/purchaseCounter');
            this.productsPurchaseCounter = response.data;
        },
        openLoginOrRegister() {
            this.logToProfile();
        },     
        closeLoginOrRegister() {
            this.loginOrRegister = false;
            this.login = false;
            this.register = false;
            $('body').removeClass('lock');
        },
        openRegister() {
            this.login = false;
            this.register = true;
        },
        openLogin() {
            this.login = true;
            this.register = false;
        },     
        validatePhoneNumber(phone) {
            const phoneRegex = /^\+7-\d{3}-\d{3}-\d{4}$/; 
            return phoneRegex.test(phone);
        },
        async checkAuth() {
            this.savedUser = localStorage.getItem('user');
            if (this.savedUser) {
                this.user = JSON.parse(this.savedUser);
                this.isUser = true
            }
        },
        async logToProfile() {
            if (this.savedUser) {
                if (this.user.role === 'admin') {
                    this.$router.push({ name: 'admin' }); 
                } else {
                    this.$router.push({ name: 'user', params: { userId: this.user.id } }); 
                }
            } else {
                this.loginOrRegister = true;
                this.login = true; 
                $('body').addClass('lock');
            }
        },
        async createUser() {
            if (!this.validatePhoneNumber(this.phoneNumber)) {
                this.phoneError = true; 
                return;
            } else {
                this.phoneError = false; 
            }
            if (this.password !== this.confirmPassword) {
                this.error = true;
                return;
            }
            let response = await axios.post('/user', {
                phoneNumber: this.phoneNumber,
                password: this.password,
            });
            this.error = false;
            this.success = true;
            this.user = { id: response.data.userId, phoneNumber: this.phoneNumber };
            localStorage.setItem('user', JSON.stringify(this.user));
            this.$router.push({ name: 'user', params: { userId: this.user.id } });
        },
        async loginUser() {
            if (!this.validatePhoneNumber(this.phoneNumber)) {
                this.phoneError = true; // Устанавливаем ошибку, если номер не валиден
                return;
            }
            this.error = false;
            try {
                let response = await axios.post('/login', {
                    phoneNumber: this.phoneNumber,
                    password: this.password,
                });
                this.user = response.data.user;
                this.isUser = true; // Обновляем состояние
                localStorage.setItem('user', JSON.stringify(this.user));
                this.success = true;
                this.closeLoginOrRegister();

                // Проверяем роль пользователя
                if (this.user.role === 'admin') {
                    this.$router.push({ name: 'admin' });  // Перенаправляем на страницу администратора
                } else {
                    this.$router.push({ name: 'user', params: { userId: this.user.id } }); // Обычный пользователь
                }

            } catch (err) {
                this.success = false;
                this.error = true;
            }
        },
        async addToBasket(productId) {
            if (!this.isUser) {
                this.loginOrRegister = true; 
                this.login = true; 
                return;
            }
            const response = await axios.post('/basket/add', {
                productId, 
                userId: this.user.id 
            });
        },
        goBasket() {
            this.$router.push({ name: 'basket' });
        },
    },
    mounted() {
        this.loadProducts()
        this.productPurchaseCounter()
        this.checkAuth()
    }
}
</script>


<template>
    <main>
        <div class="blackout" v-if="loginOrRegister">
            <div class="modal-window">
                    <form @submit.prevent="loginUser" v-if="login">
                        <h3 class="title-login-or-register">Авторизация <img src="../assets/img/cross.png" alt=""
                                @click="closeLoginOrRegister()"></h3>
                        <div class="input-shell">
                            <input type="text" class="input" placeholder=" " v-model="phoneNumber">
                            <label for="phone">Номер телефона</label>
                            <span v-if="phoneError" class="error-message">Неверный формат номера телефона. Пример:
                                +1-999-555-9999</span>
                        </div>
                        <div class="input-shell">
                            <input type="password" class="input" placeholder=" " v-model="password">
                            <label for="phone">Пароль</label>
                        </div>
                        <button type="submit">Войти</button>
                        <button class="not-active-button" @click="openRegister()">Регистрация</button>
                    </form>

                    <form @submit.prevent="createUser" v-if="register">
                        <h3 class="title-login-or-register">Регистрация <img src="../assets/img/cross.png" alt=""
                                @click="closeLoginOrRegister()"></h3>
                        <div class="input-shell">
                            <input type="text" class="input" placeholder=" " v-model="phoneNumber">
                            <label for="phone">Номер телефона</label>
                            <span v-if="phoneError" class="error-message">Неверный формат номера телефона. Пример:
                                +7-999-555-9999</span>
                        </div>
                        <div class="input-shell">
                            <input type="password" class="input" placeholder=" " v-model="password">
                            <label for="phone">Пароль</label>
                        </div>

                        <div class="input-shell">
                            <input type="password" class="input" placeholder=" " v-model="confirmPassword">
                            <label for="phone">Подтверждение пароля</label>
                        </div>
                        <button type="submit">Зарегистрироваться</button>
                        <button class="not-active-button" @click="openLogin()">Авторизация</button>
                    </form>
            </div>
        </div>
        <div class="blackout" v-if="productModalOpen">
            <div class="modal-window-product modal-window" @click.stop>
                <img :src="product.image" alt="Product Image">
                <div class="info_product">
                    <span>
                        <h3 class="title-login-or-register">{{ product.name }} 
                            <img src="../assets/img/cross.png" alt="" @click="closeProductModal" class="d-n">
                        </h3>
                        <p class="menu-structure">{{ product.structure }}</p>
                        <p><span> {{ product.price }}₽</span></p>
                        <p class="menu-structure"> {{ product.weight }}г</p>
                    </span>
                    <div class="modal-window-product-footer">
                            <button @click="addToBasket(product._id)">В корзину</button>
                            <img class="d-n-phone" src="../assets/img/cross.png" alt="" @click="closeProductModal" width="70px">
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="meet">
                <div class="logo">
                    <img src="../assets/img/logo2.png" alt="">
                </div>
                <div class="buttons">
                    <button ><img src="../assets/img/location.png" alt="" width="29px">Шадринск</button>
                    <button @click="openLoginOrRegister()">Войти</button>
                </div>
            </div>
        </div>
        <div class="menu">
            <div class="container">
                <ul class="menu-list">
                    <li class="menu-li" v-for="category in categories" :key="category"
                        @click="scrollToSection(category)">{{ category }}</li>
                </ul>
                <img src="../assets/img/basket.png" alt="" class="basket  d-n" @click="goBasket">
            </div>
        </div>
        <img src="../assets/img/basket.png" alt="" class="basket-phone" @click="goBasket">
        <div class="container container-menu">
            <h3>Часто заказывают</h3>
            <div class="raiting">
                <div class="card-raiting" v-for="product in productsPurchaseCounter" @click="openProductModal(product)">
                    <img :src="product.image" alt="" width="80">
                    <div class="raiting-div">
                        <h4 class="raiting-name">{{ product.name }}</h4>
                        <p class="raiting-price">{{ product.price }}₽</p>
                    </div>
                </div>
            </div>
            <div v-for="category in categories">
                <h2 :id="category">{{ category }}</h2>
                <div class="menu-assortiment">
                    <div 
                        class="menu-card" 
                        v-for="product in productsByCategory[category]" :key="product.id" 
                        @click="openProductModal(product)" :class="{'out-of-stock': product.count == 0}">
                        
                        <img :src="product.image" alt="Product Image">
                        <div class="product-info">
                            <span>
                                <h4 class="product-name">{{ product.name }}</h4>
                                <p class="menu-structure">{{ product.structure }}</p>
                            </span>
                            <button @click.stop
                                class="product-button phone-product-button" 
                                @click="addToBasket(product._id)"
                                :disabled="product.count == 0">
                                {{ product.price }}₽
                                
                            </button>
                        </div>
                        <div class="product-footer">
                            <div class="price-weight d-n">
                                <span class="product-price d-n">{{ product.price }}₽</span>
                                <span class="product-weight d-n">{{ product.weight }}г </span>
                            </div>
                            <button  @click.stop
                                class="product-button d-n" 
                                @click="addToBasket(product._id)" 
                                :disabled="product.count === 0">
                                <span v-if="product.count === 0">
                                    Закончились
                                </span>
                                <span v-else>
                                    В корзину
                                </span>
                            </button>
                        </div>
                    </div>
</div>
            </div>
            <div class="logo logo-footer d-n">
                <img src="../assets/img/logo2.png" alt="">
            </div>
        </div>

    </main>
</template>


<style>



</style>