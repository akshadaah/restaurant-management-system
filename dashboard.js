/* =========================================================
   DASHBOARD
   Real data from localStorage
========================================================= */


/* =========================================================
   LOAD DATA
========================================================= */

let orders =
    JSON.parse(localStorage.getItem("restaurantOrders")) || [];

let expenses =
    JSON.parse(localStorage.getItem("restaurantExpenses")) || [];

let inventory =
    JSON.parse(localStorage.getItem("restaurantInventory")) || [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadProfile();

    updateDashboard();

});


/* =========================================================
   MAIN DASHBOARD UPDATE
========================================================= */

function updateDashboard() {

    // Reload latest data from localStorage

    orders =
        JSON.parse(localStorage.getItem("restaurantOrders")) || [];

    expenses =
        JSON.parse(localStorage.getItem("restaurantExpenses")) || [];

    inventory =
        JSON.parse(localStorage.getItem("restaurantInventory")) || [];


    updateSummaryCards();

    updateRevenueChart();

    updateProfitAnalysis();

    updateInventoryAlerts();

    updateRecentOrders();

}


/* =========================================================
   PROFILE
========================================================= */

function loadProfile() {

    /*
        Settings page may store profile information.
        We try common storage keys and fall back safely.
    */

    const profileData =
        JSON.parse(localStorage.getItem("restaurantProfile")) ||
        JSON.parse(localStorage.getItem("adminProfile")) ||
        null;


    const profileName =
        document.getElementById("profileName");

    const profileInitials =
        document.getElementById("profileInitials");


    if (!profileData) {

        if (profileName) {
            profileName.textContent = "Restaurant Admin";
        }

        if (profileInitials) {
            profileInitials.textContent = "RA";
        }

        return;
    }


    const name =
        profileData.fullName ||
        profileData.name ||
        "Restaurant Admin";


    if (profileName) {

        profileName.textContent = name;

    }


    if (profileInitials) {

        profileInitials.textContent =
            getInitials(name);

    }

}


/* =========================================================
   SUMMARY CARDS
========================================================= */

function updateSummaryCards() {

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );


    /*
        TODAY'S ORDERS

        All orders placed today are counted.
    */

    const todayOrders =
        orders.filter(order =>
            isSameDay(
                getOrderDate(order),
                today
            )
        );


    const yesterdayOrders =
        orders.filter(order =>
            isSameDay(
                getOrderDate(order),
                yesterday
            )
        );


    /*
        TODAY'S SALES

        Only completed orders count as sales.
    */

    const todaySales =
        todayOrders
            .filter(isCompletedOrder)
            .reduce(
                (sum, order) =>
                    sum + getOrderTotal(order),
                0
            );


    const yesterdaySales =
        yesterdayOrders
            .filter(isCompletedOrder)
            .reduce(
                (sum, order) =>
                    sum + getOrderTotal(order),
                0
            );


    /*
        TODAY'S EXPENSES

        Paid expenses count.
    */

    const todayExpenses =
        expenses
            .filter(expense =>
                isSameDay(
                    getExpenseDate(expense),
                    today
                )
            )
            .filter(isPaidExpense)
            .reduce(
                (sum, expense) =>
                    sum + getExpenseAmount(expense),
                0
            );


    const yesterdayExpenses =
        expenses
            .filter(expense =>
                isSameDay(
                    getExpenseDate(expense),
                    yesterday
                )
            )
            .filter(isPaidExpense)
            .reduce(
                (sum, expense) =>
                    sum + getExpenseAmount(expense),
                0
            );


    /*
        TODAY'S PROFIT
    */

    const todayProfit =
        todaySales - todayExpenses;


    const yesterdayProfit =
        yesterdaySales - yesterdayExpenses;


    /* =========================
       UPDATE HTML
    ========================== */

    setText(
        "todayOrders",
        todayOrders.length
    );


    setText(
        "todaySales",
        formatCurrency(todaySales)
    );


    setText(
        "todayExpenses",
        formatCurrency(todayExpenses)
    );


    setText(
        "todayProfit",
        formatCurrency(todayProfit)
    );


    /*
        Comparison text
    */

    updateComparison(
        "ordersComparison",
        todayOrders.length,
        yesterdayOrders.length,
        "orders"
    );


    updateComparison(
        "salesComparison",
        todaySales,
        yesterdaySales,
        "sales"
    );


    updateComparison(
        "expenseComparison",
        todayExpenses,
        yesterdayExpenses,
        "expenses"
    );


    updateProfitComparison(
        todayProfit,
        yesterdayProfit
    );


    /*
        Profit color
    */

    const profitElement =
        document.getElementById("todayProfit");


    if (profitElement) {

        if (todayProfit >= 0) {

            profitElement.style.color =
                "#155d27";

        } else {

            profitElement.style.color =
                "#d97706";

        }

    }

}


/* =========================================================
   REVENUE CHART
========================================================= */

function updateRevenueChart() {

    const currentYear =
        new Date().getFullYear();


    const monthlyRevenue =
        new Array(12).fill(0);


    /*
        Add only completed order revenue.
    */

    orders
        .filter(isCompletedOrder)
        .forEach(order => {

            const date =
                getOrderDate(order);

            if (!date) {
                return;
            }


            if (
                date.getFullYear() ===
                currentYear
            ) {

                const month =
                    date.getMonth();

                monthlyRevenue[month] +=
                    getOrderTotal(order);

            }

        });


    const maxRevenue =
        Math.max(
            ...monthlyRevenue,
            0
        );


    /*
        Y axis
    */

    updateRevenueYAxis(maxRevenue);


    /*
        Bars
    */

    const barsContainer =
        document.getElementById(
            "revenueBars"
        );


    if (!barsContainer) {
        return;
    }


    barsContainer.innerHTML = "";


    const monthNames = [
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


    monthlyRevenue.forEach(
        (amount, index) => {

            const group =
                document.createElement("div");

            group.className =
                "bar-group";


            const bar =
                document.createElement("div");

            bar.className =
                "bar";


            let height = 0;


            if (maxRevenue > 0) {

                height =
                    (amount / maxRevenue) * 100;

            }


            /*
                Keep tiny values visible.
            */

            if (
                amount > 0 &&
                height < 4
            ) {

                height = 4;

            }


            bar.style.height =
                `${height}%`;


            bar.title =
                `${monthNames[index]}: ${formatCurrency(amount)}`;


            const label =
                document.createElement("span");

            label.textContent =
                monthNames[index];


            group.appendChild(bar);

            group.appendChild(label);

            barsContainer.appendChild(group);

        }
    );

}


/* =========================================================
   REVENUE Y AXIS
========================================================= */

function updateRevenueYAxis(maxRevenue) {

    const yAxis =
        document.getElementById(
            "revenueYAxis"
        );


    if (!yAxis) {
        return;
    }


    let step = 0;


    if (maxRevenue > 0) {

        step =
            roundChartValue(
                maxRevenue / 5
            );

    }


    const values = [

        step * 5,
        step * 4,
        step * 3,
        step * 2,
        step,
        0

    ];


    yAxis.innerHTML = "";


    values.forEach(value => {

        const span =
            document.createElement("span");

        span.textContent =
            formatShortCurrency(value);

        yAxis.appendChild(span);

    });

}


/* =========================================================
   PROFIT ANALYSIS
========================================================= */

function updateProfitAnalysis() {

    const now =
        new Date();


    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    /*
        Current month's completed revenue
    */

    const monthlyRevenue =
        orders
            .filter(isCompletedOrder)
            .filter(order => {

                const date =
                    getOrderDate(order);

                return date &&
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear;

            })
            .reduce(
                (sum, order) =>
                    sum + getOrderTotal(order),
                0
            );


    /*
        Current month's paid expenses
    */

    const monthlyExpenses =
        expenses
            .filter(isPaidExpense)
            .filter(expense => {

                const date =
                    getExpenseDate(expense);

                return date &&
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear;

            })
            .reduce(
                (sum, expense) =>
                    sum + getExpenseAmount(expense),
                0
            );


    const profit =
        monthlyRevenue -
        monthlyExpenses;


    let margin = 0;


    if (monthlyRevenue > 0) {

        margin =
            (profit / monthlyRevenue) * 100;

    }


    /*
        Update values
    */

    setText(
        "dashboardNetProfit",
        formatCurrency(profit)
    );


    setText(
        "dashboardRevenue",
        formatCurrency(monthlyRevenue)
    );


    setText(
        "dashboardExpenses",
        formatCurrency(monthlyExpenses)
    );


    setText(
        "dashboardProfitMargin",
        `${formatNumber(margin)}% margin`
    );


    /*
        Profit color
    */

    const profitText =
        document.getElementById(
            "dashboardNetProfit"
        );


    if (profitText) {

        profitText.style.color =
            profit >= 0
                ? "#155d27"
                : "#d97706";

    }


    /*
        Status
    */

    const status =
        document.getElementById(
            "profitStatus"
        );


    if (status) {

        if (profit > 0) {

            status.textContent =
                "Healthy";

            status.style.backgroundColor =
                "#e8f3e9";

            status.style.color =
                "#238636";

        } else if (profit < 0) {

            status.textContent =
                "Loss";

            status.style.backgroundColor =
                "#fff1df";

            status.style.color =
                "#d97706";

        } else {

            status.textContent =
                "Break-even";

            status.style.backgroundColor =
                "#f7f5ed";

            status.style.color =
                "#777";

        }

    }


    /*
        Dynamic profit circle
    */

    updateProfitCircle(
        monthlyRevenue,
        monthlyExpenses
    );

}


/* =========================================================
   PROFIT CIRCLE
========================================================= */

function updateProfitCircle(
    revenue,
    expensesAmount
) {

    const circle =
        document.getElementById(
            "profitCircle"
        );


    if (!circle) {
        return;
    }


    const total =
        revenue +
        expensesAmount;


    if (total <= 0) {

        circle.style.background =
            "conic-gradient(#e8f3e9 0deg 360deg)";

        return;

    }


    const revenueDegree =
        (revenue / total) * 360;


    /*
        When profitable:
        Revenue = green
        Remaining = light green

        When loss:
        Revenue = green
        Expenses = orange
    */

    if (revenue >= expensesAmount) {

        circle.style.background =
            `conic-gradient(
                #155d27 0deg ${revenueDegree}deg,
                #e8f3e9 ${revenueDegree}deg 360deg
            )`;

    } else {

        circle.style.background =
            `conic-gradient(
                #155d27 0deg ${revenueDegree}deg,
                #f0a34a ${revenueDegree}deg 360deg
            )`;

    }

}


/* =========================================================
   INVENTORY ALERTS
========================================================= */

function updateInventoryAlerts() {

    const container =
        document.getElementById(
            "dashboardInventoryList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!inventory.length) {

        container.innerHTML = `
            <div class="inventory-item">

                <div class="inventory-info">

                    <div class="inventory-icon good-stock">
                        📦
                    </div>

                    <div>

                        <strong>No inventory items</strong>

                        <span>
                            Add items from Inventory
                        </span>

                    </div>

                </div>

            </div>
        `;

        return;

    }


    /*
        Show items that need attention first.
    */

    const sortedInventory =
        [...inventory].sort(
            (a, b) => {

                return (
                    getInventoryPriority(b) -
                    getInventoryPriority(a)
                );

            }
        );


    /*
        Dashboard shows maximum 4 items.
    */

    const itemsToShow =
        sortedInventory.slice(0, 4);


    itemsToShow.forEach(item => {

        const status =
            getInventoryStatus(item);


        const statusClass =
            getInventoryStatusClass(status);


        const icon =
            getInventoryIcon(item);


        const quantity =
            item.quantity ??
            item.stock ??
            item.currentStock ??
            0;


        const unit =
            item.unit ||
            "";


        const row =
            document.createElement("div");

        row.className =
            "inventory-item";


        row.innerHTML = `

            <div class="inventory-info">

                <div class="inventory-icon ${statusClass.icon}">
                    ${icon}
                </div>

                <div>

                    <strong>
                        ${escapeHTML(
                            item.name ||
                            item.itemName ||
                            "Inventory Item"
                        )}
                    </strong>

                    <span>
                        ${quantity}
                        ${unit}
                        remaining
                    </span>

                </div>

            </div>


            <span class="stock-status ${statusClass.status}">
                ${status}
            </span>

        `;


        container.appendChild(row);

    });

}


/* =========================================================
   RECENT ORDERS
========================================================= */

function updateRecentOrders() {

    const container =
        document.getElementById(
            "dashboardOrdersList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!orders.length) {

        container.innerHTML = `

            <div class="order-item">

                <div class="order-details">

                    <strong>
                        No orders yet
                    </strong>

                    <span>
                        New orders will appear here.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    /*
        Sort newest first.
    */

    const recentOrders =
        [...orders]
            .sort(
                (a, b) =>
                    getOrderDate(b) -
                    getOrderDate(a)
            )
            .slice(0, 4);


    recentOrders.forEach(order => {

        const row =
            document.createElement("div");

        row.className =
            "order-item";


        const items =
            order.items || [];


        const itemText =
            getOrderItemsText(items);


        const date =
            getOrderDate(order);


        const dateText =
            formatOrderDate(date);


        const status =
            normalizeStatus(
                order.status
            );


        const statusClass =
            getOrderStatusClass(status);


        row.innerHTML = `

            <div class="order-number">

                <strong>
                    #${escapeHTML(
                        order.orderId ||
                        order.id ||
                        "N/A"
                    )}
                </strong>

                <span>
                    Table ${escapeHTML(
                        order.tableNumber ||
                        "-"
                    )}
                </span>

            </div>


            <div class="order-details">

                <strong>
                    ${escapeHTML(itemText)}
                </strong>

                <span>
                    ${dateText}
                </span>

            </div>


            <div class="order-amount">

                <strong>
                    ${formatCurrency(
                        getOrderTotal(order)
                    )}
                </strong>

                <span class="order-status ${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>

        `;


        container.appendChild(row);

    });

}


/* =========================================================
   ORDER HELPERS
========================================================= */

function isCompletedOrder(order) {

    return normalizeStatus(
        order.status
    ).toLowerCase() === "completed";

}


function getOrderTotal(order) {

    return Number(
        order.total ||
        0
    );

}


function getOrderDate(order) {

    return parseDate(
        order.orderDate ||
        order.date ||
        order.createdAt
    );

}


/* =========================================================
   EXPENSE HELPERS
========================================================= */

function isPaidExpense(expense) {

    const status =
        normalizeStatus(
            expense.status
        ).toLowerCase();


    /*
        If status doesn't exist,
        still allow the expense to count.
    */

    if (!status) {
        return true;
    }


    return (
        status === "paid" ||
        status === "completed"
    );

}


function getExpenseAmount(expense) {

    return Number(
        expense.amount ||
        0
    );

}


function getExpenseDate(expense) {

    return parseDate(
        expense.date ||
        expense.expenseDate ||
        expense.createdAt
    );

}


/* =========================================================
   INVENTORY HELPERS
========================================================= */

function getInventoryStatus(item) {

    const existingStatus =
        String(
            item.status || ""
        ).trim();


    /*
        Use existing inventory status
        if available.
    */

    if (existingStatus) {

        return existingStatus;

    }


    const quantity =
        Number(
            item.quantity ??
            item.stock ??
            item.currentStock ??
            0
        );


    const minimum =
        Number(
            item.minimumStock ??
            item.minStock ??
            item.reorderLevel ??
            5
        );


    if (quantity <= 0) {

        return "Out of Stock";

    }


    if (quantity <= minimum) {

        return "Low Stock";

    }


    if (quantity <= minimum * 2) {

        return "Reorder Soon";

    }


    return "In Stock";

}


function getInventoryStatusClass(status) {

    const normalized =
        status
            .toLowerCase()
            .replace(/\s+/g, " ");


    if (
        normalized.includes("out") ||
        normalized.includes("low")
    ) {

        return {
            icon: "low-stock",
            status: "danger"
        };

    }


    if (
        normalized.includes("reorder") ||
        normalized.includes("warning")
    ) {

        return {
            icon: "warning-stock",
            status: "warning"
        };

    }


    return {
        icon: "good-stock",
        status: "good"
    };

}


function getInventoryPriority(item) {

    const status =
        getInventoryStatus(item)
            .toLowerCase();


    if (
        status.includes("out")
    ) {
        return 4;
    }


    if (
        status.includes("low")
    ) {
        return 3;
    }


    if (
        status.includes("reorder")
    ) {
        return 2;
    }


    return 1;

}


function getInventoryIcon(item) {

    if (item.icon) {

        return item.icon;

    }


    const name =
        String(
            item.name ||
            item.itemName ||
            ""
        ).toLowerCase();


    const icons = {

        cheese: "🧀",

        tomato: "🍅",

        tomatoes: "🍅",

        flour: "🌾",

        chicken: "🍗",

        milk: "🥛",

        coffee: "☕",

        rice: "🍚",

        oil: "🫗",

        vegetable: "🥬",

        vegetables: "🥬",

        paneer: "🧀"

    };


    for (const key in icons) {

        if (name.includes(key)) {

            return icons[key];

        }

    }


    return "📦";

}


/* =========================================================
   DATE HELPERS
========================================================= */

function parseDate(value) {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {

        return isNaN(value.getTime())
            ? null
            : value;

    }


    const date =
        new Date(value);


    if (!isNaN(date.getTime())) {

        return date;

    }


    /*
        Handle DD/MM/YYYY
    */

    if (
        typeof value === "string" &&
        value.includes("/")
    ) {

        const parts =
            value.split("/");


        if (parts.length === 3) {

            const day =
                Number(parts[0]);

            const month =
                Number(parts[1]) - 1;

            const year =
                Number(parts[2]);


            const customDate =
                new Date(
                    year,
                    month,
                    day
                );


            if (
                !isNaN(
                    customDate.getTime()
                )
            ) {

                return customDate;

            }

        }

    }


    return null;

}


function isSameDay(date1, date2) {

    if (!date1 || !date2) {
        return false;
    }


    return (
        date1.getFullYear() ===
            date2.getFullYear() &&

        date1.getMonth() ===
            date2.getMonth() &&

        date1.getDate() ===
            date2.getDate()
    );

}


/* =========================================================
   FORMATTING
========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount) || 0
    );

}


function formatShortCurrency(amount) {

    amount =
        Number(amount) || 0;


    if (amount >= 100000) {

        return `₹${(
            amount / 100000
        ).toFixed(1)}L`;

    }


    if (amount >= 1000) {

        return `₹${(
            amount / 1000
        ).toFixed(1)}K`;

    }


    return `₹${Math.round(amount)}`;

}


function formatNumber(number) {

    return Number(
        number || 0
    ).toFixed(1);

}


function roundChartValue(value) {

    if (value <= 0) {
        return 0;
    }


    const magnitude =
        Math.pow(
            10,
            Math.floor(
                Math.log10(value)
            )
        );


    const normalized =
        value / magnitude;


    let rounded;


    if (normalized <= 1) {

        rounded = 1;

    } else if (normalized <= 2) {

        rounded = 2;

    } else if (normalized <= 5) {

        rounded = 5;

    } else {

        rounded = 10;

    }


    return rounded * magnitude;

}


/* =========================================================
   ORDER DISPLAY HELPERS
========================================================= */

function getOrderItemsText(items) {

    if (!items || !items.length) {

        return "Order items";

    }


    const firstItem =
        items[0];


    const firstName =
        firstItem.name ||
        "Item";


    const firstQuantity =
        Number(
            firstItem.quantity
        ) || 1;


    if (items.length === 1) {

        return `${firstName} × ${firstQuantity}`;

    }


    return `${firstName} × ${firstQuantity} + ${
        items.length - 1
    } more`;

}


function formatOrderDate(date) {

    if (!date) {

        return "Date unavailable";

    }


    const today =
        new Date();


    if (
        isSameDay(
            date,
            today
        )
    ) {

        return (
            "Today, " +
            date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            )
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


function normalizeStatus(status) {

    if (!status) {

        return "Pending";

    }


    return String(status);

}


function getOrderStatusClass(status) {

    const normalized =
        status.toLowerCase();


    if (
        normalized === "completed" ||
        normalized === "paid"
    ) {

        return "paid";

    }


    return "pending";

}


/* =========================================================
   COMPARISON
========================================================= */

function updateComparison(
    elementId,
    current,
    previous,
    type
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    if (
        current === 0 &&
        previous === 0
    ) {

        element.textContent =
            `No ${type} yet`;

        return;

    }


    if (previous === 0) {

        element.textContent =
            `↑ New ${type} today`;

        element.className =
            "positive";

        return;

    }


    const percentage =
        (
            (current - previous) /
            previous
        ) * 100;


    const rounded =
        Math.abs(
            Math.round(
                percentage
            )
        );


    if (percentage > 0) {

        element.textContent =
            `↑ ${rounded}% from yesterday`;

        element.className =
            "positive";

    } else if (percentage < 0) {

        element.textContent =
            `↓ ${rounded}% from yesterday`;

        element.className =
            "negative";

    } else {

        element.textContent =
            "Same as yesterday";

        element.className =
            "positive";

    }

}


/* =========================================================
   PROFIT COMPARISON
========================================================= */

function updateProfitComparison(
    current,
    previous
) {

    const element =
        document.getElementById(
            "profitComparison"
        );


    if (!element) {
        return;
    }


    if (
        current === 0 &&
        previous === 0
    ) {

        element.textContent =
            "Revenue − Expenses";

        element.className =
            "positive";

        return;

    }


    const difference =
        current -
        previous;


    if (difference > 0) {

        element.textContent =
            `↑ ${formatCurrency(
                difference
            )} vs yesterday`;

        element.className =
            "positive";

    } else if (difference < 0) {

        element.textContent =
            `↓ ${formatCurrency(
                Math.abs(difference)
            )} vs yesterday`;

        element.className =
            "negative";

    } else {

        element.textContent =
            "Same as yesterday";

        element.className =
            "positive";

    }

}


/* =========================================================
   UTILITY
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


function getInitials(name) {

    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word =>
            word.charAt(0).toUpperCase()
        )
        .join("");

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   AUTO REFRESH
========================================================= */

/*
    If another page changes localStorage
    in another browser tab, dashboard updates.
*/

window.addEventListener(
    "storage",
    function () {

        updateDashboard();

    }
);


/*
    Refresh when returning to dashboard.
*/

window.addEventListener(
    "focus",
    function () {

        updateDashboard();

    }
);