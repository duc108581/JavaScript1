document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "https://66b4e4e39f9169621ea1.mockapi.io";
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let userEmail = localStorage.getItem('userEmail') || '';
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; 

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    let cartCountEl; 
    let detailsModal, cartModal, authModal; 
    let userAuthBtn; 


    function updateCartCount() {
        if (!cartCountEl) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.add('updated');
        setTimeout(() => cartCountEl.classList.remove('updated'), 200);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    
    function saveAuthState(email, loggedIn) {
        isLoggedIn = loggedIn;
        userEmail = email;
        localStorage.setItem('isLoggedIn', isLoggedIn);
        localStorage.setItem('userEmail', userEmail);
        updateAuthButton();
    }

    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    function updateAuthButton() {
        if (!userAuthBtn) return;
        if (isLoggedIn && userEmail) {
            const username = userEmail.split('@')[0];
            userAuthBtn.textContent = `Thoát (${username})`;
            userAuthBtn.style.color = 'white'; 
            userAuthBtn.style.backgroundColor = 'var(--primary-color)';
        } else {
            userAuthBtn.textContent = 'Đăng nhập';
            userAuthBtn.style.color = 'var(--primary-color)';
            userAuthBtn.style.backgroundColor = 'transparent';
        }
    }

    function addToCart(id, name, price, img) {
        if (!isLoggedIn) {
            showToast("Vui lòng đăng nhập để thêm món ăn!");
            if (authModal) authModal.style.display = 'flex';
            return;
        }

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, img, quantity: 1 });
        }

        saveCart();
        showToast(`Đã thêm "${name}" vào giỏ hàng!`);
    }
    
    function updateCartQuantity(id, change) { 
        const item = cart.find(item => item.id === id);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }

        saveCart();
        renderCartModal(); 
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartModal(); 
    }

    function renderCartModal() {
        const cartBody = document.getElementById('cart-body');
        const cartTotalPriceEl = document.getElementById('cart-total-price');
        if (!cartBody || !cartTotalPriceEl) return;

        cartBody.innerHTML = ''; 
        let totalPrice = 0;

        if (cart.length === 0) {
            cartBody.innerHTML = '<p style="text-align: center; color: #888;">Giỏ hàng của bạn đang trống.</p>';
        } else {
            cart.forEach(item => {
                const itemPrice = item.price;
                totalPrice += itemPrice * item.quantity;

                const itemHtml = `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${itemPrice.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
                            <button class="remove-btn" data-id="${item.id}">&times;</button>
                        </div>
                    </div>
                `;
                cartBody.innerHTML += itemHtml;
            });
        }

        cartTotalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    }


    const navbar = document.querySelector(".navbar");
    const bookingBtn = document.querySelector(".navbar .booking-btn");
    
    if (navbar && bookingBtn) {
        
        const rightActionsContainer = document.createElement('div');
        rightActionsContainer.className = 'navbar-right-actions';
        
        const tempBookingBtn = bookingBtn.cloneNode(true); 
        bookingBtn.parentNode.removeChild(bookingBtn); 
        rightActionsContainer.appendChild(tempBookingBtn); 
        
        userAuthBtn = document.createElement('button');
        userAuthBtn.className = 'user-auth-btn';
        rightActionsContainer.appendChild(userAuthBtn);
        updateAuthButton(); 

        const cartIconWrapper = document.createElement('div');
        cartIconWrapper.className = 'cart-icon-wrapper';
        cartIconWrapper.innerHTML = `
            <span id="cart-icon">🛒</span>
            <span id="cart-count">0</span>
        `;
        rightActionsContainer.appendChild(cartIconWrapper);

        navbar.appendChild(rightActionsContainer);
    }
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div id="details-modal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2 id="details-title">Food Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <img id="details-img" src="" alt="Food detail">
                    <div id="details-content">
                        <p id="details-price" class="price">$0</p>
                        <p id="details-desc" class="description"></p>
                        <button id="details-add-to-cart">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="cart-modal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2>Your Shopping Cart</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body" id="cart-body">
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total Price:</span>
                        <span id="cart-total-price">$0.00</span>
                    </div>
                    <button id="cart-order-btn">Order Now</button>
                </div>
            </div>
        </div>

        <div id="toast-container"></div>
    `;
    document.body.appendChild(modalContainer);


    const cartIconBtn = document.getElementById('cart-icon');
    cartCountEl = document.getElementById('cart-count'); 
    
    detailsModal = document.getElementById('details-modal'); 
    cartModal = document.getElementById('cart-modal'); 
    authModal = document.getElementById('auth-modal'); 
    
    const allModals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.modal-overlay .close-btn');


    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    
    const authEmailInput = document.getElementById('auth-email');
    const authConfirmEmailInput = document.getElementById('auth-confirm-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authConfirmPasswordInput = document.getElementById('auth-confirm-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const switchToRegisterLink = document.getElementById('switch-to-register');

    const registerFields = document.querySelectorAll('.register-field');
    const emailGroup = authEmailInput?.closest('.input-group');
    const confirmEmailGroup = authConfirmEmailInput?.closest('.input-group');
    const passwordGroup = authPasswordInput?.closest('.input-group');
    const confirmPasswordGroup = authConfirmPasswordInput?.closest('.input-group');
    
    const emailError = document.getElementById('email-error');
    const confirmEmailError = document.getElementById('confirm-email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');

    let isRegisterMode = false;

    function resetErrors() {
        document.querySelectorAll('.input-group').forEach(group => group.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(err => {
            err.textContent = '⚠️ Trường này là bắt buộc.'; 
        });
    }

    function displayError(group, errorEl, message) {
        group.classList.add('error');
        errorEl.textContent = message;
    }

    switchToRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        isRegisterMode = !isRegisterMode;
        resetErrors(); 

        registerFields.forEach(field => {
            field.style.display = isRegisterMode ? 'flex' : 'none';
        });

        if (isRegisterMode) {
            authTitle.textContent = 'Đăng ký';
            authSubmitBtn.textContent = 'Đăng ký';
            switchToRegisterLink.textContent = 'Đăng nhập ngay';
            switchToRegisterLink.parentNode.firstChild.textContent = 'Đã có tài khoản? ';
        } else {
            authTitle.textContent = 'Đăng nhập';
            authSubmitBtn.textContent = 'Đăng nhập';
            switchToRegisterLink.textContent = 'Đăng ký ngay';
            switchToRegisterLink.parentNode.firstChild.textContent = 'Chưa có tài khoản? ';
        }
        
        authEmailInput.value = userEmail; 
        authConfirmEmailInput.value = '';
        authPasswordInput.value = '';
        authConfirmPasswordInput.value = '';
    });

    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        resetErrors(); 
        let isValid = true;
        
        const email = authEmailInput.value.trim();
        const password = authPasswordInput.value.trim();

        if (email === '') {
            displayError(emailGroup, emailError, '⚠️ Trường này là bắt buộc.');
            isValid = false;
        } else if (!validateEmail(email)) {
            displayError(emailGroup, emailError, '⚠️ Email không hợp lệ.');
            isValid = false;
        }

        if (password === '') {
            displayError(passwordGroup, passwordError, '⚠️ Trường này là bắt buộc.');
            isValid = false;
        } else if (password.length < 6) {
            displayError(passwordGroup, passwordError, '⚠️ Mật khẩu phải có ít nhất 6 ký tự.');
            isValid = false;
        }


        if (isRegisterMode) {
            const confirmEmail = authConfirmEmailInput.value.trim();
            const confirmPassword = authConfirmPasswordInput.value.trim();
            
            if (confirmEmail === '') {
                displayError(confirmEmailGroup, confirmEmailError, '⚠️ Trường này là bắt buộc.');
                isValid = false;
            } else if (confirmEmail !== email) {
                displayError(confirmEmailGroup, confirmEmailError, '⚠️ Email xác nhận không khớp.');
                isValid = false;
            }

            if (confirmPassword === '') {
                displayError(confirmPasswordGroup, confirmPasswordError, '⚠️ Trường này là bắt buộc.');
                isValid = false;
            } else if (confirmPassword !== password) {
                displayError(confirmPasswordGroup, confirmPasswordError, '⚠️ Mật khẩu xác nhận không khớp.');
                isValid = false;
            }
        }
        
        if (!isValid) return;


        if (isRegisterMode) {
            alert(`Đăng ký thành công với Email: ${email}. Vui lòng Đăng nhập.`);
            
            isRegisterMode = false;
            registerFields.forEach(field => field.style.display = 'none');
            authTitle.textContent = 'Đăng nhập';
            authSubmitBtn.textContent = 'Đăng nhập';
            switchToRegisterLink.textContent = 'Đăng ký ngay';
            switchToRegisterLink.parentNode.firstChild.textContent = 'Chưa có tài khoản? ';
            
            authPasswordInput.value = ''; 
            authConfirmPasswordInput.value = '';
            
            authEmailInput.value = email;

        } else {
            saveAuthState(email, true);
            showToast(`Chào mừng trở lại, ${email.split('@')[0]}!`);
            if (authModal) authModal.style.display = 'none';
        }
    });

    userAuthBtn?.addEventListener('click', () => {
        if (isLoggedIn) {
            saveAuthState('', false);
            cart = []; 
            saveCart();
            showToast('Đã đăng xuất.');
        } else {
            isRegisterMode = false; 
            resetErrors(); 
            registerFields.forEach(field => field.style.display = 'none'); 

            authTitle.textContent = 'Đăng nhập';
            authSubmitBtn.textContent = 'Đăng nhập';
            switchToRegisterLink.textContent = 'Đăng ký ngay';
            switchToRegisterLink.parentNode.firstChild.textContent = 'Chưa có tài khoản? ';
            
            authEmailInput.value = userEmail; 
            authPasswordInput.value = '';
            
            if (authModal) authModal.style.display = 'flex';
        }
    });
    
    cartIconBtn?.addEventListener('click', () => {
        if (!isLoggedIn) {
            showToast("Vui lòng đăng nhập để xem giỏ hàng!");
            if (authModal) authModal.style.display = 'flex';
            return;
        }
        renderCartModal(); 
        if (cartModal) cartModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    allModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { 
                modal.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        const h3 = item.querySelector('h3');
        const img = item.querySelector('.dish-image');
        const addBtn = item.querySelector('.add-btn');
        const priceElement = item.querySelector('.price');
        const descriptionElement = item.querySelector('.dish-description');

        if (!h3 || !img || !addBtn || !priceElement || !descriptionElement) return;

        const name = h3.textContent.trim();
        const priceText = priceElement.textContent.replace('$', '').replace(',', '.');
        const price = parseFloat(priceText); 
        const imgScr = img.src;
        const description = descriptionElement.textContent.trim();
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); 

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            addToCart(id, name, price, imgScr);
        });

        const showDetailsHandler = (e) => {
            const detailsTitle = document.getElementById('details-title');
            const detailsImg = document.getElementById('details-img');
            const detailsPrice = document.getElementById('details-price');
            const detailsDesc = document.getElementById('details-desc');
            let detailsAddBtn = document.getElementById('details-add-to-cart');
            
            if (!detailsTitle || !detailsImg || !detailsPrice || !detailsDesc || !detailsAddBtn || !detailsModal) return;

            detailsTitle.textContent = name;
            detailsImg.src = imgScr;
            detailsPrice.textContent = `$${price.toFixed(2)}`;
            detailsDesc.textContent = description;

            const newBtn = detailsAddBtn.cloneNode(true);
            detailsAddBtn.parentNode.replaceChild(newBtn, detailsAddBtn);
            detailsAddBtn = newBtn; 
            
            detailsAddBtn.addEventListener('click', () => {
                addToCart(id, name, price, imgScr);
                if (isLoggedIn) detailsModal.style.display = 'none'; 
            });

            detailsModal.style.display = 'flex';
        };
        
        h3.addEventListener('click', showDetailsHandler);
        img.addEventListener('click', showDetailsHandler);
    });

    document.getElementById('cart-body')?.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (!id) return; 

        if (target.classList.contains('qty-btn')) {
            const action = target.dataset.action;
            if (action === 'plus') {
                updateCartQuantity(id, 1);
            } else if (action === 'minus') {
                updateCartQuantity(id, -1);
            }
        } else if (target.classList.contains('remove-btn')) {
            removeFromCart(id);
        }
    });

    document.getElementById('cart-order-btn')?.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Giỏ hàng rỗng!");
            return;
        }

        if (!isLoggedIn) {
             showToast("Vui lòng đăng nhập để đặt hàng!");
             if (authModal) authModal.style.display = 'flex';
             return;
        }

        const finalEmail = prompt("Vui lòng xác nhận email của bạn để gửi đơn hàng:", userEmail);
        
        if (finalEmail && validateEmail(finalEmail)) {
            alert(`Cảm ơn bạn đã đặt hàng!
Một email xác nhận sẽ được gửi tới: ${finalEmail}
Tổng đơn hàng: ${document.getElementById('cart-total-price')?.textContent}
(Đây là trang demo, không có đơn hàng thật nào được xử lý)`);
            
            saveAuthState(finalEmail, true); 
            cart = [];
            saveCart();
            renderCartModal();
            if (cartModal) cartModal.style.display = 'none'; 
        } else if (finalEmail !== null) { 
            alert("Vui lòng nhập một địa chỉ email hợp lệ.");
        }
    });

    const contactForm = document.querySelector(".contact-form");
    const emailInput = contactForm?.querySelector('input[type="email"]');

    contactForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        
        if (validateEmail(email)) {
            saveAuthState(email, isLoggedIn); 
            
            alert(`Cảm ơn bạn đã đăng ký!
Email của bạn (${email}) đã được lưu cho lần đặt hàng sau.`);
            emailInput.value = '';
        } else {
            alert("Vui lòng nhập một địa chỉ email hợp lệ.");
        }
    });

    const stickyOffset = navbar ? navbar.offsetTop + 50 : 0;
    window.addEventListener("scroll", () => {
        if (window.scrollY > stickyOffset) {
            navbar?.classList.add("sticky");
        } else {
            navbar?.classList.remove("sticky");
        }
    });
    const scrollToSection = (selector) => {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };
    document.querySelectorAll(".nav-links a").forEach((link, index) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const linkSectionMap = {
                0: ".hero-section", 1: ".about-us-section", 2: ".menu-section",
                3: ".features-section", 4: ".contact-section"
            };
            scrollToSection(linkSectionMap[index]);
        });
    });
    document.querySelector(".navbar-right-actions .booking-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); scrollToSection(".contact-section");
    });
    document.querySelector(".order-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); scrollToSection(".menu-section");
    });
    document.querySelector(".details-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); scrollToSection(".menu-section");
    });
    document.querySelector(".read-more-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); scrollToSection(".features-section");
    });
    document.querySelector(".learn-more-btn")?.addEventListener("click", (e) => {
        e.preventDefault(); scrollToSection(".take-away-section");
    });
    const testimonials = [
        { avatar: "image/girl.png", text: "You need not only Just Food Stalls with Persons but also specialized equipment. Skills to manage Customers, Effective Product catlogues etc very successful to make your.", rating: 5, name: "AUGUSTA W. REYNOSO" },
        { avatar: "image/girl.png", text: "The 'Super Taste' is no joke! I've never had fast food this quality. The delivery was quick and the food was still hot. Highly recommend this place to everyone.", rating: 4, name: "JOHN D. SMITH" },
        { avatar: "image/girl.png", text: "A truly wonderful experience. The Vegie Muffin was delicious and surprisingly filling. Their mobile app is also very easy to use for ordering take away.", rating: 5, name: "MARIA S. GARCIA" }
    ];
    let currentTestimonialIndex = 0;
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");
    const reviewText = document.querySelector(".review-text");
    const reviewRating = document.querySelector(".review-rating");
    const reviewerName = document.querySelector(".reviewer-name");
    const avatarImg = document.querySelector(".reviewer-avatar img");
    const card = document.querySelector('.testimonial-card');
    function updateTestimonial(index) {
        if (!reviewText || !reviewerName || !reviewRating) return;
        const data = testimonials[index];
        if (card) card.style.opacity = 0;
        setTimeout(() => {
            reviewText.textContent = data.text;
            reviewerName.textContent = data.name;
            if(avatarImg) {
                avatarImg.src = data.avatar.includes('image/girl.png') ? 'image/girl.png' : data.avatar;
                avatarImg.alt = `${data.name}'s avatar`;
            }
            if(reviewRating) {
                reviewRating.innerHTML = '';
                for (let i = 0; i < 5; i++) {
                    const star = document.createElement('span');
                    star.className = i < data.rating ? 'star filled' : 'star';
                    star.innerHTML = '★';
                    reviewRating.appendChild(star);
                }
            }
            if (card) card.style.opacity = 1;
        }, 200);
    }
    if (card) card.style.transition = 'opacity 0.2s ease-in-out';
    rightArrow?.addEventListener("click", () => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
        updateTestimonial(currentTestimonialIndex);
    });
    leftArrow?.addEventListener("click", () => {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
        updateTestimonial(currentTestimonialIndex);
    });
    updateTestimonial(currentTestimonialIndex);

    updateCartCount(); 
    updateAuthButton(); 
});