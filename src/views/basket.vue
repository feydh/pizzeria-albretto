<script>
import '../css/basket.css';
import axios from "axios";


export default {
    data() {
        return {
            user: {},
            isUser: false,
            basketItems: [],
            totalAmount: 0,
            deliveryTime: '', 
            showAddressModal: false,
            streetName: '',
            city: 'Шадринск',
            houseNumber: '',
            deliveryAddress: '',
            showConfirmationModal: false, 
            orderAmount: 0,
            productsPurchaseCounter: [],
        };
    },
    methods: {
        async loadBasket() {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    this.user = JSON.parse(savedUser);
                    this.isUser = true;

                    const response = await axios.get(`/basket/${this.user.id}`);

                    this.basketItems = response.data.products;
                    this.basketItems = this.basketItems.filter(item => item.productId.count > 0);

                    this.calculateTotalAmount();
                    this.calculateDeliveryTime();
                }
            } catch (error) {
                console.error('У вас ещё нет корзины');
            }
        },
        calculateTotalAmount() {
            this.totalAmount = this.basketItems.reduce((total, item) => {
                return total + (item.productId.price * item.quantity);
            }, 0);
        },
        async increaseQuantity(item) {
            const availableStock = item.productId.count;
            if (item.quantity >= availableStock) {
                item.quantity = availableStock; 
            } else {
                item.quantity += 1; 
            }
            await this.updateQuantity(item.productId._id, item.quantity);
        },
        decreaseQuantity(item) {
            if (item.quantity > 1) {
                this.updateQuantity(item.productId._id, item.quantity - 1);
            } else {
                this.removeItem(item.productId._id);
            }
        },
        async updateQuantity(productId, quantity) {
            await axios.put(`/basket/${this.user.id}/update`, { productId, quantity });
                
            const item = this.basketItems.find(item => item.productId._id === productId);
            if (item) {
                item.quantity = quantity;
                this.calculateTotalAmount();
                this.calculateDeliveryTime();
            }
        },
        async removeItem(productId) {
            await axios.delete(`/basket/${this.user.id}/remove`, { data: { productId } });
            this.basketItems = this.basketItems.filter(item => item.productId._id !== productId);
            this.calculateTotalAmount();
            this.calculateDeliveryTime();
        },
        calculateDeliveryTime() {
            const totalCookingTime = this.basketItems.reduce((total, item) => {
                return total + (item.productId.time * item.quantity); 
            }, 0);
            const now = new Date();

            const cookingEndTime = new Date(now.getTime() + totalCookingTime * 60000); 

            const deliveryTime = new Date(cookingEndTime.getTime() + 15 * 60000);

            const hours = deliveryTime.getHours().toString().padStart(2, '0');
            const minutes = deliveryTime.getMinutes().toString().padStart(2, '0');
            this.deliveryTime = `${hours}:${minutes}`; 
        },
        openAddressModal() {
            this.showAddressModal = true;
        },
        async getCoordinates(address) {
            const apiKey = 'c9bdd360-653d-4c48-84f4-a6117f4ca0fa'; // Замените на ваш ключ
            const response = await axios.get(`https://geocode-maps.yandex.ru/1.x/?geocode=${encodeURIComponent(address)}&apikey=${apiKey}&format=json`);
            console.log(response.data)
            return response.data;
        },
        async checkAddress() {
            let formattedStreetName = this.streetName.trim();
            if (!formattedStreetName.toLowerCase().startsWith("улица ")) {
                formattedStreetName = `улица ${formattedStreetName}`;
            }

            const fullAddress = `${formattedStreetName}, ${this.houseNumber}, ${this.city}`;
            const response = await this.getCoordinates(fullAddress);

            const featureMembers = response.response.GeoObjectCollection.featureMember;
            
            if (featureMembers && featureMembers.length > 0) {
                for (const feature of featureMembers) {
                    const addressComponents = feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
                    let streetExists = false
                    let houseExists = false
                    let cityExists = false
                    for (const component of addressComponents) {
                        if (component.kind === "street" && component.name === formattedStreetName) {
                            streetExists = true
                        }
                        if (component.kind === "house" && component.name === this.houseNumber) {
                            houseExists = true
                        }
                        if (component.kind === "locality" && component.name === this.city) {
                            cityExists = true
                        }
                    }

                    if (streetExists && houseExists && cityExists) {
                        return true; 
                    }
                }
            }
            return false; 
        },
        async submitAddress() {
            if (!this.city || !this.streetName || !this.houseNumber) {
                alert('Пожалуйста, заполните все поля!');
                return;
            }

            const isAddressValid = await this.checkAddress();
            if (isAddressValid) {
                this.deliveryAddress = `${this.streetName}, ${this.houseNumber}, ${this.city}`;

                await this.placeOrder(); 
                this.showAddressModal = false;  
                this.showConfirmationModal = true; 
            } else {
                alert('Несуществующий адрес. Пожалуйста, проверьте введенные данные.');
            }
        },
        async placeOrder() {
        const orderDetails = {
            userId: this.user.id,
            items: this.basketItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
            })),
            totalAmount: this.totalAmount,
            address: `${this.streetName}, ${this.houseNumber}, ${this.city}`,
        };
        this.orderAmount = this.totalAmount;

        const response = await axios.post('/orders', orderDetails);

        if (response.status === 201) {
            this.basketItems = [];
            this.totalAmount = 0;  
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
            this.loadBasket()
        },
        async productPurchaseCounter() {
            let response = await axios.get('/products/purchaseCounter');
            this.productsPurchaseCounter = response.data;
        },
        goIndex() {
            this.$router.push({ name: 'index' });
        },
        
    },
    mounted() {
        this.loadBasket()
        this.productPurchaseCounter()
    }
}
</script>

<template>
    <main>
        
        <div class="container">
            <h1><img src="../assets/img/cross.png" alt="" @click="goIndex">Корзина</h1>
        </div>
        <div v-if="basketItems.length === 0" class="container">
                <p>Ваша корзина пуста!</p>
                <button @click="goIndex">Заполнить её</button>
        </div>
        <div v-else class="container">
            <div class="basket-container">
                <div class="card-container">
                    <div class="card" v-for="item in basketItems" :key="item.productId._id">
                        <img :src="item.productId.image" class="card-img">
                        <div class="card-info">
                            <div class="product-info">
                                <h4 class="product-name-basket">{{ item.productId.name }}</h4>
                                <p>{{ item.productId.weight }} г</p>
                            </div>
                            <div class="card-interaction">
                                <div class="card-quantity">
                                    <button @click="decreaseQuantity(item)">-</button>
                                    <span>{{ item.quantity }}</span>
                                    <button @click="increaseQuantity(item)">+</button>
                                </div>
                                <p>{{ item.productId.price * item.quantity }}₽</p>
                                <img src="../assets/img/garbage.png" alt="" @click="removeItem(item.productId._id)">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pay">
                    <div class="div-info-pay">
                        <div>
                            <span>Сумма заказа:</span>
                            <p class="order-amount">{{ totalAmount }}₽</p>
                        </div>
                        <p class="delivery-time">Время доставки: <span>{{ deliveryTime }}</span></p>
                    </div>
                    <button @click="openAddressModal">Оформить заказ</button>
                </div>
            </div>
        </div>
                <div class="container">
                <div v-if="showAddressModal" class="blackout">
                    <div class="modal-window-basket">
                        <h3 class="title-login-or-register">Введите адрес доставки <img src="../assets/img/cross.png"
                                alt="" @click="showAddressModal = false"></h3>

                        <div class="input-shell">
                            <input type="text" class="input" v-model="city" placeholder=" " readonly >
                            <label for="phone">Город</label>
                        </div>
                        <div class="input-shell">
                            <input type="text" class="input" v-model="streetName" placeholder=" ">
                            <label for="phone">Название улицы</label>
                        </div>
                        <div class="input-shell">
                            <input type="text" class="input" v-model="houseNumber" placeholder=" ">
                            <label for="phone">Номер дома</label>
                        </div>
                        <button @click="submitAddress">Подтвердить</button>
                    </div>

                </div>
                <div v-if="showConfirmationModal" class="blackout">
                    <div class="modal-window-basket">
                    <h3 class="title-login-or-register">Заказ принят! 
                        
                    </h3>

                    <p><strong>Сумма к оплате:</strong> {{ orderAmount }}₽</p>
                    <p><strong>Адрес доставки:</strong> {{ deliveryAddress }}</p>
                    <p><strong>Время доставки:</strong> {{ deliveryTime }}</p>
                    <button @click="goIndex">Вернуться на главную страницу</button>
                    </div>
                </div>
            </div>
            <div class="container">
            <h3 class="recommendations-title">Рекомендуем добавить к заказу</h3>
            <div class="recommendations">
                <div class="card-recommendations" v-for="product in productsPurchaseCounter">
                    <img :src="product.image" alt="" width="80">
                    <div class="recommendations-div">
                        <h4 class="recommendations-name">{{ product.name }}</h4>
                        <button class="recommendations-price" @click="addToBasket(product._id)">{{ product.price
                            }}₽</button>
                    </div>
                </div>
            </div>
            <div class="span-phone"></div>

            <div class="logo logo-footer d-n">
                <img src="../assets/img/logo2.png" alt="">
            </div>
        </div>
    </main>
</template>

<style>

</style>
