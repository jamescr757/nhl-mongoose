$(document).ready(() => {

    function userMessageInvalidDate() {
        $("#user-message").text("Please enter a valid date");
    }

    $("#date-form").on("submit", event => {

        event.preventDefault();

        const userDate = $("#userDate").val().trim();

        if (!moment(userDate, "MM/DD/YYYY").isValid()) userMessageInvalidDate();

        else {

            const userDateFormatted = moment(userDate).add(1, 'days')

            if (moment(userDateFormatted).diff(moment(), "seconds") < 0) {
                // user entered a date in the past
                const userDateMoment = moment(userDate).format("YYYYMMDD");

                $.ajax("/scrape/past-date/" + userDateMoment, {
                    type: "GET"
                })
                .then(() => {
                    location.href = "/loading/" + userDateMoment;
                })
                .catch(() => {
                    userMessageInvalidDate();
                });

            } else userMessageInvalidDate();
        }

    });

});