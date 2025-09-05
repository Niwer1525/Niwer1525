const popup = () => document.getElementById("contact-popup");

function showContactPopup() { popup().style.display = "flex"; }

function hideContactPopup() { popup().style.display = "none"; }

function isContactPopupVisible() { return popup().style.display === "flex"; }