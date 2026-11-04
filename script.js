
/* global axios */

document.addEventListener("DOMContentLoaded", function () {
    const productSelect = document.getElementById("productSelect");
    const getPriceButton = document.getElementById("getPriceButton");
    const priceDisplay = document.getElementById("priceDisplay");
    const message = document.getElementById("message");

    /** Updates the helper text below the price area. */
    function showMessage(text, type = "") {
        message.textContent = text;
        message.className = "message" + (type ? " " + type : "");
    }

    /** Retrieves product names and adds them to the dropdown. */
    async function loadProducts() {
        showMessage("Loading products...");

        try {
            const response = await axios.get("api/getProducts.php");
            const products = response.data;

            if (!Array.isArray(products)) {
                throw new Error("Invalid product list received.");
            }

            products.forEach(function (product) {
                const option = document.createElement("option");
                option.value = product.product_id;
                option.textContent = product.product_name;
                productSelect.appendChild(option);
            });

            productSelect.disabled = false;
            getPriceButton.disabled = false;
            showMessage(products.length ? "Choose a product to continue." : "No products are available.");
        } catch (error) {
            console.error("Unable to load products:", error);
            showMessage("Unable to load products. Please try again later.", "error");
        }
    }

    /** Retrieves and displays the price for the selected product. */
    async function getPrice() {
        const productId = productSelect.value;

        if (!productId) {
            priceDisplay.textContent = "P 0.00";
            showMessage("Please select a product first.", "error");
            return;
        }

        getPriceButton.disabled = true;
        getPriceButton.textContent = "LOADING...";
        showMessage("Retrieving price...");

        try {
            const response = await axios.get("api/getPrice.php?id=" + encodeURIComponent(productId));
            const data = response.data;

            if (data.error) {
                throw new Error(data.error);
            }

            const price = Number(data.price);
            if (!Number.isFinite(price)) {
                throw new Error("Invalid price received.");
            }

            priceDisplay.textContent = "P " + price.toFixed(2);
            showMessage("Price retrieved successfully.", "success");
        } catch (error) {
            console.error("Unable to retrieve price:", error);
            priceDisplay.textContent = "P 0.00";
            showMessage(error.message || "Unable to retrieve the price.", "error");
        } finally {
            getPriceButton.disabled = false;
            getPriceButton.textContent = "GET PRICE";
        }
    }

    getPriceButton.addEventListener("click", getPrice);
    productSelect.addEventListener("change", function () {
        priceDisplay.textContent = "P 0.00";
        showMessage("");
    });

    loadProducts();
});