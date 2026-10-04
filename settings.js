// =====================================================
// SETTINGS MANAGEMENT
// =====================================================


// =====================================================
// DEFAULT SETTINGS
// =====================================================

const defaultSettings = {

    profile: {

        name: "Akshada",

        email: "admin@restaurant.com"

    },


    restaurant: {

        name: "Restaurant",

        phone: "+91 98765 43210",

        email: "restaurant@example.com",

        openingTime: "10:00",

        closingTime: "23:00",

        currency: "INR"

    },


    notifications: {

        lowStock: true,

        newOrder: true,

        dailySales: false

    }

};


// =====================================================
// LOAD SETTINGS
// =====================================================

function getSettings() {

    const savedSettings =
        JSON.parse(
            localStorage.getItem(
                "restaurantSettings"
            )
        );


    if (!savedSettings) {

        localStorage.setItem(
            "restaurantSettings",
            JSON.stringify(
                defaultSettings
            )
        );


        return structuredClone(
            defaultSettings
        );
    }


    return {

        profile: {

            ...defaultSettings.profile,

            ...(savedSettings.profile || {})

        },


        restaurant: {

            ...defaultSettings.restaurant,

            ...(savedSettings.restaurant || {})

        },


        notifications: {

            ...defaultSettings.notifications,

            ...(savedSettings.notifications || {})

        }

    };
}


// =====================================================
// SAVE SETTINGS
// =====================================================

function saveSettings(settings) {

    localStorage.setItem(
        "restaurantSettings",
        JSON.stringify(
            settings
        )
    );
}


// =====================================================
// UPDATE AVATAR
// =====================================================

function updateAvatar(name) {

    const avatar =
        document.getElementById(
            "settingsAvatar"
        );


    if (!avatar) {
        return;
    }


    const cleanName =
        String(name || "")
            .trim();


    if (!cleanName) {

        avatar.textContent = "A";

        return;
    }


    const words =
        cleanName.split(/\s+/);


    let initials = "";


    if (words.length >= 2) {

        initials =
            words[0].charAt(0) +
            words[words.length - 1].charAt(0);

    } else {

        initials =
            words[0].substring(
                0,
                2
            );
    }


    avatar.textContent =
        initials.toUpperCase();
}


// =====================================================
// LOAD PROFILE
// =====================================================

function loadProfile(settings) {

    document.getElementById(
        "adminName"
    ).value =
        settings.profile.name;


    document.getElementById(
        "adminEmail"
    ).value =
        settings.profile.email;


    updateAvatar(
        settings.profile.name
    );
}


// =====================================================
// LOAD RESTAURANT INFORMATION
// =====================================================

function loadRestaurantInfo(settings) {

    document.getElementById(
        "restaurantName"
    ).value =
        settings.restaurant.name;


    document.getElementById(
        "restaurantPhone"
    ).value =
        settings.restaurant.phone;


    document.getElementById(
        "restaurantEmail"
    ).value =
        settings.restaurant.email;


    document.getElementById(
        "openingTime"
    ).value =
        settings.restaurant.openingTime;


    document.getElementById(
        "closingTime"
    ).value =
        settings.restaurant.closingTime;


    document.getElementById(
        "currency"
    ).value =
        settings.restaurant.currency;
}


// =====================================================
// LOAD NOTIFICATIONS
// =====================================================

function loadNotifications(settings) {

    document.getElementById(
        "lowStockNotifications"
    ).checked =
        settings.notifications.lowStock;


    document.getElementById(
        "newOrderNotifications"
    ).checked =
        settings.notifications.newOrder;


    document.getElementById(
        "dailySalesNotifications"
    ).checked =
        settings.notifications.dailySales;
}


// =====================================================
// SAVE PROFILE
// =====================================================

function saveProfile() {

    const name =
        document.getElementById(
            "adminName"
        ).value.trim();


    const email =
        document.getElementById(
            "adminEmail"
        ).value.trim();


    if (!name) {

        alert(
            "Please enter your full name."
        );

        return;
    }


    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert(
            "Please enter a valid email address."
        );

        return;
    }


    const settings =
        getSettings();


    settings.profile.name =
        name;


    settings.profile.email =
        email;


    saveSettings(
        settings
    );


    updateAvatar(
        name
    );


    alert(
        "Profile saved successfully! ✅"
    );
}


// =====================================================
// SAVE RESTAURANT INFORMATION
// =====================================================

function saveRestaurantInfo() {

    const name =
        document.getElementById(
            "restaurantName"
        ).value.trim();


    const phone =
        document.getElementById(
            "restaurantPhone"
        ).value.trim();


    const email =
        document.getElementById(
            "restaurantEmail"
        ).value.trim();


    const openingTime =
        document.getElementById(
            "openingTime"
        ).value;


    const closingTime =
        document.getElementById(
            "closingTime"
        ).value;


    const currency =
        document.getElementById(
            "currency"
        ).value;


    if (!name) {

        alert(
            "Please enter the restaurant name."
        );

        return;
    }


    if (!email) {

        alert(
            "Please enter the restaurant email."
        );

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert(
            "Please enter a valid restaurant email."
        );

        return;
    }


    if (
        openingTime &&
        closingTime &&
        openingTime >= closingTime
    ) {

        alert(
            "Closing time should be later than opening time."
        );

        return;
    }


    const settings =
        getSettings();


    settings.restaurant = {

        name,

        phone,

        email,

        openingTime,

        closingTime,

        currency

    };


    saveSettings(
        settings
    );


    alert(
        "Restaurant details saved successfully! ✅"
    );
}


// =====================================================
// SAVE NOTIFICATIONS
// =====================================================

function saveNotifications() {

    const settings =
        getSettings();


    settings.notifications = {

        lowStock:
            document.getElementById(
                "lowStockNotifications"
            ).checked,


        newOrder:
            document.getElementById(
                "newOrderNotifications"
            ).checked,


        dailySales:
            document.getElementById(
                "dailySalesNotifications"
            ).checked

    };


    saveSettings(
        settings
    );
}


// =====================================================
// PASSWORD MANAGEMENT
// =====================================================

function changePassword() {

    const currentPassword =
        document.getElementById(
            "currentPassword"
        ).value;


    const newPassword =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    if (!currentPassword) {

        alert(
            "Please enter your current password."
        );

        return;
    }


    if (!newPassword) {

        alert(
            "Please enter a new password."
        );

        return;
    }


    if (
        newPassword.length < 6
    ) {

        alert(
            "New password must contain at least 6 characters."
        );

        return;
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        alert(
            "New password and confirm password do not match."
        );

        return;
    }


    const savedPassword =
        localStorage.getItem(
            "restaurantAdminPassword"
        );


    // First-time password setup

    if (!savedPassword) {

        // For the first setup, accept
        // the entered current password
        // and save the new password.

        localStorage.setItem(
            "restaurantAdminPassword",
            newPassword
        );

    }

    else {

        if (
            currentPassword !==
            savedPassword
        ) {

            alert(
                "Current password is incorrect."
            );

            return;
        }


        localStorage.setItem(
            "restaurantAdminPassword",
            newPassword
        );
    }


    document.getElementById(
        "currentPassword"
    ).value = "";


    document.getElementById(
        "newPassword"
    ).value = "";


    document.getElementById(
        "confirmPassword"
    ).value = "";


    alert(
        "Password changed successfully! ✅"
    );
}


// =====================================================
// INITIALIZE SETTINGS
// =====================================================

function loadSettingsPage() {

    const settings =
        getSettings();


    loadProfile(
        settings
    );


    loadRestaurantInfo(
        settings
    );


    loadNotifications(
        settings
    );
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        loadSettingsPage();


        // ---------------------------------------------
        // SAVE PROFILE
        // ---------------------------------------------

        document
            .getElementById(
                "saveProfileBtn"
            )
            .addEventListener(
                "click",
                saveProfile
            );


        // ---------------------------------------------
        // SAVE RESTAURANT
        // ---------------------------------------------

        document
            .getElementById(
                "saveRestaurantBtn"
            )
            .addEventListener(
                "click",
                saveRestaurantInfo
            );


        // ---------------------------------------------
        // NOTIFICATIONS
        // ---------------------------------------------

        const notificationInputs = [

            "lowStockNotifications",

            "newOrderNotifications",

            "dailySalesNotifications"

        ];


        notificationInputs.forEach(
            id => {

                document
                    .getElementById(id)
                    .addEventListener(
                        "change",
                        saveNotifications
                    );

            }
        );


        // ---------------------------------------------
        // PASSWORD
        // ---------------------------------------------

        document
            .getElementById(
                "changePasswordBtn"
            )
            .addEventListener(
                "click",
                changePassword
            );


        // ---------------------------------------------
        // UPDATE AVATAR WHILE TYPING
        // ---------------------------------------------

        document
            .getElementById(
                "adminName"
            )
            .addEventListener(
                "input",
                function () {

                    updateAvatar(
                        this.value
                    );

                }
            );

    }
);