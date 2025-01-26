<script>

// Компоненты
import AppHeader from './components/AppHeader.vue';
import { RouterView } from 'vue-router';
import AppFooter from './components/AppFooter.vue';

// Главная страница
export default {
	components: {
		AppHeader,
		RouterView,
		AppFooter,
	}
};


</script>

<template>
	<div class="app">
		<!-- Шапка -->
		<app-header></app-header>

		<!-- Меняющаяся часть -->
		<router-view></router-view>

		<!-- Шапка -->
		<app-footer></app-footer>
	</div>

	
</template>

<style>
/*Обнуление*/
* {
	padding: 0;
	margin: 0;
	border: 0;
}

*,
*:before,
*:after {
	-moz-box-sizing: border-box;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
}

:focus,
:active {
	outline: none;
}

a:focus,
a:active {
	outline: none;
}

nav,
footer,
header,
aside {
	display: block;
}



html,
body {
	height: 100%;
	width: 100%;
	font-size: 100%;
	line-height: 1;
	font-size: 14px;
	-ms-text-size-adjust: 100%;
	-moz-text-size-adjust: 100%;
	-webkit-text-size-adjust: 100%;
	/* overflow-y: scroll; */
	scroll-behavior: smooth;
}

input,
button,
textarea {
	font-family: inherit;
}

input::-ms-clear {
	display: none;
}

button {
	cursor: pointer;
}

button::-moz-focus-inner {
	padding: 0;
	border: 0;
}

a,
a:visited {
	text-decoration: none;
}

a:hover {
	text-decoration: none;

}

ul li {
	list-style: none;
}

img {
	vertical-align: top;
}


h1,
h2,
h3,
h4,
h5,
h6 {
	font-size: inherit;
	font-weight: 400;
	font-family: 'junegull';
}


/*--------------------*/
.container {
    max-width: 1270px;
    margin: 0px auto;
    padding: 0px 18px;
}

.bigred {
	font-size: 20px;
	color: red;
}
@media (max-width:767px) {
.d-n {
		display: none;
	}

}

p {
	font-size: 16px;
	margin: 0;
	padding: 0;
}

@font-face {
   font-family: junegull; 
   src: url(../assets/font/junegull.otf); 
   }
</style>
