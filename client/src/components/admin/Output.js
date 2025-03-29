import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Flex, Box, List, ListItem, useColorModeValue } from '@chakra-ui/react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';

const API_URL = "http://localhost:3001/api/v1/products"; // Updated base URL

function RegisterProductOutput() {
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");

  const [productName, setProductName] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_URL); // Adjusted endpoint
        console.log("respone get in output file and inside fetchProducts ")
        setSuggestions(response.data);
      } catch (err) {
        console.log(" errorr  respone get in output file and inside fetchProducts ")

        setErrorMessage('Failed to fetch products');
      }
    };

    fetchProducts();
  }, []);

  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value) {
      const filteredProducts = suggestions.filter((product) =>
        product.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredProducts);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion.name);
    setSuggestions([]);
  };

  const handleSubtractQuantity = async () => {
    if (!productName || !outputQuantity) {
      setErrorMessage('Please enter product name and quantity.');
      return;
    }

    try {
      await axios.post(`${API_URL}/subtractQuantity`, { // Updated endpoint
        name: productName,
        quantity: parseInt(outputQuantity),
      });
      console.log("respone get in output file and inside handleSubtractQuantity ")

      setSuccessMessage('Quantity updated successfully!');
      setProductName('');
      setOutputQuantity('');
    } catch (error) {
      console.log(" error respone get in output file and inside handleSubtractQuantity ")
 
      setErrorMessage('Error updating product quantity.');
      console.error(error);
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box bg={bg} borderRadius="md" flex="1" p={5} color={color}>
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
            placeholder="Enter output quantity"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(e.target.value)}
            type="number"
            mt={2}
          />
          <Button onClick={handleSubtractQuantity} mt={2}>
            Subtract Quantity
          </Button>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default RegisterProductOutput;
