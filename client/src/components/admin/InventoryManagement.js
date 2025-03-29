import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Flex,
  Image,
  IconButton,
  SimpleGrid,
  Text,
  useColorModeValue,
  useBreakpointValue,
  VStack,
  HStack
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { MdOutlineModeEdit } from 'react-icons/md';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';

const API_URL = "http://localhost:3001/api/v1/products";

function InventoryManagement() {
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API_URL}/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />

      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={{ base: 0, md: 4 }} p={5} bg={bg} borderRadius="md" color={color}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
            {products.map(product => (
              <Box key={product._id} p={4} bg="gray.100" borderRadius="lg" shadow="md">
                <VStack spacing={3} align="center">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    boxSize="100px" 
                    objectFit="cover" 
                    borderRadius="md"
                  />
                  <Text fontSize="lg" fontWeight="bold">Food Name :{product.name}</Text>
                  {!isMobile && <Text fontSize="sm">Food Description :{product.description}</Text>}
                  <Text fontSize="md" fontWeight="bold">Quantity: {product.quantity}</Text>

                  <HStack spacing={3}>
                    <Button as={Link} to={`/modifyitem/${product._id}`} leftIcon={<MdOutlineModeEdit />} colorScheme="blue">
                      Edit
                    </Button>
                    <IconButton 
                      aria-label="Delete item"
                      icon={<FaTrash />}
                      colorScheme="red"
                      onClick={() => handleDelete(product._id)}
                    />
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          <Flex justifyContent='center' mt={6}>
            <Button as={Link} to='/additem' colorScheme='green'>
              Add New Item
            </Button>
          </Flex>
        </Box>
      </Flex>

      <Footer />
    </Flex>
  );
}

export default InventoryManagement;
