import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Text, 
  List, 
  ListItem, 
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';
import { productService, inventoryService } from '../utils/api';
import Auth from '../utils/auth';

function RegisterProductInput() {
  const bg = useColorModeValue("white", "gray.800");
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('');
  const [batch, setBatch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleProductNameChange = async (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await productService.search(value);
      setSuggestions(response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSuggestionClick = (product) => {
    setProductName(product.name);
    setProductId(product._id);
    setSuggestions([]);
  };

  const handleAddProduct = () => {
    if (!productName || !productQuantity || !productId) {
      toast({
        title: 'Error',
        description: 'Please fill all product fields',
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

const handleReceive = async () => {
  if (products.length === 0) {
    toast({
      title: 'Error',
      description: 'Please add at least one product',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setIsLoading(true);

  try {
    // Process each product individually
    for (const product of products) {
      await inventoryService.create({
        name: product.name,
        quantity: product.quantity,
        categoryId: product.category // Make sure this is available
      });
    }
    
    toast({
      title: 'Success',
      description: 'Products added to inventory',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    setProducts([]);
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to add products',
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
                  {suggestions.map((product) => (
                    <ListItem 
                      key={product._id} 
                      p={2} 
                      _hover={{ bg: 'gray.100' }}
                      onClick={() => handleSuggestionClick(product)}
                      cursor="pointer"
                    >
                      {product.name}
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
                <Text fontWeight="bold" mb={2}>Products to Receive:</Text>
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
            <Text fontSize="lg" mb={4}>Transaction Details</Text>
            <Input 
              placeholder="Number of units per item" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              type="number" 
              min="1"
              mb={3}
            />
            <Input 
              placeholder="Purpose of receiving" 
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
              onClick={handleReceive} 
              colorScheme="green"
              width="full"
              isLoading={isLoading}
              loadingText="Processing..."
            >
              Record Receipt
            </Button>
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default RegisterProductInput;