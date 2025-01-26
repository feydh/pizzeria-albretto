<script>
  import axios from "axios";
  import '../../css/admin.css';
  import '../../js/input.js';
  
  export default {
    data() {
      return {
        products: [],
        orders: [], 
        productsSection: true,
        ordersSection: false,
        isModalOpen: false, 
        newProduct: {
          name: "",
          price: null,
          category: "",
          weight: null,
          structure: "",
          purchaseCounter: null,
          time: null,
          count: null,
          image: "",
        },
        isEditing: false, 
        productToDelete: null, 
        isDeleteModalOpen: false, 
      };
    },
  
    methods: {
      async loadProducts() {
        try {
          const response = await axios.get('/products');
          this.products = response.data;
        } catch (error) {
          console.error("Ошибка при загрузке товаров");
        }
      },
      async loadOrders() {
        try {
          const response = await axios.get('/orders');
          this.orders = response.data.orders; 
        } catch (error) {
          console.error("Ошибка при загрузке заказов");
        }
      },
      productsSectionAdd() {
        this.productsSection = true;
        this.ordersSection = false;
      },
      ordersSectionAdd() {
        this.productsSection = false;
        this.ordersSection = true;
      },
      openModal(product = null) {
        this.isModalOpen = true;
        if (product) {
          this.isEditing = true;
          this.newProduct = { ...product }; 
        } else {
          this.isEditing = false;
          this.newProduct = {
            name: "",
            price: null,
            category: "",
            weight: null,
            structure: "",
            raiting: null,
            time: null,
            count: null,
            image: "",
          };
        }
      },
      closeModal() {
        this.isModalOpen = false;
        this.newProduct = {
          name: "",
          price: null,
          category: "",
          weight: null,
          structure: "",
          purchaseCounter: null,
          time: null,
          count: null,
          image: "",
        };
        this.isEditing = false;
      },
      async addOrUpdateProduct() {
        try {
          if (this.isEditing) {
            const response = await axios.put(`/product/${this.newProduct._id}`, this.newProduct);
            if (response.status === 200) {
              this.closeModal(); 
            }
          } else {
            const response = await axios.post('/product', this.newProduct);
            if (response.status === 201) {
              this.closeModal(); 
            }
          }
          this.loadProducts();
        } catch (error) {
          console.error("Ошибка при добавлении или изменении товара")
        }
      },
      openDeleteModal(productId) {
        this.isDeleteModalOpen = true;
        this.productToDelete = productId;
      },
      closeDeleteModal() {
        this.isDeleteModalOpen = false;
        this.productToDelete = null;
      },

      goIndex() {
        $('body').removeClass('lock');
        this.$router.push({ name: 'index' });
      },
      logout() {
        localStorage.removeItem('user');
        this.$router.push({ name: 'index' });
      },
  
    async deleteProduct() {
      try {
        const response = await axios.delete(`/product/${this.productToDelete}`);
        if (response.status === 200) {
          this.loadProducts();
          this.closeDeleteModal(); 
        }
      } catch (error) {
        console.error("Ошибка при удалении товара:");
      }
    },
    },
  
    mounted() {
      this.loadProducts();
      this.loadOrders();
    },
  };
  </script>
<template>
    <div class="container">
      <div class="profile-title">
        <h1>
          <img src="../../assets/img/cross.png" alt="" @click="goIndex">
          Административная панель
        </h1>
        <div class="profile-title-button">
          <button @click="logout"><span class="d-n">Выйти</span><img src="../../assets/img/icons8-кнопка-выхода-30.png" alt="" class="exit-button"></button>
        </div>
      </div>
  
      <div class="profile-title-button">
        <button @click="productsSectionAdd()">Товары</button>
        <button @click="ordersSectionAdd()">Заказы</button>
      </div>
  
      <div class="profile-admin-cards" v-if="productsSection">
      <button @click="openModal()">Добавить новый продукт</button>
        <div  class="profile-admin-card" v-for="product in products" >
          
          <img :src="product.image" alt="" />
          <div class="profile-admin-card-info">
            <h4>{{ product.name }}</h4>
            <span>
              <button @click="openModal(product)">Изменить</button>
              <button @click="openDeleteModal(product._id)">Удалить</button>
            </span>
            <p>{{ product.category }} / {{ product.price }}₽</p>
            <p>{{ product.weight }}г</p>
            <p>{{ product.structure }}</p>
            <p>Количество заказов: {{ product.purchaseCounter}}</p>
            <p>Время приготовления: {{ product.time }} мин</p>
            <p>Количество на складе: {{ product.count }}</p>
          </div>
        </div>
      </div>
      <div class="blackout" v-if="isDeleteModalOpen">
          <div class="modal-window modal-window-delete">
            <h3>Точно хотите удалить товар?</h3>
            <span>
              <button @click="deleteProduct()">Да</button>
              <button @click="closeDeleteModal()">Нет</button>
            </span>
          </div>
        </div>
        <div class="blackout" v-if="isModalOpen">
          <div class="modal-window modal-window-admin">
            <div class="admin-product-header">
              <img v-if="newProduct.image && newProduct.image.startsWith('http')" :src="newProduct.image">
              <img v-else src="../../assets/img/no-image.png" >
              <input type="number" v-model="newProduct.purchaseCounter" placeholder="Количество заказов" min="0" max="5" step="0.1" class="dont-free"  readonly/>
              <input type="text" v-model="newProduct.category" placeholder="Категория" />
              <input type="number" v-model="newProduct.count" placeholder="Количество товара" />
            </div>
           <div class="admin-product-footer">
            <input type="text" v-model="newProduct.name" placeholder="Название товара" />
            <input type="text" v-model="newProduct.structure" placeholder="Состав товара" />
            <input type="number" v-model="newProduct.price" placeholder="Цена" />
            <input type="number" v-model="newProduct.weight" placeholder="Граммы" />
            <input type="number" v-model="newProduct.time" placeholder="Время приготовления" />
            <input type="text" v-model="newProduct.image" placeholder="URL изображения" />
            <button @click="addOrUpdateProduct()">Сохранить</button>
            <button @click="closeModal()">Закрыть</button>
           </div>
        </div>
      </div>
  <div v-if="ordersSection" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px;">
    <div class="card-orders card-orders-admin" v-for="order in orders">
      <div class="order-date">
        <h4>{{ new Date(order.createdAt).toLocaleDateString() }}</h4>
      </div>
      <div class="order-address">
        <p>{{ order.address }}</p>
      </div>
      <div class="order-items">
        <div v-for="item in order.items" class="order-item">
          <p>{{ item.productId.name}} ({{ item.quantity }}шт),</p>
        </div>
      </div>
      <div class="order-total">
        <p>Общая стоимость: <span>{{ order.totalAmount }}₽</span></p>
      </div>
  </div>
    </div>
    </div>
  </template>
  
