var socket = io.connect();
socket.on('connect', function () {
    // Capture the form inputs 
    $('#submit').on('click', function () {
        // Form validation
        function validateForm() {
            var isValid = true;
            $('.form-control').each(function () {
                if ($(this).val().trim() === '')
                    isValid = false;
            });

            $('.chosen-select').each(function () {
                if ($(this).val() === '')
                    isValid = false;
            });
            return isValid;
        }
        // If all required fields are filled
        if (validateForm() == true) {
            // Create an object for the user's data
            var userData = {
                name: $('#name').val().trim(),
                photo: $('#photo').val().trim(),
                q1: $('#q1').val(),
                q2: $('#q2').val(),
                q3: $('#q3').val(),
                q4: $('#q4').val(),
                q5: $('#q5').val(),
                q6: $('#q6').val(),
                q7: $('#q7').val(),
                q8: $('#q8').val(),
                q9: $('#q9').val(),
                q10: $('#q10').val(),
            };

            socket.emit('submitSurvey', userData, function(err) {
                if(err) {
                    alert(err);
                    window.location.href = '/';
                } else {
                    console.log('No error');
                }
            });

            socket.on('surveyResults', function(results) {
                console.log('results', results);
                $("#matchName").text(results.name);
                $('#matchImg').attr("src", results.photo);

                // Show the modal with the best match 
                $("#resultsModal").modal('toggle');
            });
        } else {
            alert("Please fill out all fields before submitting!");
        }

        return false;
    });
});