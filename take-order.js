/* =========================================
   LOAD MENU FROM LOCAL STORAGE
========================================= */

const foodGrid = document.getElementById("foodGrid");

function loadMenuItems() {

    const menuItems =
        JSON.parse(localStorage.getItem("restaurantMenu")) || [];

    foodGrid.innerHTML = "";

    if (menuItems.length === 0) {

        foodGrid.innerHTML = `
            <div class="empty-menu">
                <p>No menu items available.</p>
            </div>
        `;

        return;
    }

    menuItems.forEach(function(item) {

        const card = document.createElement("div");

        card.className = "food-card";

        card.dataset.name = item.name;
        card.dataset.price = item.price;

        card.innerHTML = `
            
            <div class="food-image">
                ${getFoodImage(item)}
            </div>

            <div class="food-info">

                <span class="food-category">
                    ${item.category}
                </span>

                <h3>${item.name}</h3>

                <p>${item.description}</p>

                <strong>₹${Number(item.price).toFixed(2)}</strong>

            </div>

            <button
                class="add-btn"
                ${item.available === false ? "disabled" : ""}
            >
                ${
                    item.available === false
                        ? "Unavailable"
                        : "+ Add"
                }
            </button>

        `;

        foodGrid.appendChild(card);
        const addButton = card.querySelector(".add-btn");

if (item.available !== false) {

    addButton.addEventListener("click", function() {

        addToCart(
            item.name,
            Number(item.price)
        );

    });

}

    });

}


/* Load menu when page opens */

loadMenuItems();

// =========================================
// TAKE ORDER PAGE
// =========================================


// =========================================
// CART
// =========================================

let cart = [];





// =========================================
// ADD ITEM TO CART
// =========================================

function addToCart(name, price) {

    const existingItem =
        cart.find(function(item) {

            return item.name === name;

        });


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            name: name,

            price: price,

            quantity: 1

        });

    }


    displayCart();

    updateTotal();

}


// =========================================
// DISPLAY CART
// =========================================

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");


    cartItems.innerHTML = "";


    // Empty cart

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <span>🛒</span>

                <p>No items added yet.</p>

                <small>
                    Select items from the menu.
                </small>

            </div>

        `;

        return;

    }


    // Display items

    cart.forEach(function(item, index) {

        const itemTotal =
            item.price * item.quantity;


        cartItems.innerHTML += `

            <div class="cart-item">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <small>
                        ₹${item.price} each
                    </small>

                </div>


                <div class="quantity-controls">

                    <button
                        onclick="decreaseQuantity(${index})">

                        −

                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="increaseQuantity(${index})">

                        +

                    </button>

                </div>


                <strong>
                    ₹${itemTotal.toFixed(2)}
                </strong>

            </div>

        `;

    });

}


// =========================================
// INCREASE QUANTITY
// =========================================

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity++;


    displayCart();

    updateTotal();

}


// =========================================
// DECREASE QUANTITY
// =========================================

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity--;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    displayCart();

    updateTotal();

}


// =========================================
// UPDATE TOTAL
// =========================================

function updateTotal() {

    let subtotal = 0;


    cart.forEach(function(item) {

        subtotal +=
            item.price * item.quantity;

    });


    const tax =
        subtotal * 0.05;


    const total =
        subtotal + tax;


    document.getElementById("subtotal").textContent =
        "₹" + subtotal.toFixed(2);


    document.getElementById("tax").textContent =
        "₹" + tax.toFixed(2);


    document.getElementById("total").textContent =
        "₹" + total.toFixed(2);

}


// =========================================
// CUSTOMER + TABLE
// =========================================

const customerIdInput =
    document.getElementById("customerId");

const customerNameInput =
    document.getElementById("customerName");

const tableSelect =
    document.querySelector(".table-selection select");


// =========================================
// PAYMENT METHOD
// =========================================

let selectedPaymentMethod = "Cash";


const paymentButtons =
    document.querySelectorAll(".payment-btn");


paymentButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove active from all

        paymentButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });


        // Activate selected button

        button.classList.add("active");


        // Get payment method

        if (button.dataset.payment) {

            selectedPaymentMethod =
                button.dataset.payment;

        } else {

            selectedPaymentMethod =
                button.textContent
                    .replace(/[^\w\s]/gi, "")
                    .trim();

        }

    });

});


// =========================================
// PLACE ORDER BUTTON
// =========================================

const placeOrderButton =
    document.querySelector(".place-order-btn");


placeOrderButton.addEventListener(
    "click",
    function() {


        // =====================================
        // GET CUSTOMER DETAILS
        // =====================================

        const customerId =
            customerIdInput.value.trim();


        const customerName =
            customerNameInput.value.trim();


        const selectedTable =
            tableSelect.value;


        // =====================================
        // VALIDATION
        // =====================================

        if (customerId === "") {

            alert("Please enter Customer ID.");

            customerIdInput.focus();

            return;

        }


        if (customerName === "") {

            alert("Please enter Customer Name.");

            customerNameInput.focus();

            return;

        }


        if (
            selectedTable === "" ||
            selectedTable === "Select Table"
        ) {

            alert("Please select a table.");

            tableSelect.focus();

            return;

        }


        if (cart.length === 0) {

            alert(
                "Please add at least one item to the order."
            );

            return;

        }


        // =====================================
        // CALCULATE TOTAL
        // =====================================

        let subtotal = 0;


        cart.forEach(function(item) {

            subtotal +=
                item.price * item.quantity;

        });


        const tax =
            subtotal * 0.05;


        const total =
            subtotal + tax;


        // =====================================
        // DATE + TIME
        // =====================================

        const now =
            new Date();


        const orderDate =
            now.toISOString();


        // =====================================
        // CREATE ORDER
        // =====================================

        const order = {

            orderId:
                generateOrderId(),

            customerId:
                customerId,

            customerName:
                customerName,

            tableNumber:
                selectedTable,

            items:
                cart.map(function(item) {

                    return {

                        name: item.name,

                        price: item.price,

                        quantity: item.quantity

                    };

                }),

            subtotal:
                subtotal,

            tax:
                tax,

            total:
                total,

            paymentMethod:
                selectedPaymentMethod,

            status:
                "Pending",

            date:
                orderDate,

            orderDate:
                orderDate,

            createdAt:
                orderDate

        };


        // =====================================
        // GET EXISTING ORDERS
        // =====================================

        let savedOrders =
            JSON.parse(
                localStorage.getItem("restaurantOrders")
            ) || [];


        // =====================================
        // SAVE NEW ORDER
        // =====================================

        savedOrders.push(order);


        localStorage.setItem(
            "restaurantOrders",
            JSON.stringify(savedOrders)
        );


        // =====================================
        // DEBUG
        // =====================================

        console.log(
            "New Order Saved:",
            order
        );


        // =====================================
        // SUCCESS MESSAGE
        // =====================================

        alert(

            "Order placed successfully!\n\n" +

            "Order ID: " +
            order.orderId +

            "\nCustomer: " +
            order.customerName +

            "\nTotal: ₹" +
            order.total.toFixed(2)

        );


        // =====================================
        // RESET CART
        // =====================================

        cart = [];


        displayCart();

        updateTotal();


        // =====================================
        // RESET CUSTOMER DETAILS
        // =====================================

        customerIdInput.value = "";

        customerNameInput.value = "";

        tableSelect.value = "";


        // =====================================
        // RESET PAYMENT TO CASH
        // =====================================

        selectedPaymentMethod = "Cash";


        paymentButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });


        if (paymentButtons.length > 0) {

            paymentButtons[0].classList.add("active");

        }

    }
);


// =========================================
// GENERATE ORDER ID
// =========================================

function generateOrderId() {

    let orderId;

    let existingOrders =
        JSON.parse(
            localStorage.getItem("restaurantOrders")
        ) || [];


    do {

        const randomNumber =
            Math.floor(
                1000 + Math.random() * 9000
            );


        orderId =
            "ORD-" + randomNumber;


    } while (

        existingOrders.some(function(order) {

            return order.orderId === orderId;

        })

    );


    return orderId;

}

function getFoodImage(item) {

    if (item.image) {
        return item.image;
    }

    const imageMap = {
        "Paneer Pizza": "🍕",
        "Veg Burger": "🍔",
        "White Sauce Pasta": "🍝",
        "Club Sandwich": "🥪",
        "Cold Coffee": "☕",
        "Chocolate Cake": "🍰",
        "Mango Shake": "🥭",
        "Curry Rice":"🍛"
        

    };

    return imageMap[item.name] || "🍽️";
}