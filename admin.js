/* =============================================
   ADMIN.JS - Admin Dashboard Management
   ============================================= */

import { 
    auth, 
    db,
    onAuthStateChanged,
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where,
    serverTimestamp
} from './firebase.js';
import { isAdmin, formatPrice, formatDate } from './firebase.js';
import { showNotification } from './firebase.js';

/* =============================================
   ADMIN PAGE INITIALIZATION
   ============================================= */
if (window.location.pathname.includes('admin.html')) {
    initAdminPage();
}

async function initAdminPage() {
    const adminAuthPrompt = document.getElementById('adminAuthPrompt');
    const adminContent = document.querySelector('.admin-content');
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            if (adminAuthPrompt) adminAuthPrompt.style.display = 'flex';
            if (adminContent) adminContent.style.display = 'none';
            return;
        }
        
        // Check if user is admin
        const userIsAdmin = await isAdmin(user.uid);
        
        if (!userIsAdmin) {
            if (adminAuthPrompt) {
                adminAuthPrompt.style.display = 'flex';
                adminAuthPrompt.querySelector('h2').textContent = 'Access Denied';
                adminAuthPrompt.querySelector('p').textContent = 'You do not have admin privileges.';
            }
            if (adminContent) adminContent.style.display = 'none';
            return;
        }
        
        // User is admin
        if (adminAuthPrompt) adminAuthPrompt.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        
        // Set admin name
        const adminName = document.getElementById('adminName');
        if (adminName) {
            adminName.textContent = user.displayName || 'Admin';
        }
        
        // Initialize admin dashboard
        loadDashboardStats();
        loadRecentOrders();
        initAdminTabs();
        initProductManagement();
        initOrderManagement();
        initCustomerManagement();
    });
    
    // Logout handler
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
        adminLogout.addEventListener('click', async () => {
            try {
                await auth.signOut();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                showNotification('Error logging out', 'error');
            }
        });
    }
}

/* =============================================
   ADMIN TAB NAVIGATION
   ============================================= */
function initAdminTabs() {
    const navLinks = document.querySelectorAll('.admin-nav-menu a');
    const tabs = document.querySelectorAll('.admin-tab');
    const pageTitle = document.getElementById('pageTitle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            
            if (!tabName) return;
            
            // Update navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            const targetTab = document.getElementById(`${tabName}Tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
            
            // Update page title
            if (pageTitle) {
                pageTitle.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
            }
            
            // Load tab-specific data
            loadTabData(tabName);
        });
    });
}

/* =============================================
   LOAD TAB DATA
   ============================================= */
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentOrders();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadAllOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
    }
}

/* =============================================
   LOAD DASHBOARD STATS
   ============================================= */
async function loadDashboardStats() {
    try {
        // Get all orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        // Get products count
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsCount = productsSnapshot.size;
        
        // Get customers count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const customersCount = usersSnapshot.size;
        
        // Update stats
        document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalProducts').textContent = productsCount;
        document.getElementById('totalCustomers').textContent = customersCount;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Use sample data
        document.getElementById('totalRevenue').textContent = '$12,450';
        document.getElementById('totalOrders').textContent = '87';
        document.getElementById('totalProducts').textContent = '24';
        document.getElementById('totalCustomers').textContent = '156';
    }
}

/* =============================================
   LOAD RECENT ORDERS
   ============================================= */
async function loadRecentOrders() {
    const tableBody = document.getElementById('recentOrdersTable');
    if (!tableBody) return;
    
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const ordersSnapshot = await getDocs(q);
        
        if (ordersSnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5">No orders yet</td></tr>';
            return;
        }
        
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId || order.id}</td>
                <td>${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatPrice(order.total)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        tableBody.innerHTML = '<tr><td colspan="5">Error loading orders</td></tr>';
    }
}

/* =============================================
   PRODUCT MANAGEMENT
   ============================================= */
function initProductManagement() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const cancelProduct = document.getElementById('cancelProduct');
    const productForm = document.getElementById('productForm');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            openProductModal();
        });
    }
    
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            productModal.classList.remove('active');
        });
    }
    
    if (cancelProduct) {
        cancelProduct.addEventListener('click', () => {
            productModal.classList.remove('active');
        });
    }
    
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProduct();
        });
    }
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');
    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSizes').value = product.sizes.join(',');
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productFeatured').checked = product.featured || false;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        form.reset();
        document.getElementById('productId').value = '';
    }
    
    modal.classList.add('active');
}

async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
        stock: parseInt(document.getElementById('productStock').value),
        image: document.getElementById('productImage').value,
        featured: document.getElementById('productFeatured').checked,
        updatedAt: serverTimestamp()
    };
    
    try {
        if (productId) {
            // Update existing product
            await updateDoc(doc(db, 'products', productId), productData);
            showNotification('Product updated successfully!', 'success');
        } else {
            // Add new product
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'products'), productData);
            showNotification('Product added successfully!', 'success');
        }
        
        document.getElementById('productModal').classList.remove('active');
        loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

async function loadProducts() {
    const tableBody = document.getElementById('productsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        
        if (productsSnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
            return;
        }
        
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image}" alt="${product.name}" onerror="this.src='images/products/shoe1.jpg'"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td class="table-actions">
                    <button class="edit-btn" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading products:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading products</td></tr>';
    }
}

window.editProduct = async function(productId) {
    try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            const product = { id: productDoc.id, ...productDoc.data() };
            openProductModal(product);
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error loading product', 'error');
    }
};

window.deleteProduct = async function(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await deleteDoc(doc(db, 'products', productId));
        showNotification('Product deleted successfully!', 'success');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
};

/* =============================================
   ORDER MANAGEMENT
   ============================================= */
function initOrderManagement() {
    const orderFilter = document.getElementById('orderFilter');
    
    if (orderFilter) {
        orderFilter.addEventListener('change', () => {
            loadAllOrders(orderFilter.value);
        });
    }
}

async function loadAllOrders(statusFilter = 'all') {
    const tableBody = document.getElementById('ordersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    
    try {
        let q = collection(db, 'orders');
        
        if (statusFilter !== 'all') {
            q = query(q, where('status', '==', statusFilter));
        }
        
        const ordersSnapshot = await getDocs(q);
        
        if (ordersSnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="7">No orders found</td></tr>';
            return;
        }
        
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tableBody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId || order.id}</td>
                <td>${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${order.items?.length || 0}</td>
                <td>${formatPrice(order.total)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td class="table-actions">
                    <button class="view-btn" onclick="viewOrder('${order.id}')">View</button>
                    <button class="edit-btn" onclick="updateOrderStatus('${order.id}')">Update</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = '<tr><td colspan="7">Error loading orders</td></tr>';
    }
}

window.viewOrder = async function(orderId) {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
            const order = orderDoc.data();
            alert(`Order Details:\n\nOrder ID: ${order.orderId}\nTotal: ${formatPrice(order.total)}\nStatus: ${order.status}`);
        }
    } catch (error) {
        console.error('Error viewing order:', error);
    }
};

window.updateOrderStatus = async function(orderId) {
    const newStatus = prompt('Enter new status (pending/processing/shipped/delivered):');
    
    if (!newStatus || !['pending', 'processing', 'shipped', 'delivered'].includes(newStatus)) {
        showNotification('Invalid status', 'error');
        return;
    }
    
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        showNotification('Order status updated!', 'success');
        loadAllOrders();
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Error updating order', 'error');
    }
};

/* =============================================
   CUSTOMER MANAGEMENT
   ============================================= */
function initCustomerManagement() {
    const customerSearch = document.getElementById('customerSearch');
    
    if (customerSearch) {
        let searchTimeout;
        customerSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadCustomers(e.target.value);
            }, 500);
        });
    }
}

async function loadCustomers(searchTerm = '') {
    const tableBody = document.getElementById('customersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        if (usersSnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="6">No customers found</td></tr>';
            return;
        }
        
        let customers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter by search term
        if (searchTerm) {
            customers = customers.filter(customer => 
                customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        tableBody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email}</td>
                <td>${formatDate(customer.createdAt)}</td>
                <td>0</td>
                <td>$0.00</td>
                <td class="table-actions">
                    <button class="view-btn" onclick="viewCustomer('${customer.id}')">View</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading customers:', error);
        tableBody.innerHTML = '<tr><td colspan="6">Error loading customers</td></tr>';
    }
}

window.viewCustomer = async function(customerId) {
    try {
        const customerDoc = await getDoc(doc(db, 'users', customerId));
        if (customerDoc.exists()) {
            const customer = customerDoc.data();
            alert(`Customer Details:\n\nName: ${customer.name}\nEmail: ${customer.email}\nJoined: ${formatDate(customer.createdAt)}`);
        }
    } catch (error) {
        console.error('Error viewing customer:', error);
    }
};console.log('Admin.js loaded successfully
