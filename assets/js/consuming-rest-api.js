let url = "https://www.ecommerceapiexample.com/api/v1/customers";

$.ajax({
  url: url,
  type: "GET",
  error: function (response) {
    errorHandler(response);
  },
  success: function (response) {
    successHandler(response);
  }
});

function errorHandler(response) {
  console.log("There was an error! Here is the response:");
  console.log(response);
}

function successHandler(response) {
  console.log("The server returned a response with no errors.");
  console.log(response);
}
