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
            success(data, textStatus, jqXHR);
    }).fail(function (jqXHR, textStatus, errorThrown) {
            failed(jqXHR, textStatus, errorThrown);
    });
}

function success(data, textStatus, jqXHR) {

    alert("Result was: " + jqXHR.responseText + "\nStatus Code: " + jqXHR.status);
}

function failed(jqXHR, textStatus, errorThrown) {

    alert("Result was: " + jqXHR.responseText + "\nStatus Code: " + jqXHR.status);

//    var status = jqXHR.status;
//
//    if (data instanceof Object) {
//        var result = JSON.stringify(data)
//    } else {
//        result = data;
//    }
//
//    if (textStatus == "nocontent") {
//        result = ""
//    } else if(textStatus == "error") {
//        status = jqXHR
//    }
//
//    alert("Result was: " + result + "\nStatus Code: " + status);
}