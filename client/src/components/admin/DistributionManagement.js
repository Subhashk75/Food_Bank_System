import React, { useState, useEffect } from 'react';
import { Box, Flex, Input, Button, Text, List, ListItem, useColorModeValue, useToast } from '@chakra-ui/react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';
import { useNavigate } from "react-router-dom";
import { productService, distributionService } from '../utils/api';
import Auth from '../utils/auth';

function Distribution() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('');
  const [batch, setBatch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const bg = useColorModeValue("white", "gray.800");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setSuggestions(response.data || []);
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchProducts();
  }, [toast, navigate]);

  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value) {
      const filtered = suggestions.filter((p) =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion.name);
    setProductId(suggestion._id);
    setSuggestions([]);
  };

  const handleAddProduct = () => {
    if (!productName || !productQuantity || !productId) {
      toast({
        title: 'Error',
        description: 'Please fill out all fields before adding.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setProducts([...products, {
      name: productName,
      quantity: parseInt(productQuantity),
      _id: productId
    }]);

    setProductName('');
    setProductQuantity('');
    setProductId('');
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

const handleDistribute = async () => {
  if (products.length === 0 || !unit || !purpose || !batch) {
    toast({
      title: 'Error',
      description: 'Complete all fields before submitting.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setIsLoading(true);

  try {
    const distributionPayload = products.map((product) => ({
      product: product._id,
      quantity: Number(product.quantity),
      unit: Number(unit), // Ensure unit is a number
      operation: "Distribute", // Add this required field
      purpose,
      batch,
    }));

    // Validate payload before sending
    for (const item of distributionPayload) {
      if (!item.product || isNaN(item.quantity) || isNaN(item.unit) || !item.purpose || !item.batch) {
        throw new Error('Invalid distribution data');
      }
    }

    await distributionService.create(distributionPayload);

    toast({
      title: 'Success',
      description: 'Distribution recorded successfully!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    setProducts([]);
    setUnit('');
    setPurpose('');
    setBatch('');
    navigate('/dashboard');
  } catch (err) {
    toast({
      title: 'Error',
      description: err.message || 'Error submitting distribution.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Flex flex="1" p={5} bg="gray.100" borderRadius="md" gap={4}>
          <Box flex="1" bg={bg} borderRadius="md" p={4}>
            <Text fontSize="lg" mb={4}>Add Products</Text>
            <Input
              placeholder="Type product name"
              value={productName}
              onChange={handleProductNameChange}
              mb={2}
            />
            {suggestions.length > 0 && (
              <Box border="1px" borderColor="gray.200" borderRadius="md" maxH="200px" overflowY="auto" mb={2}>
                <List>
                  {suggestions.map((s) => (
                    <ListItem 
                      key={s._id} 
                      p={2} 
                      _hover={{ bg: 'gray.100' }}
                      onClick={() => handleSuggestionClick(s)}
                      cursor="pointer"
                    >
                      {s.name}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Input
              placeholder="Enter product quantity"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              type="number"
              min="1"
              mb={2}
            />
            <Button onClick={handleAddProduct} colorScheme="blue" width="full">
              Add Product
            </Button>
            
            {products.length > 0 && (
              <Box mt={4}>
                <Text fontWeight="bold" mb={2}>Products to Distribute:</Text>
                <List spacing={2}>
                  {products.map((product, index) => (
                    <ListItem 
                      key={index} 
                      p={2} 
                      bg="gray.50" 
                      borderRadius="md"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text>{product.name} - Quantity: {product.quantity}</Text>
                      <Button 
                        size="sm" 
                        colorScheme="red"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Remove
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Box flex="1" bg={bg} borderRadius="md" p={4}>
            <Text fontSize="lg" mb={4}>Distribution Details</Text>
            <Input 
              placeholder="Number of units per item" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              type="number" 
              min="1"
              mb={3}
            />
            <Input 
              placeholder="Purpose of distribution" 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)} 
              mb={3}
            />
            <Input 
              placeholder="Batch identifier" 
              value={batch} 
              onChange={(e) => setBatch(e.target.value)} 
              mb={4}
            />
            <Button 
              onClick={handleDistribute} 
              colorScheme="green"
              width="full"
              isLoading={isLoading}
              loadingText="Processing..."
            >
              Record Distribution
            </Button>
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default Distribution;