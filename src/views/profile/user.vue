<script>
import '../../css/user.css';
import '../../js/input.js';
import axios from "axios";

export default {
    data() {
        return {
            user: {
                _id: '', 
                username: '',
                phoneNumber: '',
                birthday: '',
                email: '',
            },
            orders: [],
        };
    },
    
    methods: {
        async loadUserData() {
            const userId = this.$route.params.userId;
            try {
                const userResponse = await axios.get(`/user/${userId}`);
                this.user = userResponse.data.user;
                if (this.user.birthday) {
                    this.user.birthday = this.formatDate(this.user.birthday);
                }
                
                const ordersResponse = await axios.get(`/user/${userId}/orders`);
                this.orders = ordersResponse.data.orders;

                this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя или заказов:', error);
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; 
        },
        async updateUserProfile() {
            const userId = this.user._id;
            await axios.put(`/user/${userId}`, this.user);
        },
        async deleteUser() {
            const userId = this.user._id;
            try {
                const response = await axios.delete(`/user/${userId}`);
                
                if (response.status === 200) {
                    localStorage.removeItem('user'); 
                    this.$router.push({ name: 'index' });  
                }
            } catch (error) {
                console.error('Ошибка при удалении аккаунта:', error);
            }
        },
        goIndex() {
            $('body').removeClass('lock');
            this.$router.push({ name: 'index' }); 
        },
        goBasket() {
            this.$router.push({ name: 'basket' });
        },
        logout() {
            localStorage.removeItem('user'); 
            this.$router.push({ name: 'index' }); 
        },
    },
    mounted() {
        this.loadUserData()
    }
}
</script>

<template>
    <main>
        <div class="container">
            <div class="profile-title">
                <h1>
                    <img src="../../assets/img/cross.png" alt="" @click="goIndex"> <!-- Обработчик клика на крестик -->
                    Личный кабинет
                </h1>
                <div class="profile-title-button">
                    <img src="../../assets/img/basket.png" alt="" class="profile-basket" @click="goBasket">
                    <button @click="logout"><span class="d-n">Выйти</span><img src="../../assets/img/icons8-кнопка-выхода-30.png" alt="" class="exit-button"></button>
                </div>
            </div>
            <img src="../../assets/img/basket.png" alt="" class="basket-phone" @click="goBasket">
            <div class="profile-information">
                <div class="profile-inputs">
                    <div class="input-shell">
                        <input type="text" class="input" placeholder=" " v-model="user.username">
                        <label>Имя</label>
                    </div>
                    <div class="input-shell">
                        <input type="text" class="input" placeholder=" " v-model="user.phoneNumber">
                        <label>Номер телефона</label>
                    </div>

                    
                    <div class="input-shell">
                        <input type="date" class="input" placeholder=" " v-model="user.birthday" :disabled="user.birthday">
                        <label>День рождения</label>
                    </div>
                    <div class="input-shell">
                        <input type="email" class="input" placeholder=" " v-model="user.email">
                        <label>E-mail</label>
                    </div>
                    <button @click="updateUserProfile">Сохранить</button>
                </div>
                <div class="profile_orders">
                    <div class="hr"></div>
                    <h4 class="profile-orders-title">Ваши заказы</h4>
                    <div v-if="orders.length > 0" class="orders">
                        <div class="card-orders" v-for="order in orders">
                            <div class="order-date">
                                <h4>{{ new Date(order.createdAt).toLocaleDateString() }}</h4>
                            </div>
                            <div class="order-address">
                                <p>{{ order.address }}</p>
                            </div>
                            <div class="order-items">
                                <div v-for="item in order.items"  class="order-item">
                                    <img :src="item.productId.image" alt="Product Image" class="order-item-image" width="40px"/>
                                </div>
                            </div>
                            <div class="order-total">
                                <p>Общая стоимость: <span>{{ order.totalAmount }}₽ </span></p>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <p>У вас нет заказов.</p>
                    </div>
                </div>
                <div class="profile-footer">
                    <div class="hr"></div>
                    <h4 class="delet-account-title">Удаление аккаунта</h4>
                    <p>Процесс удаления необратим, и восстановить
                        аккаунт будет невозможно </p>
                    <button @click="deleteUser">Удалить аккаунт</button>
                </div>
            </div>
            <div class="logo logo-footer d-n">
                <img src="../../assets/img/logo2.png" alt="">
            </div>
        </div>
    </main>
</template>

<style>
</style>
