//import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ViewModeRoute from './components/ViewModeRoute';
import Login from './components/Login';
import Product from './components/Product';
import ViewRoles from './Screens/ViewRoles';
import Bill from './Screens/Bill';
import Addproduct from './components/Addproduct';
import Editproduct from './components/Editproduct';
import Signup from './components/Signpup';
import Edituser from './components/Edituser';
import ViewBills from './Screens/ViewBills';

function App() {
  return (
    <AuthProvider>
   <Router>
    <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/product" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path="/view-product" element={<ViewModeRoute />} />
          <Route path="/viewRoles" element={
            <ProtectedRoute requireAdmin={true}>
              <ViewRoles />
            </ProtectedRoute>
          } />
          <Route path="/generate_bill" element={
            <ProtectedRoute>
              <Bill />
            </ProtectedRoute>
          } />
          <Route path="/addproduct" element={
            <ProtectedRoute requireAdmin={true}>
              <Addproduct />
            </ProtectedRoute>
          } />
          <Route path="/editproduct" element={
            <ProtectedRoute requireAdmin={true}>
              <Editproduct />
            </ProtectedRoute>
          } />
          <Route path="/signup" element={
            <ProtectedRoute requireAdmin={true}>
              <Signup />
            </ProtectedRoute>
          } />
          <Route path="/edituser" element={
            <ProtectedRoute requireAdmin={true}>
              <Edituser />
            </ProtectedRoute>
          } />
          <Route path="/viewbills" element={
            <ProtectedRoute>
              <ViewBills />
            </ProtectedRoute>
          } />
    </Routes>
   </Router>
    </AuthProvider>
  );
}

export default App;
