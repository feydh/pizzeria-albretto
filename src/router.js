import { createRouter, createWebHistory } from 'vue-router'
// Компоненты страниц
import index from './views/index.vue';
import basket from './views/basket.vue';
import user from './views/profile/user.vue';
import admin from './views/profile/admin.vue';

export default createRouter({
    // История переходов сохраняется
    history: createWebHistory(),


    // Роуты и компоненты
    routes: [
        {
            path: '/',
            name: 'index',
            component: index,
        },
        {
            path: '/basket',
            name: 'basket',
            component: basket
        },
        {
            path: '/profile/user/:userId',
            name: 'user',
            component: user,
            beforeEnter: (to, from, next) => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                  next(); 
                } else {
                  next({ name: 'index' });
                }}
        },
        {
            path: '/profile/admin/',
            name: 'admin',
            component: admin, 
            beforeEnter: (to, from, next) => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.role === 'admin') {
                  next(); 
                } else {
                  next({ name: 'index' }); 
                }}
        },
    ],
    
});

