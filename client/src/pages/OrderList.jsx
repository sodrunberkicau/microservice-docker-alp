import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderList = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [uploading, setUploading] = useState({});
    const [showImageModal, setShowImageModal] = useState({});
    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
    const API_URL ='http://order.localhost';

    useEffect(() => {
        // Check screen width for mobile detection
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('token');
        setLoading(true);

        fetchOrders(token);
    }, [user, API_URL]);

    const fetchOrders = (token) => {
        axios.get(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setOrders(res.data);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load orders');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleUploadTrxProof = (orderId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
            return;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        const token = localStorage.getItem('token');
        setUploading(prev => ({ ...prev, [orderId]: true }));

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;

            // Kirim ke API
            axios.patch(`${API_URL}/api/orders/${orderId}/upload-proof`,
                {
                    trxProof: base64String,
                    fileName: file.name,
                    fileType: file.type
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
                .then(res => {
                    // Update order list dengan data baru
                    fetchOrders(token);
                    // Show success message
                    alert('Transaction proof uploaded successfully!');
                })
                .catch(err => {
                    console.error('Upload error:', err);
                    const errorMessage = err.response?.data?.message || 'Failed to upload proof';
                    alert(`Error: ${errorMessage}`);
                })
                .finally(() => {
                    setUploading(prev => ({ ...prev, [orderId]: false }));
                    // Reset file input
                    e.target.value = '';
                });
        };

        reader.onerror = (error) => {
            console.error('File reading error:', error);
            alert('Error reading file. Please try again.');
            setUploading(prev => ({ ...prev, [orderId]: false }));
            e.target.value = '';
        };

        reader.readAsDataURL(file);
    };

    const handleViewProof = (orderId, imageUrl) => {
        setShowImageModal(prev => ({ ...prev, [orderId]: true }));
    };

    const closeImageModal = (orderId) => {
        setShowImageModal(prev => ({ ...prev, [orderId]: false }));
    };

    // Hitung total keseluruhan
    const overallTotal = orders.reduce((sum, order) => sum + parseFloat(order.price), 0);
    const totalItems = orders.reduce((sum, order) => sum + order.quantity, 0);
    const averagePrice = orders.length > 0 ? overallTotal / orders.length : 0;
    console.log(averagePrice, overallTotal);
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Truncate description
    const truncateDescription = (text, maxLength = 80) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Get color based on price range
    const getPriceColor = (price) => {
        if (price > 2000) return 'text-red-600 bg-red-50';
        if (price > 1000) return 'text-orange-600 bg-orange-50';
        if (price > 500) return 'text-yellow-600 bg-yellow-50';
        if (price > 100) return 'text-green-600 bg-green-50';
        return 'text-blue-600 bg-blue-50';
    };

    // Get badge color based on quantity
    const getQuantityBadge = (quantity) => {
        if (quantity > 5) return 'bg-purple-100 text-purple-800';
        if (quantity > 2) return 'bg-indigo-100 text-indigo-800';
        if (quantity > 1) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Mobile order card component
    const MobileOrderCard = ({ order, index }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                    <div>
                        <div className="font-bold text-gray-900">ORD-{String(order.id).padStart(3, '0')}</div>
                        <div className="text-xs text-gray-500">ID: {order.product_id}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getQuantityBadge(order.quantity)}`}>
                        {order.quantity} pcs
                    </span>
                    {order.status && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{order.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                    {isMobile ? truncateDescription(order.description, 60) : order.description}
                </p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="text-sm text-gray-500">Unit Price</div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getPriceColor(order.price)}`}>
                        {formatCurrency(order.price)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total)}
                    </div>
                </div>
            </div>

            {/* Transaction Proof Section - Mobile */}
            <div className="mb-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Transaction Proof</span>
                    {order.trxProof && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Uploaded
                        </span>
                    )}
                </div>

                {order.trxProof ? (
                    <div className="space-y-2">
                        <div
                            className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => handleViewProof(order.id, order.trxProof)}
                        >
                            <img
                                src={order.trxProof}
                                alt="Transaction Proof"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white opacity-0 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6" />
                                </svg>
                            </div>
                        </div>
                        <button
                            onClick={() => document.getElementById(`file-input-mobile-${order.id}`).click()}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            Change Proof
                        </button>
                    </div>
                ) : (
                    <label className="block">
                        <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                            {uploading[order.id] ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-600">Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-sm text-gray-600">Upload Proof</span>
                                </>
                            )}
                        </div>
                        <input
                            id={`file-input-mobile-${order.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadTrxProof(order.id, e)}
                            disabled={uploading[order.id]}
                        />
                    </label>
                )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                    View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    Reorder
                </button>
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Required</h2>
                    <p className="text-gray-600 mb-6">Please login to view your order history.</p>
                    <a href="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-4 text-lg text-gray-700">Loading your orders...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                            <p className="text-gray-600 text-sm md:text-base">View all your purchases and upload transaction proofs</p>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="text-right">
                                <div className="text-xs md:text-sm text-gray-500">Total Orders</div>
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</div>
                            </div>
                            <div className="h-8 md:h-10 w-px bg-gray-300"></div>
                            <div className="text-right">
                                <div className="text-xs md:text-sm text-gray-500">Total Spent</div>
                                <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(overallTotal)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Total Items</div>
                                    <div className="text-xl md:text-2xl font-bold text-gray-900">{totalItems}</div>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Average Order Value</div>
                                    <div className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(averagePrice)}</div>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Products Ordered</div>
                                    <div className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</div>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile View - Order Cards */}
                {isMobile && orders.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Orders ({orders.length})</h2>
                        {orders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <MobileOrderCard order={order} index={index} />
                                {/* Image Modal for Mobile */}
                                {showImageModal[order.id] && order.trxProof && (
                                    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
                                            <div className="flex justify-between items-center p-4 border-b">
                                                <h3 className="text-lg font-semibold">Transaction Proof</h3>
                                                <button
                                                    onClick={() => closeImageModal(order.id)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <img
                                                    src={order.trxProof}
                                                    alt="Transaction Proof"
                                                    className="w-full h-auto max-h-[70vh] object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Desktop View - Orders Table */}
                {!isMobile && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-2">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Order ID</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Product</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Status</span>
                                </div>
                                <div className="col-span-1 text-center">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Qty</span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Price</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Total</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-sm font-semibold text-gray-700 uppercase">Transaction Proof</span>
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                orders.map((order, index) => (
                                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            {/* Order ID */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">ORD-{String(order.id).padStart(3, '0')}</div>
                                                        <div className="text-xs text-gray-500">ID: {order.product_id}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Name */}
                                            <div className="col-span-2">
                                                <div className="font-medium text-gray-900 truncate">{order.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Product #{order.product_id}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2">
                                                {order.status && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-1">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQuantityBadge(order.quantity)}`}>
                                                        {order.quantity}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-1 text-right">
                                                <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getPriceColor(order.price)}`}>
                                                    {formatCurrency(order.price)}
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-2 text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(order.total)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.quantity} × {formatCurrency(order.price)}
                                                </div>
                                            </div>

                                            {/* Transaction Proof */}
                                            <div className="col-span-2">
                                                {order.trxProof ? (
                                                    <div className="space-y-2">
                                                        <div
                                                            className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => handleViewProof(order.id, order.trxProof)}
                                                        >
                                                            <img
                                                                src={order.trxProof}
                                                                alt="Transaction Proof"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white opacity-0 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => document.getElementById(`file-input-desktop-${order.id}`).click()}
                                                            className="text-xs text-blue-600 hover:text-blue-700"
                                                        >
                                                            Change Proof
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="block">
                                                        <div className={`flex flex-col items-center justify-center h-16 border-2 border-dashed ${uploading[order.id] ? 'border-blue-300' : 'border-gray-300'} rounded-lg hover:border-blue-500 transition-colors cursor-pointer`}>
                                                            {uploading[order.id] ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                    <span className="text-xs text-gray-600">Uploading...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                    </svg>
                                                                    <span className="text-xs text-gray-600">Upload Proof</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <input
                                                            id={`file-input-desktop-${order.id}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleUploadTrxProof(order.id, e)}
                                                            disabled={uploading[order.id]}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Table Footer */}
                        {orders.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {orders.length} of {orders.length} orders
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">Grand Total</div>
                                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(overallTotal)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Image Modal for Desktop */}
                {Object.keys(showImageModal).map(orderId => {
                    const order = orders.find(o => o.id == orderId);
                    if (showImageModal[orderId] && order?.trxProof) {
                        return (
                            <div key={orderId} className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                                    <div className="flex justify-between items-center p-4 border-b">
                                        <h3 className="text-lg font-semibold">Transaction Proof - Order {orderId}</h3>
                                        <button
                                            onClick={() => closeImageModal(orderId)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src={order.trxProof}
                                            alt="Transaction Proof"
                                            className="w-full h-auto max-h-[70vh] object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}

                {/* Summary Cards */}
                {orders.length > 0 && (
                    <div className="mt-8">
                        {/* Mobile View - Stacked Cards */}
                        <div className="md:hidden space-y-4">
                            {/* Top Products Card - Mobile */}
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-semibold text-gray-900">Top Products</h3>
                                    <span className="text-xs text-gray-500">By Quantity</span>
                                </div>
                                <div className="space-y-3">
                                    {[...orders]
                                        .sort((a, b) => b.quantity - a.quantity)
                                        .slice(0, 3)
                                        .map((order, index) => (
                                            <div key={order.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'}`}>
                                                        <span className={`text-xs font-bold ${index === 0 ? 'text-yellow-800' : index === 1 ? 'text-gray-800' : 'text-orange-800'}`}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-gray-900 text-sm truncate">{order.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>{order.quantity} units</span>
                                                            <span>•</span>
                                                            <span className="truncate">{formatCurrency(order.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Price Distribution Card - Mobile */}
                            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-semibold text-gray-900">Price Distribution</h3>
                                    <span className="text-xs text-gray-500">{orders.length} orders</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Under $100', count: orders.filter(o => o.price < 100).length },
                                        { label: '$100 - $500', count: orders.filter(o => o.price >= 100 && o.price < 500).length },
                                        { label: '$500 - $1000', count: orders.filter(o => o.price >= 500 && o.price < 1000).length },
                                        { label: 'Over $1000', count: orders.filter(o => o.price >= 1000).length }
                                    ].map((range, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-700">{range.label}</span>
                                                <span className="text-xs font-medium text-gray-900">{range.count} orders</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${(range.count / Math.max(orders.length, 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 w-10 text-right">
                                                    {orders.length > 0 ? Math.round((range.count / orders.length) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Desktop/Tablet View - Grid Layout */}
                        <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Products by Quantity - Desktop */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Top Products by Quantity</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Top 3
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {[...orders]
                                        .sort((a, b) => b.quantity - a.quantity)
                                        .slice(0, 3)
                                        .map((order, index) => (
                                            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'}`}>
                                                        <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-800' : index === 1 ? 'text-gray-800' : 'text-orange-800'}`}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">{order.name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>Product #{order.product_id}</span>
                                                            <span>•</span>
                                                            <span>{order.quantity} units</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatCurrency(order.price)} each
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    {orders.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                            </svg>
                                            <p>No orders yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price Distribution - Desktop */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Price Distribution</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {orders.length} orders
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        {
                                            label: 'Under $100',
                                            count: orders.filter(o => o.price < 100).length,
                                            color: 'bg-blue-500',
                                            icon: (
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: '$100 - $500',
                                            count: orders.filter(o => o.price >= 100 && o.price < 500).length,
                                            color: 'bg-green-500',
                                            icon: (
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: '$500 - $1000',
                                            count: orders.filter(o => o.price >= 500 && o.price < 1000).length,
                                            color: 'bg-yellow-500',
                                            icon: (
                                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                                </svg>
                                            )
                                        },
                                        {
                                            label: 'Over $1000',
                                            count: orders.filter(o => o.price >= 1000).length,
                                            color: 'bg-red-500',
                                            icon: (
                                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            )
                                        }
                                    ].map((range, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {range.icon}
                                                    <span className="text-sm text-gray-700">{range.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{range.count} orders</span>
                                                    <span className="text-xs text-gray-500 w-10 text-right">
                                                        {orders.length > 0 ? Math.round((range.count / orders.length) * 100) : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className={`h-2.5 rounded-full ${range.color} transition-all duration-500`}
                                                    style={{ width: `${(range.count / Math.max(orders.length, 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>0%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    ))}

                                    {orders.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                            <p>No data available for price distribution</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderList;