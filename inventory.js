/* =========================================
   INVENTORY MANAGEMENT
========================================= */

const STORAGE_KEY = "restaurantInventory";


// =========================================
// DEFAULT INVENTORY
// =========================================

const defaultInventory = [

    {
        id: 1,
        name: "Cheese",
        category: "Dairy",
        stock: 2,
        minimum: 5,
        unit: "kg",
        cost: 450,
        icon: "🧀"
    },

    {
        id: 2,
        name: "Tomatoes",
        category: "Vegetables",
        stock: 4,
        minimum: 3,
        unit: "kg",
        cost: 80,
        icon: "🍅"
    },

    {
        id: 3,
        name: "Flour",
        category: "Grains",
        stock: 25,
        minimum: 10,
        unit: "kg",
        cost: 50,
        icon: "🌾"
    },

    {
        id: 4,
        name: "Chicken",
        category: "Meat",
        stock: 12,
        minimum: 5,
        unit: "kg",
        cost: 280,
        icon: "🍗"
    },

    {
        id: 5,
        name: "Milk",
        category: "Dairy",
        stock: 1,
        minimum: 5,
        unit: "litre",
        cost: 65,
        icon: "🥛"
    },

    {
        id: 6,
        name: "Cold Drink",
        category: "Beverages",
        stock: 0,
        minimum: 10,
        unit: "bottles",
        cost: 40,
        icon: "🥤"
    },

    {
        id: 7,
        name: "Rice",
        category: "Grains",
        stock: 30,
        minimum: 10,
        unit: "kg",
        cost: 70,
        icon: "🍚"
    },

    {
        id: 8,
        name: "Cooking Oil",
        category: "Other",
        stock: 8,
        minimum: 5,
        unit: "litre",
        cost: 150,
        icon: "🫗"
    }

];


// =========================================
// LOAD INVENTORY
// =========================================

let inventory =
    JSON.parse(localStorage.getItem(STORAGE_KEY))
    || defaultInventory;


// =========================================
// ELEMENTS
// =========================================

const inventoryRows =
    document.getElementById("inventoryRows");

const searchInput =
    document.getElementById("inventorySearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const totalItems =
    document.getElementById("totalItems");

const lowStock =
    document.getElementById("lowStock");

const outOfStock =
    document.getElementById("outOfStock");

const stockValue =
    document.getElementById("stockValue");


// Modal

const inventoryModal =
    document.getElementById("inventoryModal");

const deleteModal =
    document.getElementById("deleteModal");

const inventoryForm =
    document.getElementById("inventoryForm");

const modalTitle =
    document.getElementById("modalTitle");

const modalSubtitle =
    document.getElementById("modalSubtitle");

const addStockBtn =
    document.getElementById("addStockBtn");

const modalClose =
    document.getElementById("modalClose");

const modalCancel =
    document.getElementById("modalCancel");


// Form fields

const itemName =
    document.getElementById("itemName");

const itemCategory =
    document.getElementById("itemCategory");

const itemStock =
    document.getElementById("itemStock");

const itemMinimum =
    document.getElementById("itemMinimum");

const itemUnit =
    document.getElementById("itemUnit");

const itemCost =
    document.getElementById("itemCost");


// Delete

const deleteItemName =
    document.getElementById("deleteItemName");

const deleteCancel =
    document.getElementById("deleteCancel");

const deleteConfirm =
    document.getElementById("deleteConfirm");


// =========================================
// EDITING STATE
// =========================================

let editingId = null;

let deletingId = null;


// =========================================
// SAVE DATA
// =========================================

function saveInventory() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(inventory)
    );

}


// =========================================
// STATUS
// =========================================

function getStatus(item) {

    if (Number(item.stock) <= 0) {

        return {
            text: "Out of Stock",
            className: "out"
        };

    }


    if (Number(item.stock) <= Number(item.minimum)) {

        return {
            text: "Low Stock",
            className: "low"
        };

    }


    return {
        text: "In Stock",
        className: "good"
    };

}


// =========================================
// FORMAT NUMBER
// =========================================

function formatNumber(number) {

    return Number(number).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2
        }
    );

}


// =========================================
// RENDER INVENTORY
// =========================================

function renderInventory() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    const filteredInventory =
        inventory.filter(item => {


            const matchesSearch =
                item.name
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "All"
                ||
                item.category === selectedCategory;


            return matchesSearch && matchesCategory;

        });


    inventoryRows.innerHTML = "";


    if (filteredInventory.length === 0) {

        inventoryRows.innerHTML = `

            <div class="inventory-empty">

                <span>📦</span>

                <h3>No inventory items found</h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        updateSummary();

        return;

    }


    filteredInventory.forEach(item => {

        const status =
            getStatus(item);


        const row =
            document.createElement("div");

        row.className =
            "inventory-row";


        row.innerHTML = `

            <div class="inventory-item-name">

                <span class="inventory-item-icon">

                    ${item.icon || "📦"}

                </span>

                <strong>
                    ${item.name}
                </strong>

            </div>


            <span>
                ${item.category}
            </span>


            <span>
                ${formatNumber(item.stock)}
                ${item.unit}
            </span>


            <span>
                ${formatNumber(item.minimum)}
                ${item.unit}
            </span>


            <span>
                ${item.unit}
            </span>


            <span class="stock-badge ${status.className}">

                ${status.text}

            </span>


            <div class="inventory-action-buttons">

                <button
                    class="stock-action"
                    onclick="editItem(${item.id})"
                >
                    Update
                </button>


                <button
                    class="stock-delete-action"
                    onclick="openDeleteModal(${item.id})"
                >
                    Delete
                </button>

            </div>

        `;


        inventoryRows.appendChild(row);

    });


    updateSummary();

}


// =========================================
// UPDATE SUMMARY
// =========================================

function updateSummary() {

    const total =
        inventory.length;


    const low =
        inventory.filter(item =>
            Number(item.stock) > 0 &&
            Number(item.stock) <= Number(item.minimum)
        ).length;


    const out =
        inventory.filter(item =>
            Number(item.stock) <= 0
        ).length;


    const value =
        inventory.reduce(
            (sum, item) =>
                sum +
                (Number(item.stock) * Number(item.cost)),
            0
        );


    totalItems.textContent =
        total;


    lowStock.textContent =
        low;


    outOfStock.textContent =
        out;


    stockValue.textContent =
        "₹" +
        formatNumber(value);

}


// =========================================
// OPEN ADD MODAL
// =========================================

function openAddModal() {

    editingId = null;


    modalTitle.textContent =
        "Add Inventory Item";


    modalSubtitle.textContent =
        "Add a new item to your inventory.";


    inventoryForm.reset();


    inventoryModal.classList.add("show");

    itemName.focus();

}


// =========================================
// EDIT ITEM
// =========================================

function editItem(id) {

    const item =
        inventory.find(
            item => item.id === id
        );


    if (!item) return;


    editingId = id;


    modalTitle.textContent =
        "Update Inventory Item";


    modalSubtitle.textContent =
        "Update stock and item details.";


    itemName.value =
        item.name;


    itemCategory.value =
        item.category;


    itemStock.value =
        item.stock;


    itemMinimum.value =
        item.minimum;


    itemUnit.value =
        item.unit;


    itemCost.value =
        item.cost;


    inventoryModal.classList.add("show");

}


// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {

    inventoryModal.classList.remove("show");

    editingId = null;

}


// =========================================
// SAVE ITEM
// =========================================

inventoryForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            itemName.value.trim();


        const category =
            itemCategory.value;


        const stock =
            Number(itemStock.value);


        const minimum =
            Number(itemMinimum.value);


        const unit =
            itemUnit.value;


        const cost =
            Number(itemCost.value);


        if (
            !name ||
            !category ||
            !unit ||
            stock < 0 ||
            minimum < 0 ||
            cost < 0
        ) {

            return;

        }


        if (editingId !== null) {


            const item =
                inventory.find(
                    item => item.id === editingId
                );


            if (item) {

                item.name =
                    name;

                item.category =
                    category;

                item.stock =
                    stock;

                item.minimum =
                    minimum;

                item.unit =
                    unit;

                item.cost =
                    cost;

            }

        } else {


            const newItem = {

                id:
                    Date.now(),

                name:
                    name,

                category:
                    category,

                stock:
                    stock,

                minimum:
                    minimum,

                unit:
                    unit,

                cost:
                    cost,

                icon:
                    getCategoryIcon(category)

            };


            inventory.push(newItem);

        }


        saveInventory();

        renderInventory();

        closeModal();

    }
);


// =========================================
// CATEGORY ICON
// =========================================

function getCategoryIcon(category) {

    const icons = {

        Vegetables: "🥬",

        Dairy: "🥛",

        Grains: "🌾",

        Meat: "🍗",

        Beverages: "🥤",

        Other: "📦"

    };


    return icons[category] || "📦";

}


// =========================================
// DELETE MODAL
// =========================================

function openDeleteModal(id) {

    const item =
        inventory.find(
            item => item.id === id
        );


    if (!item) return;


    deletingId =
        id;


    deleteItemName.textContent =
        item.name;


    deleteModal.classList.add("show");

}


function closeDeleteModal() {

    deleteModal.classList.remove("show");

    deletingId = null;

}


// =========================================
// CONFIRM DELETE
// =========================================

deleteConfirm.addEventListener(
    "click",
    function() {

        if (deletingId === null) return;


        inventory =
            inventory.filter(
                item =>
                    item.id !== deletingId
            );


        saveInventory();

        renderInventory();

        closeDeleteModal();

    }
);


// =========================================
// EVENTS
// =========================================

addStockBtn.addEventListener(
    "click",
    openAddModal
);


modalClose.addEventListener(
    "click",
    closeModal
);


modalCancel.addEventListener(
    "click",
    closeModal
);


deleteCancel.addEventListener(
    "click",
    closeDeleteModal
);


searchInput.addEventListener(
    "input",
    renderInventory
);


categoryFilter.addEventListener(
    "change",
    renderInventory
);


// =========================================
// CLOSE MODALS ON BACKDROP CLICK
// =========================================

inventoryModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === inventoryModal
        ) {

            closeModal();

        }

    }
);


deleteModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === deleteModal
        ) {

            closeDeleteModal();

        }

    }
);


// =========================================
// INITIAL LOAD
// =========================================

renderInventory();