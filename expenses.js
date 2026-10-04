// ============================================
// EXPENSE MANAGEMENT
// ============================================


// ============================================
// LOAD EXPENSES
// ============================================

let expenses =
    JSON.parse(
        localStorage.getItem("restaurantExpenses")
    ) || [];


// ============================================
// BASIC HELPERS
// ============================================

function saveExpenses() {

    localStorage.setItem(
        "restaurantExpenses",
        JSON.stringify(expenses)
    );
}


function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
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


// ============================================
// DATE HELPERS
// ============================================

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


function startOfDay(date) {

    const d = new Date(date);

    d.setHours(0, 0, 0, 0);

    return d;
}


function startOfWeek(date) {

    const d = startOfDay(date);

    const day = d.getDay();

    const difference =
        day === 0 ? 6 : day - 1;

    d.setDate(
        d.getDate() - difference
    );

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


function formatExpenseDate(expense) {

    const date =
        getExpenseDate(expense);


    if (isNaN(date)) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ============================================
// GENERATE EXPENSE ID
// ============================================

function generateExpenseId() {

    let highestNumber = 0;


    expenses.forEach(expense => {

        const id =
            String(expense.expenseId || "");


        const number =
            parseInt(
                id.replace(/\D/g, ""),
                10
            );


        if (!isNaN(number)) {

            highestNumber =
                Math.max(
                    highestNumber,
                    number
                );
        }
    });


    const nextNumber =
        highestNumber + 1;


    return (
        "EXP" +
        String(nextNumber).padStart(3, "0")
    );
}


// ============================================
// CALCULATE SUMMARY
// ============================================

function updateExpenseSummary() {

    const today =
        new Date();

    const todayStart =
        startOfDay(today);

    const weekStart =
        startOfWeek(today);

    const monthStart =
        startOfMonth(today);


    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;


    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;


    expenses.forEach(expense => {

        const date =
            getExpenseDate(expense);

        const amount =
            Number(expense.amount) || 0;


        if (isNaN(date)) {
            return;
        }


        // TODAY

        if (date >= todayStart) {

            todayTotal += amount;

            todayCount++;
        }


        // WEEK

        if (date >= weekStart) {

            weekTotal += amount;

            weekCount++;
        }


        // MONTH

        if (date >= monthStart) {

            monthTotal += amount;

            monthCount++;
        }

    });


    // Average daily expense
    // based on days elapsed in current month

    const dayOfMonth =
        today.getDate();


    const averageDaily =
        dayOfMonth > 0
            ? monthTotal / dayOfMonth
            : 0;


    // ========================================
    // UPDATE HTML
    // ========================================

    const todayElement =
        document.getElementById(
            "todayExpenses"
        );


    const weekElement =
        document.getElementById(
            "weekExpenses"
        );


    const monthElement =
        document.getElementById(
            "monthExpenses"
        );


    const averageElement =
        document.getElementById(
            "averageDailyExpense"
        );


    if (todayElement) {

        todayElement.textContent =
            formatCurrency(todayTotal);
    }


    if (weekElement) {

        weekElement.textContent =
            formatCurrency(weekTotal);
    }


    if (monthElement) {

        monthElement.textContent =
            formatCurrency(monthTotal);
    }


    if (averageElement) {

        averageElement.textContent =
            formatCurrency(averageDaily);
    }


    // Info text

    const todayInfo =
        document.getElementById(
            "todayExpenseInfo"
        );


    const weekInfo =
        document.getElementById(
            "weekExpenseInfo"
        );


    const monthInfo =
        document.getElementById(
            "monthExpenseInfo"
        );


    const averageInfo =
        document.getElementById(
            "averageExpenseInfo"
        );


    if (todayInfo) {

        todayInfo.textContent =
            todayCount +
            (todayCount === 1
                ? " expense"
                : " expenses");
    }


    if (weekInfo) {

        weekInfo.textContent =
            weekCount +
            (weekCount === 1
                ? " expense"
                : " expenses");
    }


    if (monthInfo) {

        monthInfo.textContent =
            monthCount +
            (monthCount === 1
                ? " expense"
                : " expenses");
    }


    if (averageInfo) {

        averageInfo.textContent =
            "Based on current month";
    }
}


// ============================================
// EXPENSE CHART
// ============================================

function updateExpenseChart() {

    const periodSelect =
        document.getElementById(
            "expensePeriod"
        );


    const selectedPeriod =
        periodSelect
            ? periodSelect.value
            : "thisYear";


    const currentYear =
        new Date().getFullYear();


    const selectedYear =
        selectedPeriod === "lastYear"
            ? currentYear - 1
            : currentYear;


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


    const monthlyData =
        monthNames.map(
            (month, index) => {

                let total = 0;


                expenses.forEach(expense => {

                    const date =
                        getExpenseDate(expense);


                    if (isNaN(date)) {
                        return;
                    }


                    if (
                        date.getFullYear() ===
                        selectedYear
                        &&
                        date.getMonth() ===
                        index
                    ) {

                        total +=
                            Number(
                                expense.amount
                            ) || 0;
                    }

                });


                return {
                    label: month,
                    amount: total
                };
            }
        );


    renderExpenseChart(
        monthlyData
    );
}


// ============================================
// RENDER EXPENSE CHART
// ============================================

function renderExpenseChart(data) {

    const barsContainer =
        document.getElementById(
            "expenseBars"
        );


    const yAxis =
        document.getElementById(
            "expenseYAxis"
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


        yAxis.appendChild(label);
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
            "bar-group";


        const bar =
            document.createElement(
                "div"
            );


        bar.className =
            "bar expense-bar";


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
// CATEGORY BREAKDOWN
// ============================================

function updateCategoryBreakdown() {

    const container =
        document.getElementById(
            "expenseCategoryList"
        );


    if (!container) {
        return;
    }


    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentYear =
        today.getFullYear();


    const categoryTotals = {};


    expenses.forEach(expense => {

        const date =
            getExpenseDate(expense);


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

            const category =
                expense.category ||
                "Other Expenses";


            const amount =
                Number(expense.amount) ||
                0;


            if (!categoryTotals[category]) {

                categoryTotals[category] =
                    0;
            }


            categoryTotals[category] +=
                amount;
        }

    });


    const categoryNames = [
        "Food & Ingredients",
        "Staff Salaries",
        "Utilities",
        "Rent",
        "Other Expenses"
    ];


    const dotClasses = {
        "Food & Ingredients":
            "food-dot",

        "Staff Salaries":
            "staff-dot",

        "Utilities":
            "utility-dot",

        "Rent":
            "rent-dot",

        "Other Expenses":
            "other-dot"
    };


    container.innerHTML = "";


    categoryNames.forEach(category => {

        const amount =
            categoryTotals[category] || 0;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "expense-category";


        row.innerHTML = `

            <div class="category-info">

                <span
                    class="category-dot ${dotClasses[category]}"
                ></span>

                <span>
                    ${escapeHTML(category)}
                </span>

            </div>

            <strong>
                ${formatCurrency(amount)}
            </strong>

        `;


        container.appendChild(row);
    });
}


// ============================================
// DISPLAY RECENT EXPENSES
// ============================================

function displayExpenses() {

    const container =
        document.getElementById(
            "expensesContainer"
        );


    if (!container) {
        return;
    }


    const sortedExpenses =
        [...expenses]
            .sort((a, b) => {

                const dateA =
                    getExpenseDate(a);

                const dateB =
                    getExpenseDate(b);


                const createdA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();


                const createdB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();


                if (
                    dateB.getTime() !==
                    dateA.getTime()
                ) {

                    return (
                        dateB - dateA
                    );
                }


                return (
                    createdB -
                    createdA
                );
            })
            .slice(0, 10);


    // No expenses

    if (
        sortedExpenses.length ===
        0
    ) {

        container.innerHTML = `

            <div
                class="expense-row"
            >

                <span
                    style="
                        grid-column: 1 / -1;
                        text-align: center;
                    "
                >
                    No expenses recorded yet.
                </span>

            </div>

        `;

        return;
    }


    // Display rows

    container.innerHTML =
        sortedExpenses
            .map(expense => {

                const status =
                    String(
                        expense.status ||
                        "Paid"
                    );


                const statusClass =
                    status.toLowerCase() ===
                    "pending"
                        ? "pending"
                        : "paid";


                return `

                    <div
                        class="expense-row"
                    >

                        <span
                            class="expense-id"
                        >
                            #${escapeHTML(
                                expense.expenseId
                            )}
                        </span>


                        <span>
                            ${formatExpenseDate(
                                expense
                            )}
                        </span>


                        <span>
                            ${escapeHTML(
                                expense.category
                            )}
                        </span>


                        <span>
                            ${escapeHTML(
                                expense.description
                            )}
                        </span>


                        <strong>
                            ${formatCurrency(
                                expense.amount
                            )}
                        </strong>


                        <span
                            class="
                                expense-status
                                ${statusClass}
                            "
                        >
                            ${escapeHTML(status)}
                        </span>

                    </div>

                `;
            })
            .join("");
}


// ============================================
// ADD EXPENSE
// ============================================

function addExpense() {

    const category =
        document.getElementById(
            "expenseCategory"
        ).value;


    const date =
        document.getElementById(
            "expenseDate"
        ).value;


    const description =
        document.getElementById(
            "expenseDescription"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        );


    const paymentMethod =
        document.getElementById(
            "expensePayment"
        ).value;


    const status =
        document.getElementById(
            "expenseStatus"
        ).value;


    // ========================================
    // VALIDATION
    // ========================================

    if (!category) {

        alert(
            "Please select an expense category."
        );

        return;
    }


    if (!date) {

        alert(
            "Please select an expense date."
        );

        return;
    }


    if (!description) {

        alert(
            "Please enter an expense description."
        );

        return;
    }


    if (!amount || amount <= 0) {

        alert(
            "Please enter a valid expense amount."
        );

        return;
    }


    // ========================================
    // CREATE EXPENSE
    // ========================================

    const newExpense = {

        expenseId:
            generateExpenseId(),

        date:
            date,

        category:
            category,

        description:
            description,

        amount:
            amount,

        paymentMethod:
            paymentMethod,

        status:
            status,

        createdAt:
            new Date().toISOString()
    };


    // Add to array

    expenses.push(
        newExpense
    );


    // Save

    saveExpenses();


    // Refresh page data

    loadExpenseData();


    // Close modal

    closeExpenseModal();


    // Clear form

    resetExpenseForm();


    alert(
        "Expense added successfully!"
    );
}


// ============================================
// RESET FORM
// ============================================

function resetExpenseForm() {

    const category =
        document.getElementById(
            "expenseCategory"
        );


    const date =
        document.getElementById(
            "expenseDate"
        );


    const description =
        document.getElementById(
            "expenseDescription"
        );


    const amount =
        document.getElementById(
            "expenseAmount"
        );


    const payment =
        document.getElementById(
            "expensePayment"
        );


    const status =
        document.getElementById(
            "expenseStatus"
        );


    if (category) {
        category.value =
            "Food & Ingredients";
    }


    if (date) {
        date.value =
            getTodayDate();
    }


    if (description) {
        description.value =
            "";
    }


    if (amount) {
        amount.value =
            "";
    }


    if (payment) {
        payment.value =
            "Cash";
    }


    if (status) {
        status.value =
            "Paid";
    }
}


// ============================================
// GET TODAY DATE
// ============================================

function getTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


// ============================================
// OPEN MODAL
// ============================================

function openExpenseModal() {

    const modal =
        document.getElementById(
            "expenseForm"
        );


    if (modal) {

        modal.style.display =
            "flex";
    }


    // Default date

    const date =
        document.getElementById(
            "expenseDate"
        );


    if (
        date &&
        !date.value
    ) {

        date.value =
            getTodayDate();
    }
}


// ============================================
// CLOSE MODAL
// ============================================

function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseForm"
        );


    if (modal) {

        modal.style.display =
            "none";
    }
}


// ============================================
// LOAD ALL EXPENSE DATA
// ============================================

function loadExpenseData() {

    expenses =
        JSON.parse(
            localStorage.getItem(
                "restaurantExpenses"
            )
        ) || [];


    updateExpenseSummary();

    updateExpenseChart();

    updateCategoryBreakdown();

    displayExpenses();
}


// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // Initial data

        loadExpenseData();


        // Set today's date

        const date =
            document.getElementById(
                "expenseDate"
            );


        if (date) {

            date.value =
                getTodayDate();
        }


        // Open button

        const openButton =
            document.getElementById(
                "openExpenseBtn"
            );


        if (openButton) {

            openButton.addEventListener(
                "click",
                openExpenseModal
            );
        }


        // Close button

        const closeButton =
            document.getElementById(
                "closeExpenseBtn"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeExpenseModal
            );
        }


        // Cancel button

        const cancelButton =
            document.getElementById(
                "cancelExpenseBtn"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeExpenseModal
            );
        }


        // Save button

        const saveButton =
            document.getElementById(
                "saveExpenseBtn"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                addExpense
            );
        }


        // Chart period

        const period =
            document.getElementById(
                "expensePeriod"
            );


        if (period) {

            period.addEventListener(
                "change",
                updateExpenseChart
            );
        }


        // Close modal when clicking outside

        const modal =
            document.getElementById(
                "expenseForm"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeExpenseModal();
                    }

                }
            );
        }

    }
);


// ============================================
// REFRESH WHEN PAGE GETS FOCUS
// ============================================

window.addEventListener(
    "focus",
    loadExpenseData
);


// ============================================
// REFRESH WHEN LOCAL STORAGE CHANGES
// ============================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "restaurantExpenses"
        ) {

            loadExpenseData();
        }

    }
);