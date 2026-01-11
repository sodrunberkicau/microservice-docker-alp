

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './pages/ProductList';
import Login from './pages/Login';
import OrderList from './pages/OrderList';
import Navbar from './components/Navbar';

function App() {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token or just set state for now
            setUser({ token });
            fectProfile();
        }
    }, []);
    const fectProfile = () => {
        const token = localStorage.getItem('token');
        axios.get('http://user.localhost/api/users/profile', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                console.log(response.data, 'oke');
                setUser(response.data);
            })
            .catch(error => {
                console.error(error);
            })
    }
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsMobileMenuOpen(false);
    };

    return (
        <Router>
            <div className="app-container">
                <Navbar
                    user={user}
                    logout={logout}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main>
                    <Routes>
                        <Route path="/" element={<ProductList user={user} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/orders" element={<OrderList user={user} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
