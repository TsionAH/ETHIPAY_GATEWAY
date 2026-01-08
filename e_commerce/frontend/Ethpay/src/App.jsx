import MainLayout from './layout/MainLayout.jsx';
import HomePage from './components/Home/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
 // ADD THIS IMPORT
import OrderSuccess from './pages/OrderSuccess.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Routes>
            <Route path="/" element={
                <MainLayout>
                    <HomePage />
                </MainLayout>
            } />
            <Route path="/products" element={
                <MainLayout>
                    <ProductsPage />
                </MainLayout>
            } />
            <Route path="/products/:id" element={
                <MainLayout>
                    <ProductDetail />
                </MainLayout>
            } />
            <Route path="/cart" element={
                <MainLayout>
                    <CartPage />
                </MainLayout>
            } />
            <Route path="/checkout" element={
                <MainLayout>
                    <CheckoutPage />
                </MainLayout>
            } />
            <Route path="/order-success" element={
                <MainLayout>
                    <OrderSuccess />
                </MainLayout>
            } />
            <Route path="/login" element={
                <MainLayout>
                    <Login />
                </MainLayout>
            } />
            <Route path="/register" element={
                <MainLayout>
                    <Register />
                </MainLayout>
            } />
            
           
        </Routes>
    );
}

export default App;