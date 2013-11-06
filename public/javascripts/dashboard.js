$(document).ready(function () {

    $("form[name|='http']").submit(function (event) {
        var $form = $(this);
        executeService(event,$form)
    });
});

function executeService(event, form) {

    event.preventDefault();

    var type = form.find("input[name='type']").val();
    var method = form.find("input[name='method']").val();
    var params = form.find("input[name='params']").val();
    var contentType = form.find("input[name='contentType']").val();

    var service = $.ajax({
        url: "/service",
        type: "GET",
        data: {
            type: type,
            method: method,
            params: params
        }
    }).done(function (data, textStatus, jqXHR) {
        handleResponse(jqXHR);
    }).fail(function (jqXHR) {
        handleResponse(jqXHR);
    });
}

function handleResponse(jqXHR) {
    alert("Result was: " + jqXHR.responseText + "\n\nStatus Code: " + jqXHR.status);
}
