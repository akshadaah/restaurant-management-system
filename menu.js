// =====================================================
// MENU MANAGEMENT SYSTEM
// =====================================================


// =====================================================
// LOCAL STORAGE
// =====================================================

const MENU_STORAGE_KEY = "restaurantMenu";


// =====================================================
// DEFAULT MENU ITEMS
// =====================================================

const defaultMenu = [

    {
        id: 1,
        name: "Paneer Pizza",
        category: "Main Course",
        price: 250,
        description: "Cheesy paneer pizza with fresh vegetables.",
        icon: "🍕",
        available: true
    },

    {
        id: 2,
        name: "Veg Burger",
        category: "Main Course",
        price: 180,
        description: "Crispy veggie burger with fresh toppings.",
        icon: "🍔",
        available: true
    },

    {
        id: 3,
        name: "White Sauce Pasta",
        category: "Main Course",
        price: 220,
        description: "Creamy Italian pasta with herbs.",
        icon: "🍝",
        available: true
    },

    {
        id: 4,
        name: "Club Sandwich",
        category: "Starters",
        price: 160,
        description: "Fresh vegetable sandwich with crispy bread.",
        icon: "🥪",
        available: true
    },

    {
        id: 5,
        name: "Cold Coffee",
        category: "Beverages",
        price: 120,
        description: "Chilled creamy coffee.",
        icon: "☕",
        available: true
    },

    {
        id: 6,
        name: "Chocolate Cake",
        category: "Desserts",
        price: 150,
        description: "Rich chocolate cake with creamy frosting.",
        icon: "🍰",
        available: true
    }

];


// =====================================================
// LOAD MENU
// =====================================================

let menuItems =
    JSON.parse(localStorage.getItem(MENU_STORAGE_KEY));


// First time only
if (!menuItems) {

    menuItems = defaultMenu;

    saveMenu();

}


// =====================================================
// DOM ELEMENTS
// =====================================================

const menuItemsGrid =
    document.getElementById("menuItemsGrid");

const menuSearch =
    document.getElementById("menuSearch");

const menuItemCount =
    document.getElementById("menuItemCount");

const categoryButtons =
    document.querySelectorAll(".menu-category");

const addMenuBtn =
    document.getElementById("addMenuBtn");

const menuModal =
    document.getElementById("menuModal");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelModalBtn =
    document.getElementById("cancelModalBtn");

const menuForm =
    document.getElementById("menuForm");

const modalTitle =
    document.getElementById("modalTitle");


// Form fields

const itemName =
    document.getElementById("itemName");

const itemCategory =
    document.getElementById("itemCategory");

const itemPrice =
    document.getElementById("itemPrice");

const itemIcon =
    document.getElementById("itemIcon");

const itemDescription =
    document.getElementById("itemDescription");

const itemAvailable =
    document.getElementById("itemAvailable");


// =====================================================
// CURRENT FILTER
// =====================================================

let selectedCategory = "All";

let editingItemId = null;


// =====================================================
// DISPLAY MENU
// =====================================================

function displayMenu() {

    const searchText =
        menuSearch.value.trim().toLowerCase();


    let filteredItems = menuItems.filter(function(item) {

        const matchesSearch =

            item.name.toLowerCase().includes(searchText) ||

            item.description.toLowerCase().includes(searchText) ||

            item.category.toLowerCase().includes(searchText);


        const matchesCategory =

            selectedCategory === "All" ||

            item.category === selectedCategory;


        return matchesSearch && matchesCategory;

    });


    menuItemsGrid.innerHTML = "";


    // Update count

    menuItemCount.textContent =

        filteredItems.length +
        (filteredItems.length === 1 ? " item" : " items");


    // No results

    if (filteredItems.length === 0) {

        menuItemsGrid.innerHTML = `

            <div class="no-menu-items">

                <div>
                    🍽️
                </div>

                <h3>
                    No menu items found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    // Create cards

    filteredItems.forEach(function(item) {

        const card =
            document.createElement("div");

        card.className =
            "menu-food-card";


        card.innerHTML = `

            <div class="menu-food-image">

                ${item.icon || "🍽️"}

            </div>


            <div class="menu-food-info">

                <span class="food-category">

                    ${item.category}

                </span>


                <h3>

                    ${item.name}

                </h3>


                <p>

                    ${item.description}

                </p>


                <div class="food-card-bottom">

                    <strong>

                        ₹${Number(item.price).toFixed(2)}

                    </strong>


                    <span class="availability
                        ${item.available ? "available" : "unavailable"}">

                        ${item.available
                            ? "Available"
                            : "Unavailable"}

                    </span>

                </div>


                <div class="food-actions">

                    <button
                        class="edit-btn"
                        onclick="editMenuItem(${item.id})"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteMenuItem(${item.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;


        menuItemsGrid.appendChild(card);

    });

}


// =====================================================
// SAVE MENU
// =====================================================

function saveMenu() {

    localStorage.setItem(
        MENU_STORAGE_KEY,
        JSON.stringify(menuItems)
    );

}


// =====================================================
// CATEGORY FILTER
// =====================================================

categoryButtons.forEach(function(button) {

    button.addEventListener("click", function() {


        categoryButtons.forEach(function(btn) {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        selectedCategory =
            button.dataset.category;


        displayMenu();

    });

});


// =====================================================
// SEARCH
// =====================================================

menuSearch.addEventListener(
    "input",
    function() {

        displayMenu();

    }
);


// =====================================================
// OPEN ADD MODAL
// =====================================================

addMenuBtn.addEventListener(
    "click",
    function() {

        openAddModal();

    }
);


// =====================================================
// OPEN ADD MODAL FUNCTION
// =====================================================

function openAddModal() {

    editingItemId = null;

    modalTitle.textContent =
        "Add New Item";


    menuForm.reset();


    itemAvailable.checked = true;


    menuModal.classList.add("show");

}


// =====================================================
// EDIT ITEM
// =====================================================

function editMenuItem(id) {

    const item =
        menuItems.find(function(menuItem) {

            return menuItem.id === id;

        });


    if (!item) {

        return;

    }


    editingItemId = id;


    modalTitle.textContent =
        "Edit Menu Item";


    itemName.value =
        item.name;

    itemCategory.value =
        item.category;

    itemPrice.value =
        item.price;

    itemIcon.value =
        item.icon;

    itemDescription.value =
        item.description;

    itemAvailable.checked =
        item.available;


    menuModal.classList.add("show");

}


// =====================================================
// DELETE ITEM
// =====================================================

function deleteMenuItem(id) {

    const item =
        menuItems.find(function(menuItem) {

            return menuItem.id === id;

        });


    if (!item) {

        return;

    }


    const confirmed =
        confirm(
            'Delete "' +
            item.name +
            '" from the menu?'
        );


    if (!confirmed) {

        return;

    }


    menuItems =
        menuItems.filter(function(menuItem) {

            return menuItem.id !== id;

        });


    saveMenu();

    displayMenu();

}


// =====================================================
// SAVE ITEM
// =====================================================

menuForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            itemName.value.trim();

        const category =
            itemCategory.value;

        const price =
            Number(itemPrice.value);

        const icon =
            itemIcon.value.trim() || "🍽️";

        const description =
            itemDescription.value.trim();

        const available =
            itemAvailable.checked;


        // Validation

        if (name === "") {

            alert("Please enter item name.");

            itemName.focus();

            return;

        }


        if (category === "") {

            alert("Please select a category.");

            itemCategory.focus();

            return;

        }


        if (price <= 0) {

            alert("Please enter a valid price.");

            itemPrice.focus();

            return;

        }


        if (description === "") {

            alert("Please enter a description.");

            itemDescription.focus();

            return;

        }


        // EDIT EXISTING ITEM

        if (editingItemId !== null) {

            const item =
                menuItems.find(function(menuItem) {

                    return menuItem.id === editingItemId;

                });


            if (item) {

                item.name =
                    name;

                item.category =
                    category;

                item.price =
                    price;

                item.icon =
                    icon;

                item.description =
                    description;

                item.available =
                    available;

            }

        }


        // ADD NEW ITEM

        else {

            const newItem = {

                id:
                    Date.now(),

                name:
                    name,

                category:
                    category,

                price:
                    price,

                description:
                    description,

                icon:
                    icon,

                available:
                    available

            };


            menuItems.push(newItem);

        }


        saveMenu();

        displayMenu();

        closeMenuModal();

    }
);


// =====================================================
// CLOSE MODAL
// =====================================================

closeModalBtn.addEventListener(
    "click",
    closeMenuModal
);


cancelModalBtn.addEventListener(
    "click",
    closeMenuModal
);


// =====================================================
// CLOSE WHEN CLICKING OUTSIDE
// =====================================================

menuModal.addEventListener(
    "click",
    function(event) {

        if (event.target === menuModal) {

            closeMenuModal();

        }

    }
);


// =====================================================
// CLOSE MODAL FUNCTION
// =====================================================

function closeMenuModal() {

    menuModal.classList.remove("show");

    editingItemId = null;

    menuForm.reset();

}


// =====================================================
// INITIAL DISPLAY
// =====================================================

displayMenu();