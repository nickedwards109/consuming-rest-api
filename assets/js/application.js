// Get the body tag so that templates can be appended to it.
let body = $("body");

// Generate a template for a loading animation that can be reused anywhere
let loadingAnimation = `
      <div id="animation-container">
        <span>Loading!</span>
        <div id="loading-animation"></div>
      </div>
    `;

// Generate a template for a container for a collection of many templates.
// For example, this could contain many templates that each represent a customer.
var collectionContainer = $(`<div id="collection-container"></div>`);

// Get the current path. This will be needed later for routing purposes.
var path = window.location;

// Add /customers to the current path, since the first page displayed is
// the customers page.
window.location = path + '#customers';

// These are the set of possible URLs that a user might enter into the
// browser bar or that the user might be redirected to (still without a
// new page load)
let routes = [
  { pathMatcher: /#customers$/, name: "customersIndex" },
  { pathMatcher: /#customers\/[0-9]+/, name: "customerShow" }
];

// Match the current path with a route and call the appropriate action
match(path, routes);

// Define the function that matches a route with a path and calls an action
function match(path, routes) {
  routes.forEach(route => {
  var isMatch = route.pathMatcher.test(path);
      // If the user is navigating to the customers index page:
      //   - Remove all content from the page
      //   - Display the loading animation
      //   - Call the action for getting and displaying all the customers' data
      if (isMatch === true && route.name === "customersIndex") {
      $("body").empty();
      $("body").append(loadingAnimation);
      getCustomers();
    }
  });
}

// When the URL changes, match the new URL with a route and call the
// appropriate action
$(window).on('popstate', (event) => {
  match(path, routes);
} );

function getCustomers() {
  $.ajax({
    url: "https://www.ecommerceapiexample.com/api/v1/customers",
    type: "GET",
    error: function (response) {
      errorHandler(response);
    },
    success: function (response) {
      allCustomersSuccessHandler(response);
    }
  });
}

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
  if ($(".customer-data-sheet")) {$(".customer-data-sheet").remove();}
    body.append(collectionContainer); 
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
//   - Update the URL to the show page for the current customer
//   - Develop a markup template for each invoice
//   - Remove the loading animation
//   - Insert the invoice templates into the DOM
function singleCustomerSuccessHandler(customer, response) {
    window.location = window.location + `/${customer.id}`;
    match(path, routes);
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
  $("#collection-container").remove();
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
