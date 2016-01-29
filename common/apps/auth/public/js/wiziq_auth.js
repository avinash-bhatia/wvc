$('#submit').click(function() {
           // alert('clicked')
            var formData = {
                    "UserName"     : $('#userName').val(),
                    "Password"     : $('#password').val(),
                    "ResponseType" : "json"
                };

            console.log($('#userName').val()+" "+formData.UserName);
            console.log($('#password').val()+" "+formData.Password);
            console.log(" "+formData.ResponseType);

            $.ajax({
                url: "https://api.wiziq.com/glmobileapp/restservice?method=authenticate",
                type: "POST",
                dataType: "json",
                data: JSON.stringify(formData),
                contentType: "application/json",
                cache: false,
                complete: function() {
                  //called when complete
                  console.log('process complete');
                },

                success: function(data) {
                  console.log(data);
                  alert('Successfully fetched data from wiziq_database');
                },

                error: function() {
                  console.log('process error');
                },
            });
});



