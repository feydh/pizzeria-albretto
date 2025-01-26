<script>
import '../css/footer.css';
import '../js/animation-footer.js';
</script>

<template>
    <footer class="footer" :class="{'d-n': $route.name == 'basket'}">
        <div class="container">
            <div class="footer-container">
                <div class="footer-info one">
                    <div class="block-item">
                        <div class="footer-title">О нас</div>
                        <nav class="footer-menu">
                            <ul class="footer-list">
                                <li><a href="" class="footer-link">О нас</a></li>
                                <li><a href="" class="footer-link">Акции</a></li>
                                <li><a href="" class="footer-link">Контакты</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div class="block-item">
                        <div class="footer-title">Меню</div>
                        <nav class="footer-menu">
                            <ul class="footer-list">
                                <li><a href="" class="footer-link">Пицца</a></li>
                                <li><a href="" class="footer-link">Закуски</a></li>
                                <li><a href="" class="footer-link">Салаты</a></li>
                                <li><a href="" class="footer-link">Супы</a></li>
                                <li><a href="" class="footer-link">Десерты</a></li>
                                <li><a href="" class="footer-link">Напитки</a></li>
                                <li><a href="" class="footer-link">Комбо</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div class="footer-order">
                    Заказ по номеру <span>+7 (999) 888-77-66</span>
                </div>
            </div>
            <div class="footer-rights">
                © 2024 Все права защищены
            </div>
        </div>
    </footer>

</template>
