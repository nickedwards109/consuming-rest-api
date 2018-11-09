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

// Define a function for adding the #customers fragment to the URL if it isn't there
function addCustomersURLFragment() {
  if (!/#customers/.test(window.location)) {
    window.location = window.location + '#customers';
  }
}

// Add the #customers fragment to the URL if it isn't there
addCustomersURLFragment();

// These are the set of possible URLs that a user might enter into the
// browser bar or that the user might be redirected to (still without a
// new page load)
let routes = [
  { pathMatcher: /#customers$/, name: "customersIndex" },
  { pathMatcher: /#customers\/[0-9]+$/, name: "customerShow" }
];

// Match the current path with a route and call the appropriate action
match(window.location, routes);

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
      if (isMatch === true && route.name === "customerShow") {
        $("body").empty();
        $("body").append(loadingAnimation);
        // Get the customer's primary key from the URL. The AWS S3 production
        // URL has two numbers in it (for example, the 3 in s3-website and the
        // 2 in us-east-2 in:
        // http://consuming-ecommerce-rest-api.s3-website.us-east-2.amazonaws.com/#customers/11
        // The approach below grabs all of the numbers in the URL and removes
        // the first two, leaving only the customer's primary key.
        var customerId = window.location.toString().replace(/\D+/g, "").slice(2);
        getCustomer(customerId);
      }
  });
}

// When the URL changes, match the new URL with a route and call the
// appropriate action
$(window).on('popstate', (event) => {
  match(window.location, routes);
});

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

function getCustomer(id) {
  $.ajax({
    url: `https://www.ecommerceapiexample.com/api/v1/customers/${id}`,
    type: "GET",
    error: function (response) {
      errorHandler(response);
    },
    success: function (response) {
      var customer = {
        "firstName": response.first_name,
        "lastName": response.last_name,
        "id": response.id
      };
      getCustomerInvoices(customer);
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

function getCustomerInvoices(customer) {
  var customerId = customer.id;
  var url = `https://www.ecommerceapiexample.com/api/v1/customers/${customerId}/invoices`;
  $.ajax({
    url: url,
    type: "GET",
    error: function(response) {
      errorHandler(response);
    },
    success: function(invoices) {
     singleCustomerSuccessHandler(customer, invoices);
    }
  });
}

// When the user clicks on a customer card:
//   - Remove the display of every other customer
//   - Show the loading animation
//   - Call the handler which queries the server for the customer's invoices
$(document).on("click", ".customer", function(event) {
  $("body").empty();
  $("body").append(loadingAnimation);
  var customer = {
    "firstName": this.getAttribute("data-first-name"),
    "lastName": this.getAttribute("data-last-name"),
    "id": this.getAttribute("data-id")
  };
  getCustomerInvoices(customer);
})

//  This handler processes the response containing a customer's invoices.
//   - Update the URL to the show page for the current customer
//   - Develop a markup template for each invoice
//   - Remove the loading animation
//   - Insert the invoice templates into the DOM
function singleCustomerSuccessHandler(customer, invoices) {
 if (!/#customers\/[0-9]+/.test(window.location)) {
   window.location = window.location + `/${customer.id}`;
 }
    var invoiceTemplates = invoices.map(invoice => {
    var invoiceTemplate = `
	  <div class="invoice thumbnail">
            <span>Invoice ID: ${invoice.id}</span><br/>
            <span>Merchant ID: ${invoice.merchant_id}</span><br/>
            <span>Status: ${invoice.status}</span><br/>
          </div>
        `;
    return invoiceTemplate;
  });
  $("body").empty();
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
