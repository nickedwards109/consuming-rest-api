// Set a variable for the server endpoint and also a variable for a DOM node
// that will contain a collection of nodes for displaying customer info.
var url = "https://www.ecommerceapiexample.com/api/v1/customers";
let body = $("body");
let collectionContainer = $("#collection-container");

// Query the server for data.
$.ajax({
  url: url,
  type: "GET",
  error: function (response) {
    errorHandler(response);
  },
  success: function (response) {
    allCustomersSuccessHandler(response);
  }
});

// If the server responded with an error, display the error in the console.
function errorHandler(response) {
  console.log("There was an error! Here is the response:");
  console.log(response);
}

// If the server responded with success, remove the loading animation from
// the DOM. Display each customer's info in the DOM.
function allCustomersSuccessHandler(response) {
  console.log("The server returned a response with no errors.");
  $("#animation-container").remove();
  response.forEach(customer => {
    var customerThumbnail = `
      <div class="customer thumbnail" data-id=${customer.id} data-first-name=${customer.first_name} data-last-name=${customer.last_name}>
        <span>First Name:  ${customer.first_name}<span><br/>
        <span>Last Name:  ${customer.last_name}</span><br/>
	<span>ID:  ${customer.id}</span><br/>
      </div>`;
    collectionContainer.append(customerThumbnail);
  })
}

// When the user clicks on a customer card:
//   - Remove the display of every other customer
//   - Show the loading animation
//   - Call the handler which queries the server for the customer's invoices
$(document).on("click", ".customer", function(event) {
  collectionContainer.remove();
  let loadingAnimation = `
        <div id="animation-container">
          <span>Loading!</span>
          <div id="loading-animation"></div>
        </div>
      `;
  body.append(loadingAnimation);
  var customer = {
    "firstName": this.getAttribute("data-first-name"),
    "lastName": this.getAttribute("data-last-name"),
    "id": this.getAttribute("data-id")
  };
  var url = `https://www.ecommerceapiexample.com/api/v1/customers/${customer.id}/invoices`;
  $.ajax({
    url: url,
    type: "GET",
    error: function(response) {
      errorHandler(response);
    },
    success: function(response) {
      singleCustomerSuccessHandler(customer, response);
    }
  });
})

//  This handler processes the response containing a customer's invoices.
//   - Develop a markup template for each invoice
//   - Remove the loading animation
//   - Insert the invoice templates into the DOM
function singleCustomerSuccessHandler(customer, response) {
  var invoiceTemplates = response.map(invoice => {
    var invoiceTemplate = `
	  <div class="invoice thumbnail">
            <span>Invoice ID: ${invoice.id}</span><br/>
            <span>Merchant ID: ${invoice.merchant_id}</span><br/>
            <span>Status: ${invoice.status}</span><br/>
          </div>
        `;
    return invoiceTemplate;
  });
  $("#animation-container").remove();
	console.log(invoiceTemplates);
  var customerDataSheetTemplate = `
    <div class="customer-data-sheet collection-container">
        <span>First Name:  ${customer.firstName}<span><br/>
        <span>Last Name:  ${customer.lastName}</span><br/>
        <span>ID:  ${customer.id}</span><br/>
    </div>
  `;
  body.append(customerDataSheetTemplate);
  var customerDataSheet = $(".customer-data-sheet");
  invoiceTemplates.forEach(invoiceTemplate => {
    customerDataSheet.append(invoiceTemplate);
  });
}
