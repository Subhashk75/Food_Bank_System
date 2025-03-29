import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Flex, Input, Button, Text, List, ListItem, useColorModeValue } from '@chakra-ui/react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/v1"; // Adjust based on your backend

function Distribution() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('');
  const [batch, setBatch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`); // Updated to /products
        console.log("respone get in Distributionmangement file and inside fectch Prodout ")

        setSuggestions(response.data);
      } catch (err) {
        console.log(" error get respone get in Distributionmangement file and inside fectch Prodout ")

        setErrorMessage("Failed to fetch products.");
      }
    };
    fetchProducts();
  }, []);

  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value) {
      const filteredProducts = suggestions.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredProducts);
    } else {
      setSuggestions([]); // Reset suggestions when input is cleared
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion.name);
    setProductId(suggestion._id);
    setSuggestions([]);
  };

  const handleAddProduct = () => {
    if (!productName || !productQuantity || !productId) {
      setErrorMessage('Please fill out all fields before adding.');
      return;
    }

    setProducts([...products, { name: productName, quantity: parseInt(productQuantity), _id: productId }]);
    setProductName('');
    setProductQuantity('');
    setProductId('');
    setErrorMessage('');
  };

  const handleDistribute = async () => {
    if (products.length === 0 || !unit || !purpose || !batch) {
      setErrorMessage('Complete all fields before submitting.');
      return;
    }

    setIsButtonDisabled(true);
    setErrorMessage('');

    const transaction = {
      operation: "Distribute", // Added operation for distribution
      products,
      purpose,
      unit: parseInt(unit),
      batchSize: batch
    };

    try {
      await axios.post(`${API_URL}/distribution`, transaction);
      console.log("respone get in Distributionmangement file and inside handleDistribute  ")

      setDoneMessage('Transaction submitted successfully!');
      setTimeout(() => {
        setProducts([]);
        setUnit('');
        setPurpose('');
        setBatch('');
        setIsButtonDisabled(false);
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setErrorMessage('Error submitting transaction.');
      setIsButtonDisabled(false);
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Flex flex="1" p={5} bg="gray.100" borderRadius="md">
          <Box flex="1" bg={bg} borderRadius="md" marginEnd='5px'>
            <Text mb={4}>Add Products:</Text>
            <Input
              placeholder="Type product name"
              value={productName}
              onChange={handleProductNameChange}
            />
            {suggestions.length > 0 && (
              <List>
                {suggestions.map((suggestion) => (
                  <ListItem key={suggestion._id} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion.name}
                  </ListItem>
                ))}
              </List>
            )}
            <Input
              placeholder="Enter product quantity"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              type="number"
              mt={2}
            />
            <Button onClick={handleAddProduct} mt={2}>
              Add Product
            </Button>
            <List spacing={3} mt={3}>
              {products.map((product, index) => (
                <ListItem key={index}>
                  {product.name} - Quantity: {product.quantity}
                </ListItem>
              ))}
            </List>
          </Box>

          <Box flex="1" bg={bg} borderRadius="md">
            <Text mb={4}>Transaction Info:</Text>
            <Input placeholder="Enter number of units" value={unit} onChange={(e) => setUnit(e.target.value)} type="number" />
            <Input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} type="text" mt={2} />
            <Input placeholder="Batch Size" value={batch} onChange={(e) => setBatch(e.target.value)} type="text" mt={2} />
            <Button onClick={handleDistribute} mt={2} disabled={isButtonDisabled}>
              Distribute
            </Button>
            {errorMessage && <Text color="red.500">{errorMessage}</Text>}
            {doneMessage && <Text color="green.500">{doneMessage}</Text>}
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default Distribution;