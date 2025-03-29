import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Flex, Input, Button, Text, List, ListItem, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';

const API_URL = "http://localhost:3001/api/v1";

function RegisterProductInput() {
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");

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

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const handleProductNameChange = async (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/searchProduct?name=${value}`);
      console.log("inside receive item in input.js file")

      if (response.data.length > 0) {
        setSuggestions(response.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.log("inside get error  receive item in input.js file")

      console.error("Error searching product:", error);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion.name);
    setProductId(suggestion._id);
    setSuggestions([]);
  };

  const handleAddProduct = () => {
    if (productName && productQuantity && productId) {
      setProducts([...products, { name: productName, quantity: productQuantity, _id: productId }]);
      setProductName('');
      setProductQuantity('');
      setProductId('');
    }
  };

  const handleReceive = async () => {
    if (products.length > 0 && unit && purpose && batch) {
      setIsButtonDisabled(true);
      const transaction = { product: products, purpose, unit, batchSize: batch };

      try {
        await axios.post(`${API_URL}/inventory`, transaction);
        console.log("inside handle Recieve in input.js file")
        setDoneMessage('Transaction submitted successfully!');
        setProducts([]);
      } catch (error) {
        console.log("inside get error handle Recieve in input.js file")

        setErrorMessage('Error submitting transaction');
      }
    } else {
      setErrorMessage('Complete the transaction information before submitting');
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Flex bg={bg} borderRadius="md" flex="1" color={color} direction="row">
          <Box flex="1" bg={bg} borderRadius="md" marginEnd="5px">
            <Text mb={4}>Select Product:</Text>
            <Input
              placeholder="Type product name"
              value={productName}
              onChange={handleProductNameChange}
            />
            {suggestions.length > 0 && (
              <List bg="gray.100" borderRadius="md" mt={2} p={2}>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    cursor="pointer"
                    p={1}
                    _hover={{ bg: "gray.200" }}
                  >
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
            <Button onClick={handleAddProduct} mt={2}>Add Quantity</Button>
            <List spacing={3} mt={3}>
              {products.map((product, index) => (
                <ListItem key={index}>{product.name} - Quantity: {product.quantity}</ListItem>
              ))}
            </List>
          </Box>
          <Box flex="1" bg={bg} borderRadius="md">
            <Text mb={4}>Transaction Info:</Text>
            <Input placeholder="Enter number of units" value={unit} onChange={(e) => setUnit(e.target.value)} type="number" />
            <Input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} type="text" />
            <Input placeholder="Batch Size" value={batch} onChange={(e) => setBatch(e.target.value)} type="text" />
            <Button onClick={handleReceive} mt={2} disabled={isButtonDisabled}>Receive</Button>
            {errorMessage && <Text mt={2} color="red.500">{errorMessage}</Text>}
            {doneMessage && <Text mt={2} color="green.500">{doneMessage}</Text>}
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default RegisterProductInput;
