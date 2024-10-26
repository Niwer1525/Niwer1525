function showContactPopup() {
    var popup = document.getElementById("contact-popup");
    popup.style.display = "flex";
}

function hideContactPopup() {
    var popup = document.getElementById("contact-popup");
    popup.style.display = "none";
}

function isContactPopupVisible() {
    var popup = document.getElementById("contact-popup");
    return popup.style.display === "flex";
}