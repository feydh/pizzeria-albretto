document.addEventListener('DOMContentLoaded', function () {
    let inputs = document.querySelectorAll('.input'); // Получаем все элементы с классом 'input'

    inputs.forEach(input => {
        let label = input.nextElementSibling;

        // Проверяем, что label существует
        if (label && label.tagName.toLowerCase() === 'label') {
            
            // Проверяем начальное состояние
            if (input.value !== '') {
                label.style.color = '#6F6F6F'; // Цвет метки, если поле не пустое при загрузке
            }

            // Изменение цвета при фокусе
            input.addEventListener('focus', function () {
                label.style.color = '#FF9957';
            });

            // Изменение цвета при потере фокуса
            input.addEventListener('blur', function () {
                if (input.value !== '') {
                    label.style.color = '#6F6F6F'; // Цвет метки, если поле не пустое
                } else {
                    label.style.color = '#6F6F6F'; // Цвет метки, если поле пустое
                }
            });
        }
    });
});