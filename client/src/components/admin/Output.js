import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Flex, 
  Box, 
  List, 
  ListItem, 
  useColorModeValue,
  useToast,
  Text
} from '@chakra-ui/react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';
import { productService } from '../utils/api';
import Auth from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function RegisterProductOutput() {
  const bg = useColorModeValue("white", "gray.800");
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }

    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setSuggestions(response.data);
      } catch (error) {
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
  }, [navigate, toast]);

  const handleProductNameChange = async (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await productService.search(value);
      setSuggestions(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    setProductName(product.name);
    setProductId(product._id);
    setSuggestions([]);
  };

  const handleSubtractQuantity = async () => {
    if (!productName || !outputQuantity || !productId) {
      toast({
        title: 'Error',
        description: 'Please select a product and enter quantity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await productService.updateQuantity(
        productId,
        {
          quantity: parseInt(outputQuantity),
          operation: 'subtract'
        }
      );

      toast({
        title: 'Success',
        description: 'Product quantity updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setProductName('');
      setProductId('');
      setOutputQuantity('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product quantity',
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
        <Box 
          bg={bg} 
          borderRadius="md" 
          flex="1" 
          p={5}
          boxShadow="md"
        >
          <Text fontSize="xl" fontWeight="bold" mb={4}>Register Product Output</Text>
          
          <Input
            placeholder="Type product name"
            value={productName}
            onChange={handleProductNameChange}
            mb={2}
          />

          {suggestions.length > 0 && productName && (
            <Box 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md" 
              maxH="200px" 
              overflowY="auto"
              mb={2}
            >
              <List>
                {suggestions.map((product) => (
                  <ListItem 
                    key={product._id} 
                    p={2} 
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => handleSuggestionClick(product)}
                    cursor="pointer"
                  >
                    {product.name} (Current: {product.quantity})
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Input
            placeholder="Enter output quantity"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(e.target.value)}
            type="number"
            min="1"
            mb={2}
          />

          <Button 
            onClick={handleSubtractQuantity} 
            colorScheme="red"
            isLoading={isLoading}
            loadingText="Processing..."
            width="full"
          >
            Record Output
          </Button>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default RegisterProductOutput;