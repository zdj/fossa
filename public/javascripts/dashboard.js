$(document).ready(function () {

    $('.nav li').click(function(){
        $('.nav li').removeClass('active');
        $(this).addClass('active');
        console.log(this);
    })
});