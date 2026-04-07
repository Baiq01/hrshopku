import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/Login';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminCustomOrders from './pages/admin/AdminCustomOrders';
import AdminProductEdit from './pages/admin/ProductEdit';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/Categories';
import AdminEmailLogs from './pages/admin/EmailLogs';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackShipment from './pages/TrackShipment';
import MyOrders from './pages/MyOrders';
import CustomOrder from './pages/CustomOrder';
import MyCustomOrders from './pages/MyCustomOrders';
import ProductDetail from './pages/ProductDetail';
import TailorLogin from './pages/TailorLogin';
import TailorDashboard from './pages/TailorDashboard';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/admin/login" element={<AdminLogin/>} />
      <Route path="/admin" element={<AdminDashboard/>} />
      <Route path="/admin/categories" element={<AdminCategories/>} />
      <Route path="/admin/products" element={<AdminProducts/>} />
  <Route path="/admin/products/:id/edit" element={<AdminProductEdit/>} />
      <Route path="/admin/orders" element={<AdminOrders/>} />
      <Route path="/admin/orders/:id" element={<AdminOrderDetail/>} />
      <Route path="/admin/custom-orders" element={<AdminCustomOrders/>} />
      <Route path="/admin/email-logs" element={<AdminEmailLogs/>} />
      <Route path="/cart" element={<Cart/>} />
      <Route path="/checkout" element={<Checkout/>} />
      <Route path="/track" element={<TrackShipment/>} />
      <Route path="/my-orders" element={<MyOrders/>} />
      <Route path="/custom-order" element={<CustomOrder/>} />
      <Route path="/my-custom-orders" element={<MyCustomOrders/>} />
  <Route path="/product/:id" element={<ProductDetail/>} />
      <Route path="/tailor/login" element={<TailorLogin/>} />
      <Route path="/tailor" element={<TailorDashboard/>} />
    </Routes>
  )
}
