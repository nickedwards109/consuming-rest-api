// Set a variable for the server endpoint and also a variable for a DOM node
// that will contain a collection of nodes for displaying customer info.
let url = "https://www.ecommerceapiexample.com/api/v1/customers";
let collectionContainer = $("#collection-container");

// Query the server for data.
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

// If the server responded with an error, display the error in the console.
function errorHandler(response) {
  console.log("There was an error! Here is the response:");
  console.log(response);
}

// If the server responded with success, display each customer's info in the DOM.
function successHandler(response) {
  console.log("The server returned a response with no errors.");
  response.forEach(customer => {
    var customerElement = `
      <div class="customer">
        <span>First Name:  ${customer.first_name}<span><br/>
        <span>Last Name:  ${customer.last_name}</span><br/>
	<span>ID:  ${customer.id}</span><br/>
      </div>`;
    collectionContainer.append(customerElement);
  })
}
