// ===============================
// SALES MANAGEMENT
// ===============================

// Get orders from localStorage
let orders = JSON.parse(localStorage.getItem("restaurantOrders")) || [];


// ===============================
// BASIC HELPERS
// ===============================

function getOrderDate(order) {
    return new Date(
        order.orderDate ||
        order.date ||
        order.createdAt
    );
}


function isCompleted(order) {
    return String(order.status || "").toLowerCase() === "completed";
}


function getOrderTotal(order) {
    return Number(order.total) || 0;
}


function formatCurrency(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// DATE HELPERS
// ===============================

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}


function startOfWeek(date) {
    const d = startOfDay(date);

    // Monday = start of week
    const day = d.getDay();
    const difference = day === 0 ? 6 : day - 1;

    d.setDate(d.getDate() - difference);

    return d;
}


function startOfMonth(date) {
    const d = new Date(date);

    d.setHours(0, 0, 0, 0);
    d.setDate(1);

    return d;
}


function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}


// ===============================
// COMPLETED ORDERS
// ===============================

function getCompletedOrders() {
    return orders.filter(order => {
        return isCompleted(order);
    });
}


// ===============================
// CALCULATE SALES
// ===============================

function calculateSales() {

    const completedOrders = getCompletedOrders();

    const today = new Date();

    const todayStart = startOfDay(today);
    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);


    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;
    let totalSales = 0;


    completedOrders.forEach(order => {

        const orderDate = getOrderDate(order);
        const amount = getOrderTotal(order);

        if (isNaN(orderDate)) {
            return;
        }


        // Total sales
        totalSales += amount;


        // Today's sales
        if (orderDate >= todayStart) {
            todaySales += amount;
        }


        // This week's sales
        if (orderDate >= weekStart) {
            weekSales += amount;
        }


        // This month's sales
        if (orderDate >= monthStart) {
            monthSales += amount;
        }
    });


    const averageOrder =
        completedOrders.length > 0
            ? totalSales / completedOrders.length
            : 0;


    // Update summary cards
    const todaySalesElement = document.getElementById("todaySales");
    const weekSalesElement = document.getElementById("weekSales");
    const monthSalesElement = document.getElementById("monthSales");
    const averageOrderElement = document.getElementById("averageOrder");


    if (todaySalesElement) {
        todaySalesElement.textContent = formatCurrency(todaySales);
    }

    if (weekSalesElement) {
        weekSalesElement.textContent = formatCurrency(weekSales);
    }

    if (monthSalesElement) {
        monthSalesElement.textContent = formatCurrency(monthSales);
    }

    if (averageOrderElement) {
        averageOrderElement.textContent = formatCurrency(averageOrder);
    }


    // Information text
    const todayInfo = document.getElementById("todaySalesInfo");
    const weekInfo = document.getElementById("weekSalesInfo");
    const monthInfo = document.getElementById("monthSalesInfo");
    const averageInfo = document.getElementById("averageOrderInfo");


    if (todayInfo) {
        todayInfo.textContent =
            completedOrders.filter(order => {
                const date = getOrderDate(order);
                return !isNaN(date) && isSameDay(date, today);
            }).length + " completed orders";
    }


    if (weekInfo) {
        weekInfo.textContent =
            completedOrders.filter(order => {
                const date = getOrderDate(order);
                return !isNaN(date) && date >= weekStart;
            }).length + " completed orders";
    }


    if (monthInfo) {
        monthInfo.textContent =
            completedOrders.filter(order => {
                const date = getOrderDate(order);
                return !isNaN(date) && date >= monthStart;
            }).length + " completed orders";
    }


    if (averageInfo) {
        averageInfo.textContent =
            completedOrders.length + " completed orders";
    }
}


// ===============================
// PAYMENT METHOD SALES
// ===============================

function calculatePaymentSales() {

    const completedOrders = getCompletedOrders();

    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;


    completedOrders.forEach(order => {

        const amount = getOrderTotal(order);

        const paymentMethod =
            String(order.paymentMethod || "")
                .toLowerCase()
                .trim();


        if (paymentMethod === "cash") {
            cashSales += amount;
        }

        else if (paymentMethod === "upi") {
            upiSales += amount;
        }

        else if (paymentMethod === "card") {
            cardSales += amount;
        }
    });


    const totalPaymentSales =
        cashSales +
        upiSales +
        cardSales;


    // Update values
    const cashElement = document.getElementById("cashSales");
    const upiElement = document.getElementById("upiSales");
    const cardElement = document.getElementById("cardSales");
    const totalElement = document.getElementById("paymentTotal");


    if (cashElement) {
        cashElement.textContent = formatCurrency(cashSales);
    }

    if (upiElement) {
        upiElement.textContent = formatCurrency(upiSales);
    }

    if (cardElement) {
        cardElement.textContent = formatCurrency(cardSales);
    }

    if (totalElement) {
        totalElement.textContent =
            formatCurrency(totalPaymentSales);
    }


    // Payment circle
    const circle = document.querySelector(".payment-circle");


    if (circle) {

        if (totalPaymentSales === 0) {

            circle.style.background =
                "conic-gradient(#e9edf3 0deg 360deg)";

        } else {

            const cashDegree =
                (cashSales / totalPaymentSales) * 360;

            const upiDegree =
                (upiSales / totalPaymentSales) * 360;

            const cardDegree =
                (cardSales / totalPaymentSales) * 360;


            circle.style.background =
                `conic-gradient(
                    #155d27 0deg ${cashDegree}deg,
                    #5b8def ${cashDegree}deg ${cashDegree + upiDegree}deg,
                    #9b72cf ${cashDegree + upiDegree}deg ${cashDegree + upiDegree + cardDegree}deg
                )`;
        }
    }
}


// ===============================
// SALES CHART
// ===============================

function updateSalesChart() {

    const periodSelect =
        document.getElementById("salesPeriod");

    const selectedPeriod =
        periodSelect ? periodSelect.value : "week";


    if (selectedPeriod === "month") {
        createMonthlyChart();
    } else {
        createWeeklyChart();
    }
}


// ===============================
// WEEKLY CHART
// ===============================

function createWeeklyChart() {

    const completedOrders = getCompletedOrders();

    const today = new Date();
    const weekStart = startOfWeek(today);


    const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];


    const salesData = [];


    for (let i = 0; i < 7; i++) {

        const currentDay = new Date(weekStart);

        currentDay.setDate(
            weekStart.getDate() + i
        );


        let amount = 0;


        completedOrders.forEach(order => {

            const orderDate = getOrderDate(order);

            if (
                !isNaN(orderDate) &&
                isSameDay(orderDate, currentDay)
            ) {
                amount += getOrderTotal(order);
            }
        });


        salesData.push({
            label: days[i],
            amount: amount
        });
    }


    renderChart(salesData);
}


// ===============================
// MONTHLY CHART
// ===============================

function createMonthlyChart() {

    const completedOrders = getCompletedOrders();

    const today = new Date();

    const monthStart = startOfMonth(today);

    const lastDay =
        new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        ).getDate();


    // Divide month into 5 weeks
    const weekCount = Math.ceil(lastDay / 7);

    const salesData = [];


    for (let week = 0; week < weekCount; week++) {

        const startDay = week * 7 + 1;
        const endDay = Math.min(
            startDay + 6,
            lastDay
        );


        let amount = 0;


        completedOrders.forEach(order => {

            const orderDate = getOrderDate(order);

            if (isNaN(orderDate)) {
                return;
            }


            if (
                orderDate.getFullYear() === today.getFullYear() &&
                orderDate.getMonth() === today.getMonth()
            ) {

                const dateNumber =
                    orderDate.getDate();


                if (
                    dateNumber >= startDay &&
                    dateNumber <= endDay
                ) {
                    amount += getOrderTotal(order);
                }
            }
        });


        salesData.push({
            label: `W${week + 1}`,
            amount: amount
        });
    }


    renderChart(salesData);
}


// ===============================
// RENDER CHART
// ===============================

function renderChart(data) {

    const barsContainer =
        document.getElementById("salesBars");

    const yAxis =
        document.getElementById("salesYAxis");


    if (!barsContainer || !yAxis) {
        return;
    }


    barsContainer.innerHTML = "";
    yAxis.innerHTML = "";


    const maxValue =
        Math.max(
            ...data.map(item => item.amount),
            0
        );


    // Y-axis
    const ySteps = 5;


    for (let i = ySteps; i >= 0; i--) {

        const value =
            maxValue === 0
                ? 0
                : (maxValue / ySteps) * i;


        const label =
            document.createElement("span");


        label.textContent =
            formatCompactCurrency(value);


        yAxis.appendChild(label);
    }


    // Bars
    data.forEach(item => {

        const group =
            document.createElement("div");

        group.className =
            "sales-bar-group";


        const bar =
            document.createElement("div");

        bar.className =
            "sales-bar";


        let height = 0;


        if (maxValue > 0 && item.amount > 0) {

            height =
                (item.amount / maxValue) * 100;

            // Minimum visible height
            height =
                Math.max(height, 5);
        }


        bar.style.height =
            height + "%";


        bar.title =
            `${item.label}: ${formatCurrency(item.amount)}`;


        const label =
            document.createElement("span");

        label.textContent =
            item.label;


        group.appendChild(bar);
        group.appendChild(label);

        barsContainer.appendChild(group);
    });
}


// ===============================
// COMPACT CURRENCY FOR CHART
// ===============================

function formatCompactCurrency(value) {

    value = Number(value) || 0;


    if (value >= 100000) {
        return "₹" +
            (value / 100000).toFixed(1) +
            "L";
    }


    if (value >= 1000) {
        return "₹" +
            (value / 1000).toFixed(1) +
            "K";
    }


    return "₹" +
        Math.round(value);
}


// ===============================
// RECENT TRANSACTIONS
// ===============================

function displayTransactions() {

    const container =
        document.getElementById(
            "transactionsContainer"
        );


    if (!container) {
        return;
    }


    const completedOrders =
        getCompletedOrders()
            .sort((a, b) => {

                const dateA = getOrderDate(a);
                const dateB = getOrderDate(b);

                return dateB - dateA;
            })
            .slice(0, 10);


    if (completedOrders.length === 0) {

        container.innerHTML = `
            <div class="transaction-row">
                <div style="grid-column: 1 / -1; text-align:center;">
                    No completed transactions yet.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        completedOrders.map(order => {

            const itemCount =
                Array.isArray(order.items)
                    ? order.items.reduce(
                        (total, item) =>
                            total +
                            (Number(item.quantity) || 0),
                        0
                    )
                    : 0;


            const payment =
                order.paymentMethod || "N/A";


            const date =
                getOrderDate(order);


            return `
                <div class="transaction-row">

                    <div>
                        ${escapeHTML(order.orderId || "-")}
                    </div>

                    <div>
                        ${escapeHTML(
                            order.customerName || "Walk-in Customer"
                        )}
                    </div>

                    <div>
                        ${itemCount}
                    </div>

                    <div>
                        ${escapeHTML(payment)}
                    </div>

                    <div>
                        ${formatCurrency(
                            getOrderTotal(order)
                        )}
                    </div>

                    <div>
                        ${formatDate(date)}
                    </div>

                </div>
            `;
        }).join("");
}


// ===============================
// LOAD ALL SALES DATA
// ===============================

function loadSalesData() {

    // Get latest orders from localStorage
    orders =
        JSON.parse(
            localStorage.getItem("restaurantOrders")
        ) || [];


    calculateSales();

    calculatePaymentSales();

    updateSalesChart();

    displayTransactions();
}


// ===============================
// PERIOD CHANGE
// ===============================

const salesPeriod =
    document.getElementById("salesPeriod");


if (salesPeriod) {

    salesPeriod.addEventListener(
        "change",
        updateSalesChart
    );
}


// ===============================
// REFRESH WHEN WINDOW GETS FOCUS
// ===============================

window.addEventListener(
    "focus",
    loadSalesData
);


// ===============================
// REFRESH WHEN LOCALSTORAGE CHANGES
// ===============================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "restaurantOrders"
        ) {
            loadSalesData();
        }
    }
);


// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function() {
        loadSalesData();
    }
);