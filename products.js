/* =============================================
   PRODUCTS.JS - Product Management
   ============================================= */

import { 
    db, 
    collection, 
    getDocs, 
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit 
} from './firebase.js';
import { 
    addToCart, 
    formatCurrency, 
    showLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
} from './main.js';
import { showNotification } from './firebase.js';

/* =============================================
   SAMPLE PRODUCTS DATA (Fallback)
   ============================================= */
const sampleProducts = [
    {
        id: '1',
        name: 'Classic Running Shoes',
        description: 'Lightweight and comfortable running shoes perfect for daily training.',
        price: 89.99,
        category: 'sneakers',
        image: 'images/products/shoe1.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 50,
        featured: true
    },
    {
        id: '2',
        name: 'Professional Dress Shoes',
        description: 'Elegant leather dress shoes for formal occasions and business meetings.',
        price: 129.99,
        category: 'formal',
        image: 'images/products/shoe2.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 30,
        featured: true
    },
    {
        id: '3',
        name: 'Outdoor Hiking Boots',
        description: 'Durable hiking boots with excellent grip and ankle support.',
        price: 159.99,
        category: 'boots',
        image: 'images/products/shoe3.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 25,
        featured: true
    },
    {
        id: '4',
        name: 'Summer Sandals',
        description: 'Comfortable sandals perfect for beach and casual wear.',
        price: 49.99,
        category: 'sandals',
        image: 'images/products/shoe1.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 40,
        featured: false
    },
    {
        id: '5',
        name: 'Sports Basketball Shoes',
        description: 'High-performance basketball shoes with superior cushioning.',
        price: 139.99,
        category: 'sneakers',
        image: 'images/products/shoe2.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 35,
        featured: true
    },
    {
        id: '6',
        name: 'Winter Boots',
        description: 'Warm and waterproof boots for cold weather conditions.',
        price: 179.99,
        category: 'boots',
        image: 'images/products/shoe3.jpg',
        sizes: ['7', '8', '9', '10', '11', '12'],
        stock: 20,
        featured: false
    }
];

/* =============================================
   FETCH PRODUCTS FROM FIREBASE
   ============================================= */
export async function fetchProducts() {
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        
        if (productSnapshot.empty) {
            console.log('No products in Firestore, using sample data');
            return sampleProducts;
        }
        
        const products = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return sampleProducts;
    }
}

/* =============================================
   FETCH SINGLE PRODUCT
   ============================================= */
export async function fetchProduct(productId) {
    try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        
        if (productDoc.exists()) {
            return {
                id: productDoc.id,
                ...productDoc.data()
            };
        } else {
            // Fallback to sample data
            return sampleProducts.find(p => p.id === productId);
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        return sampleProducts.find(p => p.id === productId);
    }
}

/* =============================================
   FETCH FEATURED PRODUCTS
   ============================================= */
export async function fetchFeaturedProducts() {
    try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('featured', '==', true), limit(6));
        const productSnapshot = await getDocs(q);
        
        if (productSnapshot.empty) {
            return sampleProducts.filter(p => p.featured);
        }
        
        const products = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        return products;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return sampleProducts.filter(p => p.featured);
    }
}

/* =============================================
   RENDER PRODUCT CARD
   ============================================= */
export function renderProductCard(product) {
    const isWishlisted = isInWishlist(product.id);
    
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='images/products/shoe1.jpg'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="quickAddToCart('${product.id}')">
                        Add to Cart
                    </button>
                    <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                            onclick="toggleWishlist('${product.id}')">
                        ${isWishlisted ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

/* =============================================
   DISPLAY PRODUCTS
   ============================================= */
export async function displayProducts(containerId, filters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    showLoading(container);
    
    try {
        let products = await fetchProducts();
        
        // Apply filters
        if (filters.category && filters.category !== 'all') {
            products = products.filter(p => p.category === filters.category);
        }
        
        if (filters.priceRange) {
            products = products.filter(p => {
                if (filters.priceRange === '0-50') return p.price < 50;
                if (filters.priceRange === '50-100') return p.price >= 50 && p.price < 100;
                if (filters.priceRange === '100-150') return p.price >= 100 && p.price < 150;
                if (filters.priceRange === '150+') return p.price >= 150;
                return true;
            });
        }
        
        if (filters.size) {
            products = products.filter(p => p.sizes.includes(filters.size));
        }
        
        // Apply sorting
        if (filters.sort) {
            if (filters.sort === 'price-low') {
                products.sort((a, b) => a.price - b.price);
            } else if (filters.sort === 'price-high') {
                products.sort((a, b) => b.price - a.price);
            } else if (filters.sort === 'name') {
                products.sort((a, b) => a.name.localeCompare(b.name));
            }
        }
        
        if (products.length === 0) {
            container.innerHTML = '<p class="loading">No products found.</p>';
            return;
        }
        
        container.innerHTML = products.map(product => renderProductCard(product)).join('');
        
        // Add click handlers to product cards
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = card.dataset.id;
                    window.location.href = `product.html?id=${productId}`;
                }
            });
        });
        
    } catch (error) {
        console.error('Error displaying products:', error);
        container.innerHTML = '<p class="loading">Error loading products.</p>';
    }
}

/* =============================================
   QUICK ADD TO CART (with default size)
   ============================================= */
window.quickAddToCart = async function(productId) {
    try {
        const product = await fetchProduct(productId);
        if (product && product.sizes && product.sizes.length > 0) {
            const defaultSize = product.sizes[0];
            addToCart(product, defaultSize, 1);
            showNotification('Product added to cart!', 'success');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
};

/* =============================================
   TOGGLE WISHLIST
   ============================================= */
window.toggleWishlist = function(productId) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        showNotification('Removed from wishlist', 'success');
    } else {
        addToWishlist(productId);
        showNotification('Added to wishlist!', 'success');
    }
    
    // Update button appearance
    const btn = document.querySelector(`button[onclick="toggleWishlist('${productId}')"]`);
    if (btn) {
        btn.classList.toggle('active');
        btn.textContent = isInWishlist(productId) ? '❤️' : '🤍';
    }
};

/* =============================================
   LOAD FEATURED PRODUCTS (Homepage)
   ============================================= */
if (document.getElementById('featuredProducts')) {
    displayFeaturedProducts();
}

async function displayFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    showLoading(container);
    
    try {
        const products = await fetchFeaturedProducts();
        container.innerHTML = products.map(product => renderProductCard(product)).join('');
        
        // Add click handlers
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = card.dataset.id;
                    window.location.href = `product.html?id=${productId}`;
                }
            });
        });
    } catch (error) {
        console.error('Error displaying featured products:', error);
        container.innerHTML = '<p class="loading">Error loading products.</p>';
    }
}

/* =============================================
   SHOP PAGE INITIALIZATION
   ============================================= */
if (window.location.pathname.includes('shop.html')) {
    initShopPage();
}

function initShopPage() {
    const productsGrid = document.getElementById('productsGrid');
    const sortSelect = document.getElementById('sortSelect');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const resultsCount = document.getElementById('resultsCount');
    
    let currentFilters = {
        categories: [],
        priceRanges: [],
        sizes: [],
        sort: 'featured'
    };
    
    // Load products
    loadShopProducts();
    
    // Filter change handlers
    document.querySelectorAll('input[name="category"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters();
        });
    });
    
    document.querySelectorAll('input[name="price"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters();
        });
    });
    
    document.querySelectorAll('input[name="size"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters();
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentFilters.sort = sortSelect.value;
            loadShopProducts();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            currentFilters = {
                categories: [],
                priceRanges: [],
                sizes: [],
                sort: 'featured'
            };
            loadShopProducts();
        });
    }
    
    function updateFilters() {
        currentFilters.categories = Array.from(
            document.querySelectorAll('input[name="category"]:checked')
        ).map(cb => cb.value).filter(v => v !== 'all');
        
        currentFilters.priceRanges = Array.from(
            document.querySelectorAll('input[name="price"]:checked')
        ).map(cb => cb.value);
        
        currentFilters.sizes = Array.from(
            document.querySelectorAll('input[name="size"]:checked')
        ).map(cb => cb.value);
        
        loadShopProducts();
    }
    
    async function loadShopProducts() {
        if (!productsGrid) return;
        
        showLoading(productsGrid);
        
        try {
            let products = await fetchProducts();
            
            // Apply category filter
            if (currentFilters.categories.length > 0) {
                products = products.filter(p => 
                    currentFilters.categories.includes(p.category)
                );
            }
            
            // Apply price filter
            if (currentFilters.priceRanges.length > 0) {
                products = products.filter(p => {
                    return currentFilters.priceRanges.some(range => {
                        if (range === '0-50') return p.price < 50;
                        if (range === '50-100') return p.price >= 50 && p.price < 100;
                        if (range === '100-150') return p.price >= 100 && p.price < 150;
                        if (range === '150+') return p.price >= 150;
                        return false;
                    });
                });
            }
            
            // Apply size filter
            if (currentFilters.sizes.length > 0) {
                products = products.filter(p => 
                    currentFilters.sizes.some(size => p.sizes.includes(size))
                );
            }
            
            // Apply sorting
            if (currentFilters.sort === 'price-low') {
                products.sort((a, b) => a.price - b.price);
            } else if (currentFilters.sort === 'price-high') {
                products.sort((a, b) => b.price - a.price);
            } else if (currentFilters.sort === 'name') {
                products.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            // Update results count
            if (resultsCount) {
                resultsCount.textContent = `${products.length} products found`;
            }
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<p class="loading">No products match your filters.</p>';
                return;
            }
            
            productsGrid.innerHTML = products.map(product => renderProductCard(product)).join('');
            
            // Add click handlers
            productsGrid.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        const productId = card.dataset.id;
                        window.location.href = `product.html?id=${productId}`;
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading shop products:', error);
            productsGrid.innerHTML = '<p class="loading">Error loading products.</p>';
        }
    }
}

/* =============================================
   PRODUCT DETAIL PAGE
   ============================================= */
if (window.location.pathname.includes('product.html')) {
    initProductPage();
}

async function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }
    
    const productDetail = document.getElementById('productDetail');
    const relatedProducts = document.getElementById('relatedProducts');
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');
    
    if (!productDetail) return;
    
    showLoading(productDetail);
    
    try {
        const product = await fetchProduct(productId);
        
        if (!product) {
            productDetail.innerHTML = '<p class="loading">Product not found.</p>';
            return;
        }
        
        // Update breadcrumb
        if (breadcrumbProduct) {
            breadcrumbProduct.textContent = product.name;
        }
        
        // Render product details
        renderProductDetails(product, productDetail);
        
        // Load related products
        if (relatedProducts) {
            const allProducts = await fetchProducts();
            const related = allProducts
                .filter(p => p.category === product.category && p.id !== product.id)
                .slice(0, 4);
            
            relatedProducts.innerHTML = related.map(p => renderProductCard(p)).join('');
            
            relatedProducts.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        const relatedId = card.dataset.id;
                        window.location.href = `product.html?id=${relatedId}`;
                    }
                });
            });
        }
        
    } catch (error) {
        console.error('Error loading product:', error);
        productDetail.innerHTML = '<p class="loading">Error loading product.</p>';
    }
}

function renderProductDetails(product, container) {
    let selectedSize = product.sizes[0];
    let quantity = 1;
    
    container.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='images/products/shoe1.jpg'">
            </div>
        </div>
        
        <div class="product-details">
            <h1>${product.name}</h1>
            <div class="product-rating">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <span>(${Math.floor(Math.random() * 100) + 50} reviews)</span>
            </div>
            <div class="product-price">${formatCurrency(product.price)}</div>
            <p class="product-description">${product.description}</p>
            
            <div class="product-options">
                <h3>Select Size</h3>
                <div class="size-selector" id="sizeSelector">
                    ${product.sizes.map(size => `
                        <div class="size-option ${size === selectedSize ? 'active' : ''}" 
                             data-size="${size}">
                            ${size}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="quantity-selector">
                <h3>Quantity</h3>
                <div class="quantity-controls">
     
