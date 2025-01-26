$(document).ready(function() {
$('.footer-title').click(function(event){
    if($('.footer-info').hasClass('one')){
        $('.footer-title').not($(this)).removeClass('.active');
        $('.footer-menu').not($(this).next()).slideUp(300)
    }
    $(this).toggleClass('active').next().slideToggle(300)
})
});