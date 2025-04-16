// Get CSRF token for secure form submissions
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutButton = document.getElementById('checkout-btn');
    const emptyCartMessage = document.querySelector('.empty-cart');
    
    // Load cart items
    function loadCart() {
        let cart = localStorage.getItem('cart');
        
        if (!cart || JSON.parse(cart).length === 0) {
            emptyCartMessage.style.display = 'block';
            updateCartTotals(0);
            return;
        }
        
        cart = JSON.parse(cart);
        emptyCartMessage.style.display = 'none';
        
        // Clear existing items
        while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }
        
        // Add each item to the cart UI
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            
            let itemHTML = '';
            if (item.type === 'custom') {
                // Custom bouquet display
                itemHTML = `
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Custom Bouquet</p>
                        <p class="item-options">Options: ${item.options.map(opt => opt.name).join(', ')}</p>
                        ${item.message ? `<p class="item-message">"${item.message}"</p>` : ''}
                    </div>
                    <div class="item-price">₹${item.totalPrice}</div>
                `;
            } else {
                // Standard bouquet display
                itemHTML = `
                    <div class="item-details">
                        <h3>${item.name}</h3>
                    </div>
                    <div class="item-price">₹${item.price}</div>
                `;
            }
            
            // Add remove button
            itemHTML += `
                <div class="item-actions">
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            `;
            
            cartItem.innerHTML = itemHTML;
            cartItemsContainer.insertBefore(cartItem, emptyCartMessage);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                removeFromCart(this.dataset.id);
            });
        });
        
        // Calculate and update totals
        calculateCartTotal();
    }
    
    // Remove item from cart
    function removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        cart = cart.filter(item => item.id.toString() !== itemId.toString());
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Reload cart UI
        loadCart();
    }
    
    // Calculate cart total
    function calculateCartTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;
        
        cart.forEach(item => {
            if (item.type === 'custom') {
                subtotal += item.totalPrice;
            } else {
                subtotal += parseInt(item.price);
            }
        });
        
        updateCartTotals(subtotal);
    }
    
    // Update displayed totals
    function updateCartTotals(subtotal) {
        const deliveryFee = subtotal > 0 ? 50 : 0;
        const total = subtotal + deliveryFee;
        
        subtotalElement.textContent = `₹${subtotal}`;
        totalElement.textContent = `₹${total}`;
        
        // Disable checkout button if cart is empty
        checkoutButton.disabled = subtotal === 0;
    }
    
    // Handle checkout process
    checkoutButton.addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Option 1: Send cart to backend for processing
        /*
        fetch('/api/orders/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                items: cart,
                total: parseFloat(totalElement.textContent.replace('₹', ''))
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Order created:', data);
            // Clear cart after successful order
            localStorage.removeItem('cart');
            window.location.href = '/thank-you/';
        })
        .catch(error => {
            console.error('Error creating order:', error);
        });
        */
        
        // Option 2: For demo, just go to thank you page
        localStorage.removeItem('cart');
        window.location.href = '/thank-you/';
    });
    
    // Initialize
    loadCart();
});