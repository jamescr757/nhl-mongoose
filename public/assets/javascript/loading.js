$(document).ready(() => {

    let userDate = $("#loading-date").text();
    const userDateFormatted = moment(userDate, "dddd, MMMM Do, YYYY").format("YYYYMMDD");

    function checkIfDataReady() {
        $.ajax("/check/" + userDateFormatted, {
            type: "GET"
        })
        .done(response => {
            sendToDatePage();
        })
        .fail(error => {
            console.log("data not ready yet");
        })
    }

    function sendToDatePage() {
        location.href = "/date/" + userDateFormatted; 
    }

    checkIfDataReady();

    setTimeout(sendToDatePage, 3 * 1000);

})