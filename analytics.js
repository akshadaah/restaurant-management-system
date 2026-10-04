// =====================================================
// ANALYTICS MANAGEMENT
// =====================================================


// =====================================================
// LOAD ORDERS
// =====================================================

let orders =
    JSON.parse(
        localStorage.getItem("restaurantOrders")
    ) || [];


// =====================================================
// BASIC HELPERS
// =====================================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}


function getOrderAmount(order) {

    return Number(order.total) || 0;
}


function getOrderDate(order) {

    return new Date(
        order.orderDate ||
        order.date ||
        order.createdAt
    );
}


function getCustomerKey(order) {

    return String(
        order.customerId ||
        order.customerName ||
        "Walk-in Customer"
    )
        .trim()
        .toLowerCase();
}


function isCompleted(order) {

    return String(
        order.status || ""
    )
        .toLowerCase() === "completed";
}


function formatCompactCurrency(value) {

    value =
        Number(value) || 0;


    if (value >= 100000) {

        return (
            "₹" +
            (value / 100000)
                .toFixed(1) +
            "L"
        );
    }


    if (value >= 1000) {

        return (
            "₹" +
            (value / 1000)
                .toFixed(1) +
            "K"
        );
    }


    return (
        "₹" +
        Math.round(value)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// ANALYTICS SUMMARY
// =====================================================

function updateAnalyticsSummary() {

    const totalOrders =
        orders.length;


    // -----------------------------------------------
    // COMPLETED ORDERS
    // -----------------------------------------------

    const completedOrders =
        orders.filter(
            order => isCompleted(order)
        );


    let completedRevenue = 0;


    completedOrders.forEach(order => {

        completedRevenue +=
            getOrderAmount(order);

    });


    const averageOrderValue =
        completedOrders.length > 0
            ? completedRevenue /
              completedOrders.length
            : 0;


    // -----------------------------------------------
    // CUSTOMERS
    // -----------------------------------------------

    const customerMap =
        new Map();


    orders.forEach(order => {

        const key =
            getCustomerKey(order);


        if (!customerMap.has(key)) {

            customerMap.set(
                key,
                0
            );
        }


        customerMap.set(
            key,
            customerMap.get(key) + 1
        );

    });


    const totalCustomers =
        customerMap.size;


    let repeatCustomers = 0;


    customerMap.forEach(count => {

        if (count > 1) {

            repeatCustomers++;
        }

    });


    // -----------------------------------------------
    // UPDATE HTML
    // -----------------------------------------------

    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );


    const averageElement =
        document.getElementById(
            "averageOrderValue"
        );


    const customersElement =
        document.getElementById(
            "totalCustomers"
        );


    const repeatElement =
        document.getElementById(
            "repeatCustomers"
        );


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            totalOrders.toLocaleString(
                "en-IN"
            );
    }


    if (averageElement) {

        averageElement.textContent =
            formatCurrency(
                averageOrderValue
            );
    }


    if (customersElement) {

        customersElement.textContent =
            totalCustomers.toLocaleString(
                "en-IN"
            );
    }


    if (repeatElement) {

        repeatElement.textContent =
            repeatCustomers.toLocaleString(
                "en-IN"
            );
    }


    // -----------------------------------------------
    // INFO TEXT
    // -----------------------------------------------

    const totalInfo =
        document.getElementById(
            "totalOrdersInfo"
        );


    const averageInfo =
        document.getElementById(
            "averageOrderInfo"
        );


    const customerInfo =
        document.getElementById(
            "customerInfo"
        );


    const repeatInfo =
        document.getElementById(
            "repeatCustomerInfo"
        );


    if (totalInfo) {

        totalInfo.textContent =
            "All recorded orders";
    }


    if (averageInfo) {

        averageInfo.textContent =
            completedOrders.length +
            " completed orders";
    }


    if (customerInfo) {

        customerInfo.textContent =
            "Unique customers";
    }


    if (repeatInfo) {

        repeatInfo.textContent =
            "Customers with multiple orders";
    }
}


// =====================================================
// SALES TREND DATA
// =====================================================

function getMonthlySales(year) {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const monthlyData = [];


    for (
        let month = 0;
        month < 12;
        month++
    ) {

        let sales = 0;


        orders.forEach(order => {

            if (!isCompleted(order)) {
                return;
            }


            const date =
                getOrderDate(order);


            if (isNaN(date)) {
                return;
            }


            if (
                date.getFullYear() === year &&
                date.getMonth() === month
            ) {

                sales +=
                    getOrderAmount(order);
            }

        });


        monthlyData.push({

            label:
                months[month],

            amount:
                sales

        });
    }


    return monthlyData;
}


// =====================================================
// UPDATE SALES TREND
// =====================================================

function updateSalesTrend() {

    const period =
        document.getElementById(
            "analyticsPeriod"
        );


    const selectedPeriod =
        period
            ? period.value
            : "thisYear";


    const currentYear =
        new Date().getFullYear();


    const year =
        selectedPeriod === "lastYear"
            ? currentYear - 1
            : currentYear;


    const data =
        getMonthlySales(year);


    renderSalesChart(data);
}


// =====================================================
// RENDER SALES CHART
// =====================================================

function renderSalesChart(data) {

    const barsContainer =
        document.getElementById(
            "analyticsBars"
        );


    const yAxis =
        document.getElementById(
            "analyticsYAxis"
        );


    if (!barsContainer || !yAxis) {
        return;
    }


    barsContainer.innerHTML = "";

    yAxis.innerHTML = "";


    const maxValue =
        Math.max(
            ...data.map(
                item => item.amount
            ),
            0
        );


    // -----------------------------------------------
    // Y AXIS
    // -----------------------------------------------

    const steps = 5;


    for (
        let i = steps;
        i >= 0;
        i--
    ) {

        const value =
            maxValue === 0
                ? 0
                : (maxValue / steps) * i;


        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            formatCompactCurrency(
                value
            );


        yAxis.appendChild(
            label
        );
    }


    // -----------------------------------------------
    // BARS
    // -----------------------------------------------

    data.forEach(item => {

        const group =
            document.createElement(
                "div"
            );


        group.className =
            "analytics-bar-group";


        const bar =
            document.createElement(
                "div"
            );


        bar.className =
            "analytics-bar";


        let height = 0;


        if (
            maxValue > 0 &&
            item.amount > 0
        ) {

            height =
                (item.amount /
                    maxValue) *
                100;


            height =
                Math.max(
                    height,
                    4
                );
        }


        bar.style.height =
            height + "%";


        bar.title =
            item.label +
            ": " +
            formatCurrency(
                item.amount
            );


        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            item.label;


        group.appendChild(bar);

        group.appendChild(label);

        barsContainer.appendChild(group);

    });
}


// =====================================================
// ORDER STATUS
// =====================================================

function updateOrderStatus() {

    const counts = {

        completed: 0,

        preparing: 0,

        pending: 0,

        cancelled: 0

    };


    orders.forEach(order => {

        const status =
            String(
                order.status || ""
            )
                .toLowerCase()
                .trim();


        if (
            status === "completed"
        ) {

            counts.completed++;

        }

        else if (
            status === "preparing"
        ) {

            counts.preparing++;

        }

        else if (
            status === "pending"
        ) {

            counts.pending++;

        }

        else if (
            status === "cancelled" ||
            status === "canceled"
        ) {

            counts.cancelled++;

        }

    });


    const total =
        orders.length;


    // -----------------------------------------------
    // UPDATE COUNTS
    // -----------------------------------------------

    document.getElementById(
        "statusTotal"
    ).textContent =
        total;


    document.getElementById(
        "completedCount"
    ).textContent =
        counts.completed;


    document.getElementById(
        "preparingCount"
    ).textContent =
        counts.preparing;


    document.getElementById(
        "pendingCount"
    ).textContent =
        counts.pending;


    document.getElementById(
        "cancelledCount"
    ).textContent =
        counts.cancelled;


    // -----------------------------------------------
    // UPDATE CIRCLE
    // -----------------------------------------------

    const circle =
        document.getElementById(
            "statusCircle"
        );


    if (!circle) {
        return;
    }


    if (total === 0) {

        circle.style.background =
            "conic-gradient(#e8f3e9 0deg 360deg)";

        return;
    }


    const completedDegrees =
        counts.completed /
        total *
        360;


    const preparingDegrees =
        counts.preparing /
        total *
        360;


    const pendingDegrees =
        counts.pending /
        total *
        360;


    const cancelledDegrees =
        counts.cancelled /
        total *
        360;


    const first =
        completedDegrees;


    const second =
        first +
        preparingDegrees;


    const third =
        second +
        pendingDegrees;


    const fourth =
        third +
        cancelledDegrees;


    circle.style.background =
        `conic-gradient(
            #155d27 0deg ${first}deg,
            #4d8fdc ${first}deg ${second}deg,
            #f0a34a ${second}deg ${third}deg,
            #d97777 ${third}deg ${fourth}deg
        )`;
}


// =====================================================
// TOP SELLING ITEMS
// =====================================================

function updateTopSellingItems() {

    const container =
        document.getElementById(
            "topItems"
        );


    if (!container) {
        return;
    }


    const itemData = {};


    // -----------------------------------------------
    // USE COMPLETED ORDERS
    // -----------------------------------------------

    orders.forEach(order => {

        if (!isCompleted(order)) {
            return;
        }


        if (
            !Array.isArray(order.items)
        ) {
            return;
        }


        order.items.forEach(item => {

            const name =
                item.name ||
                "Unknown Item";


            const quantity =
                Number(
                    item.quantity
                ) || 0;


            const price =
                Number(
                    item.price
                ) || 0;


            if (!itemData[name]) {

                itemData[name] = {

                    quantity: 0,

                    sales: 0

                };
            }


            itemData[name].quantity +=
                quantity;


            itemData[name].sales +=
                quantity * price;

        });

    });


    const sortedItems =
        Object.entries(itemData)
            .sort(
                (a, b) =>
                    b[1].quantity -
                    a[1].quantity
            )
            .slice(0, 5);


    // -----------------------------------------------
    // NO DATA
    // -----------------------------------------------

    if (
        sortedItems.length === 0
    ) {

        container.innerHTML = `

            <div class="top-item">

                <span
                    style="
                        grid-column: 1 / -1;
                        text-align: center;
                        color: #888;
                    "
                >
                    No completed item sales yet.
                </span>

            </div>

        `;

        return;
    }


    // -----------------------------------------------
    // ICONS
    // -----------------------------------------------

    const icons = {

        "Paneer Pizza": "🍕",

        "Veg Burger": "🍔",

        "White Sauce Pasta": "🍝",

        "Club Sandwich": "🥪",

        "Cold Coffee": "☕",

        "Chocolate Cake": "🍰",

        "Mango Shake": "🥭",

        "Curry Rice": "🍛"

    };


    container.innerHTML =
        sortedItems
            .map(
                ([name, data], index) => {

                    const icon =
                        icons[name] ||
                        "🍽️";


                    const rank =
                        String(
                            index + 1
                        )
                            .padStart(
                                2,
                                "0"
                            );


                    return `

                        <div
                            class="top-item"
                        >

                            <span class="rank">
                                ${rank}
                            </span>


                            <span class="food-icon">
                                ${icon}
                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        name
                                    )}
                                </strong>

                                <small>
                                    ${data.quantity}
                                    ${
                                        data.quantity === 1
                                            ? "item sold"
                                            : "items sold"
                                    }
                                </small>

                            </div>


                            <strong
                                class="item-sales"
                            >
                                ${formatCurrency(
                                    data.sales
                                )}
                            </strong>

                        </div>

                    `;
                }
            )
            .join("");
}


// =====================================================
// PEAK HOURS
// =====================================================

function updatePeakHours() {

    const container =
        document.getElementById(
            "peakHours"
        );


    if (!container) {
        return;
    }


    const periods = [

        {
            name:
                "12 PM - 2 PM",

            label:
                "Lunch",

            start:
                12,

            end:
                14
        },

        {
            name:
                "2 PM - 5 PM",

            label:
                "Afternoon",

            start:
                14,

            end:
                17
        },

        {
            name:
                "5 PM - 8 PM",

            label:
                "Evening",

            start:
                17,

            end:
                20
        },

        {
            name:
                "8 PM - 11 PM",

            label:
                "Dinner",

            start:
                20,

            end:
                23
        }

    ];


    const counts =
        periods.map(
            period => {

                let count = 0;


                orders.forEach(order => {

                    const date =
                        getOrderDate(order);


                    if (isNaN(date)) {
                        return;
                    }


                    const hour =
                        date.getHours();


                    if (
                        hour >= period.start &&
                        hour < period.end
                    ) {

                        count++;
                    }

                });


                return {

                    ...period,

                    count:
                        count

                };

            }
        );


    const maxCount =
        Math.max(
            ...counts.map(
                item => item.count
            ),
            0
        );


    container.innerHTML =
        counts
            .map(item => {

                const percentage =
                    maxCount > 0
                        ? (
                            item.count /
                            maxCount
                        ) * 100
                        : 0;


                return `

                    <div class="peak-item">

                        <div>

                            <strong>
                                ${item.name}
                            </strong>

                            <span>
                                ${item.label}
                            </span>

                        </div>


                        <div class="peak-bar">

                            <div
                                style="
                                    width: ${percentage}%;
                                "
                            ></div>

                        </div>


                        <strong>
                            ${item.count}
                        </strong>

                    </div>

                `;

            })
            .join("");
}


// =====================================================
// LOAD ALL ANALYTICS
// =====================================================

function loadAnalyticsData() {

    orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantOrders"
            )
        ) || [];


    updateAnalyticsSummary();

    updateSalesTrend();

    updateOrderStatus();

    updateTopSellingItems();

    updatePeakHours();
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAnalyticsData();


        const period =
            document.getElementById(
                "analyticsPeriod"
            );


        if (period) {

            period.addEventListener(
                "change",
                updateSalesTrend
            );
        }

    }
);


// =====================================================
// REFRESH WHEN PAGE GETS FOCUS
// =====================================================

window.addEventListener(
    "focus",
    loadAnalyticsData
);


// =====================================================
// REFRESH WHEN ORDERS CHANGE
// =====================================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "restaurantOrders"
        ) {

            loadAnalyticsData();
        }

    }
);