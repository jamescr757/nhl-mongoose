$(document).ready(() => {

    let userDate = $("#loading-date").text();
    const userDateFormatted = moment(userDate, "dddd, MMMM Do, YYYY").format("YYYYMMDD");

    function sendToDatePage() {
        location.href = "/date/" + userDateFormatted; 
    }

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

    checkIfDataReady();

    setTimeout(sendToDatePage, 2.5 * 1000);

})