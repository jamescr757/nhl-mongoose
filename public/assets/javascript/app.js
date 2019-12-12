$(document).ready(() => {

    $("#date-form").on("submit", event => {

        event.preventDefault();

        const userDate = $("#userDate").val().trim();

        if (!moment(userDate, "MM/DD/YYYY").isValid()) {
            console.log("invalid date");

            $("#user-message").text("Please enter a valid date");

        } else {
            console.log("valid date");
            const userDateFormatted = moment(userDate).add(1, 'days')

            if (moment(userDateFormatted).diff(moment(), "seconds") < 0) {
                const userDateMoment = moment(userDate).format("YYYYMMDD");

                $.ajax("/scrape/past-date/" + userDateMoment, {
                    type: "GET"
                })
                .then(() => {
                    // location.href = "/date/" + userDateMoment;
                    location.href = "/loading/" + userDateMoment;
                })
                .catch(error => {
                    $("#user-message").text("Please enter a valid date");

                    console.log("error with ajax get front-end")
                });

            } else $("#user-message").text("Please enter a valid date");
        }

    })




})