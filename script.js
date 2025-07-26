document.addEventListener('DOMContentLoaded', function () {
    // --- MOCK SHOPIFY DATA ---
    const productData = {
        mainPrice: 100, // Base price before any discounts
        variants: {
            single: {
                price: 75, // 25% off main price
                flavors: {
                    Chocolate: { id: 'single_choco', image: '../choco.png', thumb: '../choco.png' },
                    Vanilla: { id: 'single_vanilla', image: '../vannila.png', thumb: '../vannila.png' },
                    Orange: { id: 'single_orange', image: '../orange.png', thumb: '../orange.png' }
                }
            },
            double: {
                price: 150, // 2 x 75
                flavors: {
                   Chocolate: { id: 'double_choco', image: '../choco.png', thumb: '../choco.png' },
                   Vanilla: { id: 'double_vanilla', image: '../vannila.png', thumb: '../vannila.png' },
                   Orange: { id: 'double_orange', image: '../orange.png', thumb: '../orange.png' }
                }
            }
        },
        metafields: {
            single: {
                title: "Single Drink Subscription",
                delivery: "Delivered every 2 weeks",
                items: "1 x Energy Drink",
                benefits: ["Save 25% on every order", "Free shipping always", "Cancel anytime"]
            },
            double: {
                title: "Double Drink Subscription",
                delivery: "Delivered every 2 weeks",
                items: "2 x Energy Drink",
                benefits: ["Save 30% on every order", "Free shipping always", "Exclusive access to new flavors"]
            }
        }
    };

    const salesDiscount = 0.20; // 20% sales discount

    // --- STATE MANAGEMENT ---
    let cart = [];
    let selectedOption = 'single';
    let selectedFlavor1 = 'Chocolate';
    let selectedFlavor2 = 'Chocolate';

    // --- UI ELEMENTS ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const singleOptionDiv = document.getElementById('single-drink-option');
    const doubleOptionDiv = document.getElementById('double-drink-option');
    const singleRadio = document.getElementById('single_drink');
    const doubleRadio = document.getElementById('double_drink');
    const flavorSelector1 = document.getElementById('flavor-selector-1');
    const flavorSelector2 = document.getElementById('flavor-selector-2');
    const priceDisplay = document.getElementById('current-price');
    const compareAtPriceDisplay = document.getElementById('compare-at-price');
    const includedContent = document.getElementById('included-content');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotalDisplay = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    // --- FUNCTIONS ---
    function calculatePrice() {
        const baseSubscriptionPrice = productData.variants[selectedOption].price;
        const finalPrice = baseSubscriptionPrice * (1 - salesDiscount);
        let originalPrice;
        if (selectedOption === 'single') {
            originalPrice = productData.mainPrice;
        } else {
            originalPrice = productData.mainPrice * 2;
        }
        return { finalPrice, originalPrice };
    }

    function updatePrice() {
        const { finalPrice, originalPrice } = calculatePrice();
        priceDisplay.textContent = `$${finalPrice.toFixed(2)}`;
        compareAtPriceDisplay.textContent = `$${originalPrice.toFixed(2)}`;
    }

    function updateWhatsIncluded() {
        const content = productData.metafields[selectedOption];
        let benefitsHtml = content.benefits.map(b => `<li>${b}</li>`).join('');
        includedContent.innerHTML = `
            <p>${content.delivery}</p>
            <p><strong>${content.items}</strong></p>
            <ul>${benefitsHtml}</ul>
        `;
    }

    function updateFlavorSelectors() {
        flavorSelector2.classList.toggle('hidden', selectedOption === 'single');
    }
    
    function updateMainImage() {
        const flavorData = productData.variants.single.flavors[selectedFlavor1];
        if (flavorData && flavorData.image) {
            mainImage.src = flavorData.image;
            mainImage.alt = `${selectedOption} - ${selectedFlavor1}`;
        }
        
        thumbnails.forEach(thumb => {
            thumb.classList.toggle('active', thumb.dataset.flavor === selectedFlavor1);
        });
    }

    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Clear previous items
        if (cart.length === 0) {
            cartItemsContainer.appendChild(emptyCartMsg);
            emptyCartMsg.classList.remove('hidden');
            cartSummary.classList.add('hidden');
            clearCartBtn.classList.add('hidden');
            return;
        }

        emptyCartMsg.classList.add('hidden');
        cartSummary.classList.remove('hidden');
        clearCartBtn.classList.remove('hidden');

        let total = 0;
        cart.forEach(item => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            let flavorText = item.flavor1;
            if (item.flavor2) {
                flavorText += ` & ${item.flavor2}`;
            }

            itemEl.innerHTML = `
                <div class="cart-item-details">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-meta">${item.option}</p>
                        <p class="cart-item-meta">Flavor: ${flavorText}</p>
                    </div>
                </div>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    function updateUI() {
        updatePrice();
        updateWhatsIncluded();
        updateFlavorSelectors();
        updateMainImage();
    }

    // --- EVENT LISTENERS ---
    [singleOptionDiv, doubleOptionDiv].forEach(div => {
        div.addEventListener('click', () => {
            const radio = div.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedOption = radio.value;
            
            document.querySelector('.option-card.active').classList.remove('active');
            div.classList.add('active');
            
            updateUI();
        });
    });
    
    flavorSelector1.querySelectorAll('.flavor-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            flavorSelector1.querySelector('.selected').classList.remove('selected');
            swatch.classList.add('selected');
            selectedFlavor1 = swatch.dataset.flavor;
            updateUI();
        });
    });

    flavorSelector2.querySelectorAll('.flavor-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            flavorSelector2.querySelector('.selected').classList.remove('selected');
            swatch.classList.add('selected');
            selectedFlavor2 = swatch.dataset.flavor;
            updateUI();
        });
    });
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            selectedFlavor1 = thumb.dataset.flavor;
            flavorSelector1.querySelector('.selected').classList.remove('selected');
            flavorSelector1.querySelector(`[data-flavor="${selectedFlavor1}"]`).classList.add('selected');
            updateUI();
        });
    });

    addToCartBtn.addEventListener('click', () => {
        const { finalPrice } = calculatePrice();
        const cartItem = {
            id: `${selectedOption}_${selectedFlavor1}_${selectedFlavor2}_${Date.now()}`,
            name: "Energy Drink",
            option: productData.metafields[selectedOption].title,
            flavor1: selectedFlavor1,
            flavor2: selectedOption === 'double' ? selectedFlavor2 : null,
            price: finalPrice,
            image: productData.variants.single.flavors[selectedFlavor1].thumb
        };

        cart.push(cartItem);
        renderCart();

        addToCartBtn.textContent = 'Added!';
        addToCartBtn.classList.add('added');
        setTimeout(() => {
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.classList.remove('added');
        }, 1500);
    });

    clearCartBtn.addEventListener('click', () => {
        cart = [];
        renderCart();
    });

    // --- INITIALIZATION ---
    updateUI();
    renderCart();
});
