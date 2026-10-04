// =====================================================
// REPORTS MANAGEMENT
// =====================================================


// =====================================================
// LOAD DATA
// =====================================================

let orders =
    JSON.parse(
        localStorage.getItem(
            "restaurantOrders"
        )
    ) || [];


let expenses =
    JSON.parse(
        localStorage.getItem(
            "restaurantExpenses"
        )
    ) || [];


// =====================================================
// CURRENT REPORT DATA
// =====================================================

let currentReportData = [];

let currentReportTitle = "Restaurant Report";


// =====================================================
// HELPERS
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

    return Number(
        order.total
    ) || 0;
}


function getExpenseAmount(expense) {

    return Number(
        expense.amount
    ) || 0;
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
        String(
            expense.date
        ).split("-");


    if (parts.length === 3) {

        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );
    }


    return new Date(
        expense.date
    );
}


function isCompleted(order) {

    return String(
        order.status || ""
    )
        .toLowerCase()
        === "completed";
}


function isPaid(expense) {

    return String(
        expense.status || ""
    )
        .toLowerCase()
        === "paid";
}


function startOfDay(date) {

    const d =
        new Date(date);

    d.setHours(
        0,
        0,
        0,
        0
    );

    return d;
}


function startOfWeek(date) {

    const d =
        startOfDay(date);


    const day =
        d.getDay();


    const difference =
        day === 0
            ? 6
            : day - 1;


    d.setDate(
        d.getDate() -
        difference
    );


    return d;
}


function startOfMonth(date) {

    const d =
        startOfDay(date);


    d.setDate(1);


    return d;
}


function startOfYear(date) {

    const d =
        startOfDay(date);


    d.setMonth(
        0,
        1
    );


    return d;
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// GET SELECTED DATE RANGE
// =====================================================

function getSelectedDateRange() {

    const period =
        document.getElementById(
            "reportPeriod"
        ).value;


    const today =
        new Date();


    today.setHours(
        23,
        59,
        59,
        999
    );


    // -----------------------------------------------
    // THIS MONTH
    // -----------------------------------------------

    if (period === "month") {

        const start =
            startOfMonth(
                new Date()
            );


        return {
            start,
            end: today,
            label:
                "This Month"
        };
    }


    // -----------------------------------------------
    // THIS WEEK
    // -----------------------------------------------

    if (period === "week") {

        const start =
            startOfWeek(
                new Date()
            );


        return {
            start,
            end: today,
            label:
                "This Week"
        };
    }


    // -----------------------------------------------
    // THIS YEAR
    // -----------------------------------------------

    if (period === "year") {

        const start =
            startOfYear(
                new Date()
            );


        return {
            start,
            end: today,
            label:
                "This Year"
        };
    }


    // -----------------------------------------------
    // CUSTOM RANGE
    // -----------------------------------------------

    if (period === "custom") {

        const startInput =
            document.getElementById(
                "customStartDate"
            );


        const endInput =
            document.getElementById(
                "customEndDate"
            );


        if (
            !startInput.value ||
            !endInput.value
        ) {

            alert(
                "Please select both start and end dates."
            );


            return null;
        }


        const startParts =
            startInput.value.split("-");


        const endParts =
            endInput.value.split("-");


        const start =
            new Date(
                Number(startParts[0]),
                Number(startParts[1]) - 1,
                Number(startParts[2])
            );


        const end =
            new Date(
                Number(endParts[0]),
                Number(endParts[1]) - 1,
                Number(endParts[2])
            );


        end.setHours(
            23,
            59,
            59,
            999
        );


        if (start > end) {

            alert(
                "Start date cannot be after end date."
            );


            return null;
        }


        return {

            start,

            end,

            label:
                formatDate(start) +
                " - " +
                formatDate(end)

        };
    }


    return null;
}


// =====================================================
// CHECK DATE IN RANGE
// =====================================================

function isDateInRange(
    date,
    range
) {

    if (isNaN(date)) {

        return false;
    }


    return (
        date >= range.start &&
        date <= range.end
    );
}


// =====================================================
// GET FILTERED ORDERS
// =====================================================

function getFilteredOrders(range) {

    return orders.filter(order => {

        if (!isCompleted(order)) {

            return false;
        }


        const date =
            getOrderDate(order);


        return isDateInRange(
            date,
            range
        );

    });
}


// =====================================================
// GET FILTERED EXPENSES
// =====================================================

function getFilteredExpenses(range) {

    return expenses.filter(expense => {

        if (!isPaid(expense)) {

            return false;
        }


        const date =
            getExpenseDate(expense);


        return isDateInRange(
            date,
            range
        );

    });
}


// =====================================================
// CALCULATE REPORT SUMMARY
// =====================================================

function calculateSummary(range) {

    const filteredOrders =
        getFilteredOrders(
            range
        );


    const filteredExpenses =
        getFilteredExpenses(
            range
        );


    let sales = 0;

    let expenseTotal = 0;


    filteredOrders.forEach(order => {

        sales +=
            getOrderAmount(
                order
            );

    });


    filteredExpenses.forEach(expense => {

        expenseTotal +=
            getExpenseAmount(
                expense
            );

    });


    const profit =
        sales -
        expenseTotal;


    const margin =
        sales > 0
            ? (profit / sales) * 100
            : 0;


    return {

        sales,

        expenses:
            expenseTotal,

        profit,

        margin,

        orders:
            filteredOrders.length,

        expenseCount:
            filteredExpenses.length

    };
}


// =====================================================
// UPDATE SUMMARY CARDS
// =====================================================

function updateSummaryCards(
    summary
) {

    const salesElement =
        document.getElementById(
            "reportSales"
        );


    const expensesElement =
        document.getElementById(
            "reportExpenses"
        );


    const profitElement =
        document.getElementById(
            "reportProfit"
        );


    const ordersElement =
        document.getElementById(
            "reportOrders"
        );


    if (salesElement) {

        salesElement.textContent =
            formatCurrency(
                summary.sales
            );
    }


    if (expensesElement) {

        expensesElement.textContent =
            formatCurrency(
                summary.expenses
            );
    }


    if (profitElement) {

        profitElement.textContent =
            formatCurrency(
                summary.profit
            );


        if (
            summary.profit < 0
        ) {

            profitElement.style.color =
                "#d9534f";

        } else {

            profitElement.style.color =
                "";
        }
    }


    if (ordersElement) {

        ordersElement.textContent =
            summary.orders;
    }


    const salesInfo =
        document.getElementById(
            "reportSalesInfo"
        );


    const expenseInfo =
        document.getElementById(
            "reportExpensesInfo"
        );


    const profitInfo =
        document.getElementById(
            "reportProfitInfo"
        );


    const ordersInfo =
        document.getElementById(
            "reportOrdersInfo"
        );


    if (salesInfo) {

        salesInfo.textContent =
            summary.orders +
            " completed orders";
    }


    if (expenseInfo) {

        expenseInfo.textContent =
            summary.expenseCount +
            " paid expenses";
    }


    if (profitInfo) {

        profitInfo.textContent =
            summary.margin.toFixed(1) +
            "% profit margin";
    }


    if (ordersInfo) {

        ordersInfo.textContent =
            "Selected period";
    }
}


// =====================================================
// MONTHLY REPORT DATA
// =====================================================

function getYearlyReportData(
    year
) {

    const months = [

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


    return months.map(
        (
            monthName,
            monthIndex
        ) => {


            let sales = 0;

            let expense = 0;

            let orderCount = 0;

            let completedCount = 0;


            // ---------------------------------------
            // ORDERS
            // ---------------------------------------

            orders.forEach(order => {

                const date =
                    getOrderDate(
                        order
                    );


                if (isNaN(date)) {

                    return;
                }


                if (
                    date.getFullYear() ===
                    year
                    &&
                    date.getMonth() ===
                    monthIndex
                ) {

                    orderCount++;


                    if (
                        isCompleted(
                            order
                        )
                    ) {

                        sales +=
                            getOrderAmount(
                                order
                            );


                        completedCount++;
                    }
                }

            });


            // ---------------------------------------
            // EXPENSES
            // ---------------------------------------

            expenses.forEach(item => {

                const date =
                    getExpenseDate(
                        item
                    );


                if (isNaN(date)) {

                    return;
                }


                if (
                    date.getFullYear() ===
                    year
                    &&
                    date.getMonth() ===
                    monthIndex
                    &&
                    isPaid(item)
                ) {

                    expense +=
                        getExpenseAmount(
                            item
                        );
                }

            });


            const profit =
                sales -
                expense;


            const margin =
                sales > 0
                    ? (profit / sales) * 100
                    : 0;


            return {

                month:
                    monthName,

                sales,

                expenses:
                    expense,

                profit,

                margin,

                orders:
                    orderCount,

                completed:
                    completedCount

            };

        }
    );
}


// =====================================================
// CUSTOM / MONTH / WEEK REPORT
// =====================================================

function getPeriodReportData(
    range
) {

    const summary =
        calculateSummary(
            range
        );


    const period =
        document.getElementById(
            "reportPeriod"
        ).value;


    let label =
        range.label;


    if (period === "month") {

        const monthName =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    month: "long"
                }
            );


        label =
            monthName +
            " " +
            new Date().getFullYear();
    }


    return [{

        month:
            label,

        sales:
            summary.sales,

        expenses:
            summary.expenses,

        profit:
            summary.profit,

        margin:
            summary.margin,

        orders:
            summary.orders,

        completed:
            summary.orders

    }];
}


// =====================================================
// RENDER REPORT TABLE
// =====================================================

function renderReportTable(
    data,
    reportType
) {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {

        return;
    }


    // -----------------------------------------------
    // HEADERS
    // -----------------------------------------------

    let headers = [];


    if (reportType === "sales") {

        headers = [
            "Period",
            "Sales",
            "Orders",
            "Average Order",
            "Completed"
        ];

    }

    else if (
        reportType === "expense"
    ) {

        headers = [
            "Period",
            "Expenses",
            "Paid Expenses",
            "Average Expense",
            "Share"
        ];

    }

    else if (
        reportType === "profit"
    ) {

        headers = [
            "Period",
            "Sales",
            "Expenses",
            "Profit",
            "Margin"
        ];

    }

    else if (
        reportType === "orders"
    ) {

        headers = [
            "Period",
            "Total Orders",
            "Completed",
            "Other Orders",
            "Sales"
        ];

    }

    else {

        headers = [
            "Period",
            "Sales",
            "Expenses",
            "Profit",
            "Margin"
        ];
    }


    // -----------------------------------------------
    // HEADER
    // -----------------------------------------------

    table.innerHTML = `

        <div class="report-row report-heading">

            ${headers
                .map(
                    header =>
                        `<span>${header}</span>`
                )
                .join("")}

        </div>

    `;


    // -----------------------------------------------
    // CALCULATE TOTALS
    // -----------------------------------------------

    const totalSales =
        data.reduce(
            (
                total,
                item
            ) =>
                total +
                item.sales,
            0
        );


    const totalExpenses =
        data.reduce(
            (
                total,
                item
            ) =>
                total +
                item.expenses,
            0
        );


    // -----------------------------------------------
    // ROWS
    // -----------------------------------------------

    data.forEach(item => {

        let rowHTML = "";


        if (
            reportType ===
            "sales"
        ) {

            const average =
                item.orders > 0
                    ? item.sales /
                      item.orders
                    : 0;


            rowHTML = `

                <span>
                    ${item.month}
                </span>

                <strong>
                    ${formatCurrency(
                        item.sales
                    )}
                </strong>

                <span>
                    ${item.orders}
                </span>

                <strong>
                    ${formatCurrency(
                        average
                    )}
                </strong>

                <span>
                    ${item.completed}
                </span>

            `;

        }


        else if (
            reportType ===
            "expense"
        ) {

            const expenseCount =
                expenses.filter(
                    expense => {

                        const date =
                            getExpenseDate(
                                expense
                            );


                        return (
                            isPaid(expense) &&
                            isDateInRange(
                                date,
                                getCurrentRowRange(
                                    item
                                )
                            )
                        );

                    }
                ).length;


            const average =
                expenseCount > 0
                    ? item.expenses /
                      expenseCount
                    : 0;


            const share =
                totalExpenses > 0
                    ? (
                        item.expenses /
                        totalExpenses
                    ) * 100
                    : 0;


            rowHTML = `

                <span>
                    ${item.month}
                </span>

                <strong>
                    ${formatCurrency(
                        item.expenses
                    )}
                </strong>

                <span>
                    ${expenseCount}
                </span>

                <strong>
                    ${formatCurrency(
                        average
                    )}
                </strong>

                <span>
                    ${share.toFixed(1)}%
                </span>

            `;

        }


        else if (
            reportType ===
            "profit"
        ) {

            const profitClass =
                item.profit < 0
                    ? 'style="color:#d9534f !important;"'
                    : 'class="profit-text"';


            rowHTML = `

                <span>
                    ${item.month}
                </span>

                <strong>
                    ${formatCurrency(
                        item.sales
                    )}
                </strong>

                <span>
                    ${formatCurrency(
                        item.expenses
                    )}
                </span>

                <strong
                    ${profitClass}
                >
                    ${formatCurrency(
                        item.profit
                    )}
                </strong>

                <span>
                    ${item.margin.toFixed(1)}%
                </span>

            `;

        }


        else if (
            reportType ===
            "orders"
        ) {

            const otherOrders =
                Math.max(
                    0,
                    item.orders -
                    item.completed
                );


            rowHTML = `

                <span>
                    ${item.month}
                </span>

                <strong>
                    ${item.orders}
                </strong>

                <span>
                    ${item.completed}
                </span>

                <span>
                    ${otherOrders}
                </span>

                <strong>
                    ${formatCurrency(
                        item.sales
                    )}
                </strong>

            `;

        }


        else {

            const profitClass =
                item.profit < 0
                    ? 'style="color:#d9534f !important;"'
                    : 'class="profit-text"';


            rowHTML = `

                <span>
                    ${item.month}
                </span>

                <strong>
                    ${formatCurrency(
                        item.sales
                    )}
                </strong>

                <span>
                    ${formatCurrency(
                        item.expenses
                    )}
                </span>

                <strong
                    ${profitClass}
                >
                    ${formatCurrency(
                        item.profit
                    )}
                </strong>

                <span>
                    ${item.margin.toFixed(1)}%
                </span>

            `;
        }


        table.innerHTML += `

            <div class="report-row">

                ${rowHTML}

            </div>

        `;

    });


    // -----------------------------------------------
    // EMPTY DATA
    // -----------------------------------------------

    if (data.length === 0) {

        table.innerHTML += `

            <div class="report-row">

                <span
                    style="
                        grid-column:1/-1;
                        text-align:center;
                    "
                >
                    No report data available.
                </span>

            </div>

        `;
    }
}


// =====================================================
// HELPER FOR EXPENSE REPORT
// =====================================================

function getCurrentRowRange(
    item
) {

    const period =
        document.getElementById(
            "reportPeriod"
        ).value;


    const today =
        new Date();


    if (
        period === "month"
    ) {

        return {

            start:
                startOfMonth(
                    today
                ),

            end:
                today

        };
    }


    if (
        period === "week"
    ) {

        return {

            start:
                startOfWeek(
                    today
                ),

            end:
                today

        };
    }


    if (
        period === "year"
    ) {

        return {

            start:
                startOfYear(
                    today
                ),

            end:
                today

        };
    }


    const startInput =
        document.getElementById(
            "customStartDate"
        );


    const endInput =
        document.getElementById(
            "customEndDate"
        );


    if (
        startInput.value &&
        endInput.value
    ) {

        const startParts =
            startInput.value.split("-");


        const endParts =
            endInput.value.split("-");


        const start =
            new Date(
                Number(startParts[0]),
                Number(startParts[1]) - 1,
                Number(startParts[2])
            );


        const end =
            new Date(
                Number(endParts[0]),
                Number(endParts[1]) - 1,
                Number(endParts[2])
            );


        end.setHours(
            23,
            59,
            59,
            999
        );


        return {
            start,
            end
        };
    }


    return {
        start:
            new Date(0),

        end:
            new Date()
    };
}


// =====================================================
// GENERATE REPORT
// =====================================================

function generateReport() {

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


    const range =
        getSelectedDateRange();


    if (!range) {

        return;
    }


    const reportType =
        document.getElementById(
            "reportType"
        ).value;


    const period =
        document.getElementById(
            "reportPeriod"
        ).value;


    // -----------------------------------------------
    // SUMMARY
    // -----------------------------------------------

    const summary =
        calculateSummary(
            range
        );


    updateSummaryCards(
        summary
    );


    // -----------------------------------------------
    // REPORT DATA
    // -----------------------------------------------

    let reportData = [];


    if (
        period === "year"
    ) {

        reportData =
            getYearlyReportData(
                new Date().getFullYear()
            );

    }

    else {

        reportData =
            getPeriodReportData(
                range
            );

    }


    currentReportData =
        reportData;


    currentReportTitle =
        getReportTitle(
            reportType
        );


    // -----------------------------------------------
    // TABLE
    // -----------------------------------------------

    renderReportTable(
        reportData,
        reportType
    );


    // -----------------------------------------------
    // PERIOD LABEL
    // -----------------------------------------------

    const periodLabel =
        document.getElementById(
            "reportPeriodLabel"
        );


    if (periodLabel) {

        periodLabel.textContent =
            range.label;
    }


    const description =
        document.getElementById(
            "reportDescription"
        );


    if (description) {

        description.textContent =
            getReportDescription(
                reportType
            );
    }

}


// =====================================================
// REPORT TITLES
// =====================================================

function getReportTitle(
    type
) {

    const titles = {

        all:
            "Restaurant Financial Report",

        sales:
            "Sales Report",

        expense:
            "Expense Report",

        profit:
            "Profit Report",

        orders:
            "Order Report"

    };


    return (
        titles[type] ||
        "Restaurant Report"
    );
}


// =====================================================
// REPORT DESCRIPTION
// =====================================================

function getReportDescription(
    type
) {

    const descriptions = {

        all:
            "Sales, expenses and profit summary.",

        sales:
            "Detailed sales and completed order information.",

        expense:
            "Paid expenses and spending summary.",

        profit:
            "Profitability and margin analysis.",

        orders:
            "Order activity and completed order performance."

    };


    return (
        descriptions[type] ||
        descriptions.all
    );
}


// =====================================================
// EXPORT REPORT AS CSV
// =====================================================

function exportReport() {

    if (
        currentReportData.length ===
        0
    ) {

        alert(
            "Please generate a report first."
        );


        return;
    }


    const reportType =
        document.getElementById(
            "reportType"
        ).value;


    const rows = [];


    // -----------------------------------------------
    // HEADERS
    // -----------------------------------------------

    if (
        reportType === "sales"
    ) {

        rows.push([
            "Period",
            "Sales",
            "Orders",
            "Average Order",
            "Completed"
        ]);

    }

    else if (
        reportType === "expense"
    ) {

        rows.push([
            "Period",
            "Expenses",
            "Paid Expenses"
        ]);

    }

    else if (
        reportType === "orders"
    ) {

        rows.push([
            "Period",
            "Total Orders",
            "Completed",
            "Other Orders",
            "Sales"
        ]);

    }

    else {

        rows.push([
            "Period",
            "Sales",
            "Expenses",
            "Profit",
            "Margin"
        ]);
    }


    // -----------------------------------------------
    // DATA
    // -----------------------------------------------

    currentReportData.forEach(
        item => {

            if (
                reportType ===
                "sales"
            ) {

                const average =
                    item.orders > 0
                        ? item.sales /
                          item.orders
                        : 0;


                rows.push([

                    item.month,

                    item.sales.toFixed(2),

                    item.orders,

                    average.toFixed(2),

                    item.completed

                ]);

            }

            else if (
                reportType ===
                "expense"
            ) {

                rows.push([

                    item.month,

                    item.expenses.toFixed(2),

                    ""

                ]);

            }

            else if (
                reportType ===
                "orders"
            ) {

                rows.push([

                    item.month,

                    item.orders,

                    item.completed,

                    Math.max(
                        0,
                        item.orders -
                        item.completed
                    ),

                    item.sales.toFixed(2)

                ]);

            }

            else {

                rows.push([

                    item.month,

                    item.sales.toFixed(2),

                    item.expenses.toFixed(2),

                    item.profit.toFixed(2),

                    item.margin.toFixed(2) +
                    "%"

                ]);

            }

        }
    );


    // -----------------------------------------------
    // CSV
    // -----------------------------------------------

    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(value)
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        currentReportTitle
            .replace(
                /\s+/g,
                "_"
            )
            .toLowerCase() +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );
}


// =====================================================
// SHOW / HIDE CUSTOM DATE
// =====================================================

function updateCustomDateInputs() {

    const period =
        document.getElementById(
            "reportPeriod"
        ).value;


    const startInput =
        document.getElementById(
            "customStartDate"
        );


    const endInput =
        document.getElementById(
            "customEndDate"
        );


    if (
        period === "custom"
    ) {

        startInput.style.display =
            "block";


        endInput.style.display =
            "block";


        // Default dates

        if (!startInput.value) {

            const today =
                new Date();


            startInput.value =
                today
                    .toISOString()
                    .split("T")[0];
        }


        if (!endInput.value) {

            const today =
                new Date();


            endInput.value =
                today
                    .toISOString()
                    .split("T")[0];
        }

    }

    else {

        startInput.style.display =
            "none";


        endInput.style.display =
            "none";
    }
}


// =====================================================
// REPORT TYPE BUTTONS
// =====================================================

function setupReportTypeButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-report-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const type =
                    this.dataset.report;


                const reportType =
                    document.getElementById(
                        "reportType"
                    );


                reportType.value =
                    type;


                generateReport();


                window.scrollTo({

                    top: 0,

                    behavior:
                        "smooth"

                });

            }
        );

    });
}


// =====================================================
// LOAD DATA
// =====================================================

function loadReports() {

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


    generateReport();
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // Initial report

        loadReports();


        // Generate button

        const generateButton =
            document.getElementById(
                "generateReportBtn"
            );


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateReport
            );
        }


        // Export button

        const exportButton =
            document.getElementById(
                "exportReportBtn"
            );


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportReport
            );
        }


        // Period change

        const period =
            document.getElementById(
                "reportPeriod"
            );


        if (period) {

            period.addEventListener(
                "change",
                function () {

                    updateCustomDateInputs();

                    generateReport();

                }
            );
        }


        // Report type change

        const type =
            document.getElementById(
                "reportType"
            );


        if (type) {

            type.addEventListener(
                "change",
                generateReport
            );
        }


        // Report type cards

        setupReportTypeButtons();

    }
);


// =====================================================
// REFRESH WHEN PAGE GETS FOCUS
// =====================================================

window.addEventListener(
    "focus",
    loadReports
);


// =====================================================
// REFRESH WHEN STORAGE CHANGES
// =====================================================

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

            loadReports();
        }

    }
);