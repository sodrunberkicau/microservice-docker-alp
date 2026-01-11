import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductList = ({ user }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk Toast Notification
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success', // 'success', 'error', 'warning', 'info'
        title: ''
    });

    useEffect(() => {
        axios.get(`${API_URL}/api/products`)
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load products');
                setLoading(false);
            });
    }, [API_URL]);

    // Fungsi untuk menampilkan toast
    const showToast = (message, type = 'info', title = '') => {
        setToast({
            show: true,
            message,
            type,
            title: title || getTitleByType(type)
        });

        // Auto hide setelah 5 detik
        setTimeout(() => {
            hideToast();
        }, 5000);
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const getTitleByType = (type) => {
        switch (type) {
            case 'success': return 'Success!';
            case 'error': return 'Error!';
            case 'warning': return 'Warning!';
            case 'info': return 'Info';
            default: return '';
        }
    };

    const getIconByType = (type) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const buy = (productId, price) => {
        if (!user) {
            showToast('Please login to purchase products', 'warning');
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            showToast('Session expired. Please login again.', 'error');
            return;
        }

        axios.post(`${API_URL}/api/orders`, {
            items: [{ productId, quantity: 1, price }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => {
                // Mengambil message dari response.data.message jika ada
                const message = response?.data?.message || 'Order created successfully!';
                showToast(message, 'success');

                // Log untuk debugging
                console.log('Order response:', response.data);
            })
            .catch(err => {
                // Mengambil message dari error response jika ada
                let errorMessage = 'Error creating order';

                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.message) {
                    errorMessage = err.message;
                }

                showToast(errorMessage, 'error');

                // Log error lengkap untuk debugging
                console.error('Order error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    headers: err.response?.headers
                });
            });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
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
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Toast Notification */}
            <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                <div className={`relative flex w-full max-w-sm overflow-hidden rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : toast.type === 'error' ? 'bg-red-50 border border-red-200' : toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className={`w-1 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>

                    <div className="flex items-center p-4">
                        <div className={`flex-shrink-0 ${toast.type === 'success' ? 'text-green-500' : toast.type === 'error' ? 'text-red-500' : toast.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                            {getIconByType(toast.type)}
                        </div>

                        <div className="ml-3">
                            {toast.title && (
                                <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : toast.type === 'error' ? 'text-red-800' : toast.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}>
                                    {toast.title}
                                </p>
                            )}
                            <p className={`text-sm ${toast.type === 'success' ? 'text-green-700' : toast.type === 'error' ? 'text-red-700' : toast.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>
                                {toast.message}
                            </p>
                        </div>

                        <button
                            onClick={hideToast}
                            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-400 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${toast.type === 'success' ? 'bg-green-400' : toast.type === 'error' ? 'bg-red-400' : toast.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'}`}>
                        <div
                            className={`h-full ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'}`}
                            style={{
                                width: toast.show ? '100%' : '0%',
                                transition: toast.show ? 'width 5s linear' : 'none'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h2>
                <p className="text-gray-600">Discover our collection of premium products</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-gray-500">Check back later for new products.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                            {/* Product Image */}
                            <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center">
                                {p.image ? (
                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-500 text-sm mt-2 block">Product Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 truncate">{p.name}</h3>
                                    {p.stock && p.stock < 10 && (
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            Low Stock
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-4 line-clamp-2 h-12">{p.description}</p>

                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">${p.price}</p>
                                        {p.originalPrice && p.originalPrice > p.price && (
                                            <p className="text-sm text-gray-500 line-through">${p.originalPrice}</p>
                                        )}
                                    </div>

                                    {p.rating && (
                                        <div className="flex items-center">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`h-5 w-5 ${i < Math.floor(p.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="ml-1 text-gray-600 text-sm">{p.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => buy(p.id, p.price)}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-300 ${user ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'}`}
                                >
                                    {user ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            Buy Now
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                            </svg>
                                            Login to Purchase
                                        </div>
                                    )}
                                </button>

                                {p.stock !== undefined && (
                                    <div className="mt-4 text-center">
                                        <div className="text-sm text-gray-500 mb-1">
                                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                        </div>
                                        {p.stock > 0 && (
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;