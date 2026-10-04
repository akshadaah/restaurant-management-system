// =========================================
// ORDERS PAGE
// =========================================


// =========================================
// GET ORDERS FROM LOCAL STORAGE
// =========================================

let orders =
    JSON.parse(localStorage.getItem("restaurantOrders")) || [];


// =========================================
// ELEMENTS
// =========================================

const ordersContainer =
    document.getElementById("ordersContainer");

const orderSearch =
    document.getElementById("orderSearch");

const statusFilter =
    document.getElementById("statusFilter");

const dateFilter =
    document.getElementById("dateFilter");


// =========================================
// INITIAL DISPLAY
// =========================================

displayOrders();


// =========================================
// DISPLAY ORDERS
// =========================================

function displayOrders() {

    ordersContainer.innerHTML = "";

    const filteredOrders = getFilteredOrders();

    // -----------------------------------------
    // NO ORDERS
    // -----------------------------------------

    if (filteredOrders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="no-orders">
                No orders found.
            </div>
        `;

        updateOrderCount(0);

        return;
    }


    // -----------------------------------------
    // NEWEST ORDER FIRST
    // -----------------------------------------

    const reversedOrders =
        [...filteredOrders].reverse();


    // -----------------------------------------
    // CREATE ROWS
    // -----------------------------------------

    reversedOrders.forEach(function(order) {

        // Count total items
        let itemCount = 0;

        if (order.items && Array.isArray(order.items)) {

            order.items.forEach(function(item) {

                itemCount +=
                    Number(item.quantity) || 0;

            });

        }


        // Create row
        const row =
            document.createElement("div");

        row.className = "table-row";


        // -----------------------------------------
        // ROW HTML
        // -----------------------------------------

        row.innerHTML = `

            <span class="order-id">
                #${order.orderId}
            </span>


            <span class="customer-cell">

                <strong>
                    ${escapeHTML(order.customerName || "Unknown")}
                </strong>

                <small class="customer-id">
                    ID: ${escapeHTML(order.customerId || "-")}
                </small>

            </span>


            <span>
                Table ${escapeHTML(order.tableNumber || "-")}
            </span>


            <span>
                ${itemCount} Items
            </span>


            <strong>
                ₹${Number(order.total || 0).toFixed(2)}
            </strong>


            <span>
                ${escapeHTML(order.paymentMethod || "-")}
            </span>


            <span>

                <select
                    class="order-status-select ${getStatusClass(order.status)}"
                    onchange="changeOrderStatus('${order.orderId}', this.value)"
                >

                    <option value="Pending"
                        ${order.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Preparing"
                        ${order.status === "Preparing" ? "selected" : ""}>
                        Preparing
                    </option>

                    <option value="Ready"
                        ${order.status === "Ready" ? "selected" : ""}>
                        Ready
                    </option>

                    <option value="Completed"
                        ${order.status === "Completed" ? "selected" : ""}>
                        Completed
                    </option>

                    <option value="Cancelled"
                        ${order.status === "Cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>

                </select>

            </span>


            <span>

                <button
                    class="view-order-btn"
                    onclick="viewOrder('${order.orderId}')"
                >
                    View
                </button>

            </span>

        `;


        ordersContainer.appendChild(row);

    });


    // -----------------------------------------
    // UPDATE ORDER COUNT
    // -----------------------------------------

    updateOrderCount(filteredOrders.length);

}


// =========================================
// SEARCH + FILTER
// =========================================

function getFilteredOrders() {

    let filteredOrders =
        [...orders];


    // =========================================
    // SEARCH
    // =========================================

    const searchValue =
        orderSearch
            ? orderSearch.value.trim().toLowerCase()
            : "";


    if (searchValue !== "") {

        filteredOrders =
            filteredOrders.filter(function(order) {

                const orderId =
                    String(order.orderId || "")
                        .toLowerCase();

                const customerName =
                    String(order.customerName || "")
                        .toLowerCase();

                const customerId =
                    String(order.customerId || "")
                        .toLowerCase();

                const tableNumber =
                    String(order.tableNumber || "")
                        .toLowerCase();

                const paymentMethod =
                    String(order.paymentMethod || "")
                        .toLowerCase();

                const status =
                    String(order.status || "")
                        .toLowerCase();


                return (

                    orderId.includes(searchValue) ||

                    customerName.includes(searchValue) ||

                    customerId.includes(searchValue) ||

                    tableNumber.includes(searchValue) ||

                    paymentMethod.includes(searchValue) ||

                    status.includes(searchValue)

                );

            });

    }


    // =========================================
    // STATUS FILTER
    // =========================================

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All Status";


    if (
        selectedStatus &&
        selectedStatus !== "All Status"
    ) {

        filteredOrders =
            filteredOrders.filter(function(order) {

                return (
                    String(order.status || "")
                        .toLowerCase() ===
                    selectedStatus.toLowerCase()
                );

            });

    }


    // =========================================
    // DATE FILTER
    // =========================================

    const selectedDate =
        dateFilter
            ? dateFilter.value
            : "Today";


    if (selectedDate !== "All Time") {

        filteredOrders =
            filteredOrders.filter(function(order) {

                const orderDateValue =
                    order.orderDate ||
                    order.date ||
                    order.createdAt;


                // If old order has no date,
                // don't crash the page.
                if (!orderDateValue) {
                    return false;
                }


                const orderDate =
                    new Date(orderDateValue);


                if (isNaN(orderDate.getTime())) {
                    return false;
                }


                const today =
                    new Date();


                // Remove time
                const orderDay =
                    new Date(
                        orderDate.getFullYear(),
                        orderDate.getMonth(),
                        orderDate.getDate()
                    );


                const todayDay =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate()
                    );


                // -----------------------------------------
                // TODAY
                // -----------------------------------------

                if (selectedDate === "Today") {

                    return (
                        orderDay.getTime() ===
                        todayDay.getTime()
                    );

                }


                // -----------------------------------------
                // THIS WEEK
                // -----------------------------------------

                if (selectedDate === "This Week") {

                    const dayOfWeek =
                        todayDay.getDay();

                    // Sunday = 0
                    // Monday = 1

                    const differenceFromMonday =
                        dayOfWeek === 0
                            ? 6
                            : dayOfWeek - 1;


                    const weekStart =
                        new Date(todayDay);

                    weekStart.setDate(
                        todayDay.getDate() -
                        differenceFromMonday
                    );


                    const weekEnd =
                        new Date(weekStart);

                    weekEnd.setDate(
                        weekStart.getDate() + 6
                    );


                    return (
                        orderDay >= weekStart &&
                        orderDay <= weekEnd
                    );

                }


                // -----------------------------------------
                // THIS MONTH
                // -----------------------------------------

                if (selectedDate === "This Month") {

                    return (
                        orderDay.getMonth() ===
                        todayDay.getMonth() &&

                        orderDay.getFullYear() ===
                        todayDay.getFullYear()
                    );

                }


                return true;

            });

    }


    return filteredOrders;

}


// =========================================
// STATUS CHANGE
// =========================================

function changeOrderStatus(orderId, newStatus) {

    const order =
        orders.find(function(item) {

            return item.orderId === orderId;

        });


    if (!order) {

        alert("Order not found.");

        return;

    }


    // Update status
    order.status = newStatus;


    // Save updated orders
    localStorage.setItem(
        "restaurantOrders",
        JSON.stringify(orders)
    );


    // Refresh page data
    displayOrders();

}


// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(status) {

    const value =
        String(status || "Pending")
            .toLowerCase();


    if (value === "completed") {
        return "completed";
    }


    if (value === "preparing") {
        return "preparing";
    }


    if (value === "ready") {
        return "ready";
    }


    if (value === "cancelled") {
        return "cancelled";
    }


    return "pending";

}


// =========================================
// ORDER COUNT
// =========================================

function updateOrderCount(count) {

    const countElement =
        document.querySelector(
            ".orders-table-header span"
        );


    if (!countElement) {
        return;
    }


    if (count === 1) {

        countElement.textContent =
            "1 order";

    } else {

        countElement.textContent =
            count + " orders";

    }

}


// =========================================
// SEARCH EVENT
// =========================================

if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        function() {

            displayOrders();

        }
    );

}


// =========================================
// STATUS FILTER EVENT
// =========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        function() {

            displayOrders();

        }
    );

}


// =========================================
// DATE FILTER EVENT
// =========================================

if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        function() {

            displayOrders();

        }
    );

}


// =========================================
// VIEW ORDER
// =========================================

function viewOrder(orderId) {

    const order =
        orders.find(function(item) {

            return item.orderId === orderId;

        });


    if (!order) {

        alert("Order not found.");

        return;

    }


    // =========================================
    // CREATE MODAL
    // =========================================

    let modal =
        document.getElementById("orderDetailsModal");


    // If modal doesn't exist,
    // create it dynamically.

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "orderDetailsModal";

        modal.className =
            "order-details-modal";


        modal.innerHTML = `

            <div class="order-modal-overlay"
                 onclick="closeOrderModal()">
            </div>


            <div class="order-modal">

                <div class="order-modal-header">

                    <div>

                        <h2>
                            Order Details
                        </h2>

                        <p id="modalOrderId">
                        </p>

                    </div>


                    <button
                        class="modal-close-btn"
                        onclick="closeOrderModal()"
                    >
                        ×
                    </button>

                </div>


                <div
                    class="order-modal-content"
                    id="modalOrderContent"
                >
                </div>

            </div>

        `;


        document.body.appendChild(modal);

    }


    // =========================================
    // ITEMS HTML
    // =========================================

    let itemsHTML = "";


    if (
        order.items &&
        Array.isArray(order.items) &&
        order.items.length > 0
    ) {

        order.items.forEach(function(item) {

            const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);


            itemsHTML += `

                <div class="modal-item-row">

                    <div>

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <small>
                            ₹${Number(item.price || 0).toFixed(2)}
                            ×
                            ${Number(item.quantity || 0)}
                        </small>

                    </div>


                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>

                </div>

            `;

        });

    } else {

        itemsHTML = `
            <p>No items found.</p>
        `;

    }


    // =========================================
    // DATE FORMAT
    // =========================================

    const dateValue =
        order.orderDate ||
        order.date ||
        order.createdAt;


    let formattedDate =
        "Not available";


    if (dateValue) {

        const parsedDate =
            new Date(dateValue);


        if (!isNaN(parsedDate.getTime())) {

            formattedDate =
                parsedDate.toLocaleString();

        }

    }


    // =========================================
    // STATUS CLASS
    // =========================================

    const statusClass =
        getStatusClass(order.status);


    // =========================================
    // MODAL CONTENT
    // =========================================

    document.getElementById(
        "modalOrderId"
    ).textContent =
        "#" + order.orderId;


    document.getElementById(
        "modalOrderContent"
    ).innerHTML = `

        <div class="order-info-grid">

            <div>

                <span>
                    Customer Name
                </span>

                <strong>
                    ${escapeHTML(
                        order.customerName || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Customer ID
                </span>

                <strong>
                    ${escapeHTML(
                        order.customerId || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Table
                </span>

                <strong>
                    Table ${escapeHTML(
                        order.tableNumber || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Payment
                </span>

                <strong>
                    ${escapeHTML(
                        order.paymentMethod || "-"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Status
                </span>

                <strong class="modal-status ${statusClass}">
                    ${escapeHTML(
                        order.status || "Pending"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    Order Date
                </span>

                <strong>
                    ${formattedDate}
                </strong>

            </div>

        </div>


        <div class="modal-items-section">

            <h3>
                Items
            </h3>

            <div class="modal-items">

                ${itemsHTML}

            </div>

        </div>


        <div class="modal-summary">

            <div>

                <span>
                    Subtotal
                </span>

                <strong>
                    ₹${Number(
                        order.subtotal || 0
                    ).toFixed(2)}
                </strong>

            </div>


            <div>

                <span>
                    Tax (5%)
                </span>

                <strong>
                    ₹${Number(
                        order.tax || 0
                    ).toFixed(2)}
                </strong>

            </div>


            <div class="modal-total">

                <span>
                    Total
                </span>

                <strong>
                    ₹${Number(
                        order.total || 0
                    ).toFixed(2)}
                </strong>

            </div>

        </div>

    `;


    // =========================================
    // SHOW MODAL
    // =========================================

    modal.classList.add("show");

}


// =========================================
// CLOSE MODAL
// =========================================

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderDetailsModal"
        );


    if (modal) {

        modal.classList.remove("show");

    }

}


// =========================================
// ESC KEY CLOSE MODAL
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeOrderModal();

        }

    }
);


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}


// =========================================
// MODAL + STATUS CSS
// =========================================

const orderPageStyles =
    document.createElement("style");


orderPageStyles.textContent = `

/* =========================================
   STATUS SELECT
========================================= */

.order-status-select {

    border: 1px solid #ddd;

    border-radius: 20px;

    padding: 7px 28px 7px 12px;

    font-size: 13px;

    font-weight: 600;

    cursor: pointer;

    outline: none;

    background: #fff;

}


.order-status-select.pending {

    color: #d97706;

    background: #fff4df;

}


.order-status-select.preparing {

    color: #2563eb;

    background: #eaf2ff;

}


.order-status-select.ready {

    color: #7c3aed;

    background: #f1eaff;

}


.order-status-select.completed {

    color: #15803d;

    background: #e9f8ed;

}


.order-status-select.cancelled {

    color: #dc2626;

    background: #ffeaea;

}


/* =========================================
   CUSTOMER CELL
========================================= */

.customer-cell {

    display: flex;

    flex-direction: column;

    gap: 3px;

}


.customer-cell strong {

    font-size: 14px;

}


.customer-id {

    font-size: 12px;

    color: #888;

}


/* =========================================
   VIEW BUTTON
========================================= */

.view-order-btn {

    border: 1px solid #176b32;

    background: white;

    color: #176b32;

    padding: 7px 16px;

    border-radius: 7px;

    font-weight: 600;

    cursor: pointer;

    transition: 0.2s;

}


.view-order-btn:hover {

    background: #176b32;

    color: white;

}


/* =========================================
   MODAL
========================================= */

.order-details-modal {

    position: fixed;

    inset: 0;

    z-index: 9999;

    display: none;

}


.order-details-modal.show {

    display: block;

}


.order-modal-overlay {

    position: absolute;

    inset: 0;

    background: rgba(0, 0, 0, 0.55);

    backdrop-filter: blur(3px);

}


.order-modal {

    position: absolute;

    top: 50%;

    left: 50%;

    transform: translate(-50%, -50%);

    width: min(650px, 90%);

    max-height: 85vh;

    overflow-y: auto;

    background: white;

    border-radius: 16px;

    box-shadow: 0 20px 60px rgba(0,0,0,0.25);

}


.order-modal-header {

    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    padding: 22px 24px;

    border-bottom: 1px solid #eee;

}


.order-modal-header h2 {

    margin: 0 0 5px;

    color: #176b32;

}


.order-modal-header p {

    margin: 0;

    color: #777;

    font-size: 13px;

}


.modal-close-btn {

    border: none;

    background: #f3f3f3;

    width: 34px;

    height: 34px;

    border-radius: 50%;

    font-size: 24px;

    line-height: 30px;

    cursor: pointer;

}


.modal-close-btn:hover {

    background: #e5e5e5;

}


/* =========================================
   MODAL CONTENT
========================================= */

.order-modal-content {

    padding: 24px;

}


.order-info-grid {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 18px;

    margin-bottom: 25px;

}


.order-info-grid div {

    display: flex;

    flex-direction: column;

    gap: 5px;

}


.order-info-grid span {

    font-size: 12px;

    color: #888;

}


.order-info-grid strong {

    font-size: 14px;

    color: #333;

}


.modal-status {

    width: fit-content;

    padding: 5px 10px;

    border-radius: 20px;

}


.modal-status.pending {

    color: #d97706;

    background: #fff4df;

}


.modal-status.preparing {

    color: #2563eb;

    background: #eaf2ff;

}


.modal-status.ready {

    color: #7c3aed;

    background: #f1eaff;

}


.modal-status.completed {

    color: #15803d;

    background: #e9f8ed;

}


.modal-status.cancelled {

    color: #dc2626;

    background: #ffeaea;

}


/* =========================================
   ITEMS
========================================= */

.modal-items-section h3 {

    margin: 0 0 12px;

    color: #333;

}


.modal-items {

    border: 1px solid #eee;

    border-radius: 10px;

    overflow: hidden;

}


.modal-item-row {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 13px 15px;

    border-bottom: 1px solid #eee;

}


.modal-item-row:last-child {

    border-bottom: none;

}


.modal-item-row div {

    display: flex;

    flex-direction: column;

    gap: 4px;

}


.modal-item-row small {

    color: #888;

}


/* =========================================
   SUMMARY
========================================= */

.modal-summary {

    margin-top: 22px;

    border-top: 1px solid #eee;

    padding-top: 15px;

}


.modal-summary > div {

    display: flex;

    justify-content: space-between;

    padding: 7px 0;

}


.modal-total {

    margin-top: 8px;

    padding-top: 14px !important;

    border-top: 1px solid #ddd;

    font-size: 18px;

    color: #176b32;

}


/* =========================================
   MOBILE
========================================= */

@media (max-width: 700px) {

    .order-info-grid {

        grid-template-columns: 1fr;

    }

    .order-modal {

        width: 94%;

    }

}

`;


document.head.appendChild(orderPageStyles);