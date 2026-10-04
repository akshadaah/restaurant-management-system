// ============================================
// PROFITABILITY MANAGEMENT
// ============================================


// ============================================
// LOAD DATA
// ============================================

let orders =
    JSON.parse(
        localStorage.getItem("restaurantOrders")
    ) || [];


let expenses =
    JSON.parse(
        localStorage.getItem("restaurantExpenses")
    ) || [];


// ============================================
// BASIC HELPERS
// ============================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}


function getOrderDate(order) {

    return new Date(
        order.orderDate ||
        order.date ||
        order.createdAt
    );
}


function getExpenseDate(expense) {

    if (!expense.date) {
        return new Date(NaN);
    }


    const parts =
        String(expense.date).split("-");


    if (parts.length === 3) {

        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );
    }


    return new Date(expense.date);
}


function isCompletedOrder(order) {

    return String(
        order.status || ""
    ).toLowerCase() === "completed";
}


function isPaidExpense(expense) {

    return String(
        expense.status || ""
    ).toLowerCase() === "paid";
}


function getOrderAmount(order) {

    return Number(order.total) || 0;
}


function getExpenseAmount(expense) {

    return Number(expense.amount) || 0;
}


// ============================================
// CALCULATE TOTALS
// ============================================

function calculateTotalFinancials() {

    let totalRevenue = 0;

    let totalExpenses = 0;

    let completedOrderCount = 0;

    let paidExpenseCount = 0;


    // ========================================
    // REVENUE
    // ========================================

    orders.forEach(order => {

        if (!isCompletedOrder(order)) {
            return;
        }


        totalRevenue +=
            getOrderAmount(order);


        completedOrderCount++;

    });


    // ========================================
    // EXPENSES
    // ========================================

    expenses.forEach(expense => {

        if (!isPaidExpense(expense)) {
            return;
        }


        totalExpenses +=
            getExpenseAmount(expense);


        paidExpenseCount++;

    });


    // ========================================
    // PROFIT
    // ========================================

    const netProfit =
        totalRevenue -
        totalExpenses;


    let profitMargin = 0;


    if (totalRevenue > 0) {

        profitMargin =
            (netProfit /
                totalRevenue) *
            100;
    }


    // ========================================
    // UPDATE HTML
    // ========================================

    const revenueElement =
        document.getElementById(
            "totalRevenue"
        );


    const expensesElement =
        document.getElementById(
            "totalExpenses"
        );


    const profitElement =
        document.getElementById(
            "netProfit"
        );


    const marginElement =
        document.getElementById(
            "profitMargin"
        );


    if (revenueElement) {

        revenueElement.textContent =
            formatCurrency(
                totalRevenue
            );
    }


    if (expensesElement) {

        expensesElement.textContent =
            formatCurrency(
                totalExpenses
            );
    }


    if (profitElement) {

        profitElement.textContent =
            formatCurrency(
                netProfit
            );
    }


    if (marginElement) {

        marginElement.textContent =
            profitMargin.toFixed(1) +
            "%";
    }


    // ========================================
    // INFO
    // ========================================

    const revenueInfo =
        document.getElementById(
            "revenueInfo"
        );


    const expenseInfo =
        document.getElementById(
            "expenseInfo"
        );


    const profitInfo =
        document.getElementById(
            "profitInfo"
        );


    const marginInfo =
        document.getElementById(
            "marginInfo"
        );


    if (revenueInfo) {

        revenueInfo.textContent =
            completedOrderCount +
            " completed orders";
    }


    if (expenseInfo) {

        expenseInfo.textContent =
            paidExpenseCount +
            " paid expenses";
    }


    if (profitInfo) {

        profitInfo.textContent =
            "Revenue − Expenses";
    }


    if (marginInfo) {

        marginInfo.textContent =
            "Based on total revenue";
    }


    // Negative profit styling

    if (profitElement) {

        if (netProfit < 0) {

            profitElement.style.color =
                "#d9534f";

        } else {

            profitElement.style.color =
                "";
        }
    }


    return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin
    };
}


// ============================================
// MONTHLY FINANCIAL DATA
// ============================================

function getMonthlyData(year) {

    const monthlyData = [];


    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    for (
        let month = 0;
        month < 12;
        month++
    ) {

        let revenue = 0;

        let expense = 0;


        // ====================================
        // REVENUE
        // ====================================

        orders.forEach(order => {

            if (!isCompletedOrder(order)) {
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

                revenue +=
                    getOrderAmount(order);
            }

        });


        // ====================================
        // EXPENSES
        // ====================================

        expenses.forEach(item => {

            if (!isPaidExpense(item)) {
                return;
            }


            const date =
                getExpenseDate(item);


            if (isNaN(date)) {
                return;
            }


            if (
                date.getFullYear() === year &&
                date.getMonth() === month
            ) {

                expense +=
                    getExpenseAmount(item);
            }

        });


        const profit =
            revenue - expense;


        monthlyData.push({

            month:
                monthNames[month],

            shortMonth:
                monthNames[month].substring(
                    0,
                    3
                ),

            revenue:
                revenue,

            expense:
                expense,

            profit:
                profit
        });

    }


    return monthlyData;
}


// ============================================
// REVENUE VS EXPENSE CHART
// ============================================

function updateProfitChart() {

    const periodSelect =
        document.getElementById(
            "profitPeriod"
        );


    const selectedPeriod =
        periodSelect
            ? periodSelect.value
            : "thisYear";


    const currentYear =
        new Date().getFullYear();


    const year =
        selectedPeriod === "lastYear"
            ? currentYear - 1
            : currentYear;


    const monthlyData =
        getMonthlyData(year);


    renderProfitChart(
        monthlyData
    );
}


// ============================================
// RENDER PROFIT CHART
// ============================================

function renderProfitChart(data) {

    const barsContainer =
        document.getElementById(
            "profitBars"
        );


    const yAxis =
        document.getElementById(
            "profitYAxis"
        );


    if (!barsContainer || !yAxis) {
        return;
    }


    barsContainer.innerHTML = "";

    yAxis.innerHTML = "";


    // Find highest value between revenue
    // and expenses

    const maxValue =
        Math.max(
            ...data.flatMap(
                item => [
                    item.revenue,
                    item.expense
                ]
            ),
            0
        );


    // ========================================
    // Y AXIS
    // ========================================

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


    // ========================================
    // BARS
    // ========================================

    data.forEach(item => {

        const group =
            document.createElement(
                "div"
            );


        group.className =
            "profit-bar-group";


        // Revenue bar

        const revenueBar =
            document.createElement(
                "div"
            );


        revenueBar.className =
            "profit-bar revenue-bar";


        let revenueHeight = 0;


        if (
            maxValue > 0 &&
            item.revenue > 0
        ) {

            revenueHeight =
                (item.revenue /
                    maxValue) *
                100;


            revenueHeight =
                Math.max(
                    revenueHeight,
                    3
                );
        }


        revenueBar.style.height =
            revenueHeight + "%";


        revenueBar.title =
            "Revenue: " +
            formatCurrency(
                item.revenue
            );


        // Expense bar

        const expenseBar =
            document.createElement(
                "div"
            );


        expenseBar.className =
            "profit-bar expense-bar-chart";


        let expenseHeight = 0;


        if (
            maxValue > 0 &&
            item.expense > 0
        ) {

            expenseHeight =
                (item.expense /
                    maxValue) *
                100;


            expenseHeight =
                Math.max(
                    expenseHeight,
                    3
                );
        }


        expenseBar.style.height =
            expenseHeight + "%";


        expenseBar.title =
            "Expenses: " +
            formatCurrency(
                item.expense
            );


        // Label

        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            item.shortMonth;


        group.appendChild(
            revenueBar
        );


        group.appendChild(
            expenseBar
        );


        group.appendChild(
            label
        );


        barsContainer.appendChild(
            group
        );

    });
}


// ============================================
// CURRENT MONTH PROFIT ANALYSIS
// ============================================

function updateCurrentMonthAnalysis() {

    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentYear =
        today.getFullYear();


    let revenue = 0;

    let expense = 0;


    // ========================================
    // CURRENT MONTH REVENUE
    // ========================================

    orders.forEach(order => {

        if (!isCompletedOrder(order)) {
            return;
        }


        const date =
            getOrderDate(order);


        if (isNaN(date)) {
            return;
        }


        if (
            date.getMonth() ===
            currentMonth
            &&
            date.getFullYear() ===
            currentYear
        ) {

            revenue +=
                getOrderAmount(order);
        }

    });


    // ========================================
    // CURRENT MONTH EXPENSES
    // ========================================

    expenses.forEach(item => {

        if (!isPaidExpense(item)) {
            return;
        }


        const date =
            getExpenseDate(item);


        if (isNaN(date)) {
            return;
        }


        if (
            date.getMonth() ===
            currentMonth
            &&
            date.getFullYear() ===
            currentYear
        ) {

            expense +=
                getExpenseAmount(item);
        }

    });


    const profit =
        revenue - expense;


    let margin = 0;


    if (revenue > 0) {

        margin =
            (profit / revenue) *
            100;
    }


    // ========================================
    // UPDATE HTML
    // ========================================

    const profitElement =
        document.getElementById(
            "currentMonthProfit"
        );


    const marginElement =
        document.getElementById(
            "currentMonthMargin"
        );


    const revenueElement =
        document.getElementById(
            "currentMonthRevenue"
        );


    const expenseElement =
        document.getElementById(
            "currentMonthExpenses"
        );


    if (profitElement) {

        profitElement.textContent =
            formatCurrency(
                profit
            );
    }


    if (marginElement) {

        marginElement.textContent =
            margin.toFixed(1) +
            "% margin";
    }


    if (revenueElement) {

        revenueElement.textContent =
            formatCurrency(
                revenue
            );
    }


    if (expenseElement) {

        expenseElement.textContent =
            formatCurrency(
                expense
            );
    }


    // ========================================
    // PROFIT CIRCLE
    // ========================================

    const circle =
        document.getElementById(
            "profitCircle"
        );


    if (circle) {

        if (revenue <= 0) {

            circle.style.background =
                "conic-gradient(#e8f3e9 0deg 360deg)";

        } else {

            const percentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        margin
                    )
                );


            const degrees =
                percentage * 3.6;


            circle.style.background =
                `conic-gradient(
                    #155d27 0deg ${degrees}deg,
                    #e8f3e9 ${degrees}deg 360deg
                )`;
        }
    }


    // ========================================
    // HEALTH STATUS
    // ========================================

    const status =
        document.getElementById(
            "profitStatus"
        );


    const healthText =
        document.getElementById(
            "profitHealthText"
        );


    if (profit < 0) {

        if (status) {

            status.textContent =
                "Loss";
        }


        if (healthText) {

            healthText.textContent =
                "Expenses are currently higher than revenue.";
        }

    }

    else if (margin < 10) {

        if (status) {

            status.textContent =
                "Low Profit";
        }


        if (healthText) {

            healthText.textContent =
                "Your restaurant is profitable, but the current margin is low.";
        }

    }

    else {

        if (status) {

            status.textContent =
                "Healthy";
        }


        if (healthText) {

            healthText.textContent =
                "Your restaurant is currently operating profitably.";
        }
    }
}


// ============================================
// MONTHLY PROFIT LIST
// ============================================

function updateMonthlyProfitList() {

    const container =
        document.getElementById(
            "monthlyProfitList"
        );


    if (!container) {
        return;
    }


    const currentYear =
        new Date().getFullYear();


    const monthlyData =
        getMonthlyData(
            currentYear
        );


    const maxProfit =
        Math.max(
            ...monthlyData.map(
                item => Math.max(
                    item.profit,
                    0
                )
            ),
            0
        );


    container.innerHTML =
        monthlyData
            .map(item => {

                let width = 0;


                if (
                    maxProfit > 0 &&
                    item.profit > 0
                ) {

                    width =
                        (item.profit /
                            maxProfit) *
                        100;
                }


                const profitColor =
                    item.profit < 0
                        ? "#d9534f"
                        : "";


                return `

                    <div
                        class="monthly-profit-row"
                    >

                        <span>
                            ${item.month}
                        </span>


                        <div
                            class="profit-progress"
                        >

                            <div
                                class="profit-progress-bar"
                                style="
                                    width: ${width}%;
                                    background-color: ${profitColor};
                                "
                            >
                            </div>

                        </div>


                        <strong
                            style="
                                color: ${profitColor};
                            "
                        >
                            ${formatCurrency(
                                item.profit
                            )}
                        </strong>

                    </div>

                `;
            })
            .join("");
}


// ============================================
// COMPACT CURRENCY
// ============================================

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


// ============================================
// LOAD EVERYTHING
// ============================================

function loadProfitabilityData() {

    orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantOrders"
            )
        ) || [];


    expenses =
        JSON.parse(
            localStorage.getItem(
                "restaurantExpenses"
            )
        ) || [];


    calculateTotalFinancials();

    updateProfitChart();

    updateCurrentMonthAnalysis();

    updateMonthlyProfitList();
}


// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfitabilityData();


        const period =
            document.getElementById(
                "profitPeriod"
            );


        if (period) {

            period.addEventListener(
                "change",
                updateProfitChart
            );
        }

    }
);


// ============================================
// REFRESH WHEN PAGE GETS FOCUS
// ============================================

window.addEventListener(
    "focus",
    loadProfitabilityData
);


// ============================================
// REFRESH WHEN LOCAL STORAGE CHANGES
// ============================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
                "restaurantOrders"
            ||
            event.key ===
                "restaurantExpenses"
        ) {

            loadProfitabilityData();
        }

    }
);