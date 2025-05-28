import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, CSSReset } from '@chakra-ui/react';

import theme from "./theme";

// Auth Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Admin Dashboard & Pages
import Dashboard from "./components/admin/Dashboard";
import Distribution from "./components/admin/DistributionManagement";
import Inventory from "./components/admin/InventoryManagement";
import Inputs from './components/admin/Input';
import Output from './components/admin/Output';
import PrivacyPolicy from './components/admin/PrivacyPolicy';
import TermsOfService from './components/admin/TermsOfService';
import AboutUs from './components/admin/AboutUs';

// Product & Distribution
import ProductList from './pages/productlist';
import AddItem from './pages/additem';
import ModifyItem from './pages/modifyitem';
import BoM from "./pages/DistributionRequest";
import DistributionReport from "./pages/DistributionReportPage";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode="light" />
      <CSSReset />
      <Router>
        <div className="flex-column justify-center align-center min-100-vh bg-primary">
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin & Management */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/distribution" element={<Distribution />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inputs" element={<Inputs />} />
            <Route path="/output" element={<Output />} />

            {/* Product & Transactions */}
            <Route path="/productlist" element={<ProductList />} />
            <Route path="/additem" element={<AddItem />} />
            <Route path="/modifyitem" element={<ModifyItem />} />
            <Route path="/modifyitem/:productId" element={<ModifyItem />} />

            {/* Distribution Reports */}
            <Route path="/BoM" element={<BoM />} />
            <Route path="/distributionreport" element={<DistributionReport />} />

            {/* Static Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/aboutus" element={<AboutUs />} />

            {/* 404 Route */}
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
