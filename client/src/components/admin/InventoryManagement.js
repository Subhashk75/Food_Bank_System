import React, { useEffect, useState } from 'react';
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
  HStack,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { MdOutlineModeEdit } from 'react-icons/md';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import Footer from '../layout/Footer';
import { productService } from '../utils/api';
import Auth from '../utils/auth';

function InventoryManagement() {
  const bg = useColorModeValue("white", "gray.800");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll();
      if (response.success) {
        setProducts(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      showErrorToast('Failed to fetch products', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showErrorToast = (title, description) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const showSuccessToast = (title, description) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      showErrorToast('Error', 'Invalid product ID');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await productService.delete(productId);
      
      if (response.success) {
        setProducts(prev => prev.filter(product => product._id !== productId));
        showSuccessToast('Success', 'Product deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      showErrorToast('Error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderLoadingState = () => (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Center flex="1">
          <Spinner size="xl" thickness="4px" emptyColor="gray.200" color="blue.500" />
        </Center>
      </Flex>
      <Footer />
    </Flex>
  );

  const renderErrorState = () => (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Center flex="1">
          <Alert status="error" borderRadius="md" maxW="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error loading products</Text>
              <Text>{error}</Text>
              <Button mt={3} colorScheme="red" onClick={fetchProducts}>
                Retry
              </Button>
            </Box>
          </Alert>
        </Center>
      </Flex>
      <Footer />
    </Flex>
  );

  const renderEmptyState = () => (
    <Center h="200px" flexDirection="column">
      <Text fontSize="lg" mb={4}>No products found in inventory</Text>
      <Button as={Link} to="/additem" colorScheme="green">
        Add Your First Product
      </Button>
    </Center>
  );

  const renderProductCard = (product) => (
    <Box key={product._id} p={4} bg="gray.50" borderRadius="lg" shadow="md" _hover={{ shadow: 'lg' }}>
      <VStack spacing={3} align="center">
        <Image 
          src={product.image || '/placeholder-product.png'} 
          alt={product.name} 
          boxSize="120px" 
          objectFit="cover" 
          borderRadius="md"
          fallbackSrc="/placeholder-product.png"
        />
        <Text fontSize="lg" fontWeight="bold" textAlign="center">{product.name}</Text>
        {!isMobile && (
          <Text fontSize="sm" noOfLines={2} textAlign="center">
            {product.description || 'No description available'}
          </Text>
        )}
        <Text fontSize="md" fontWeight="semibold">
          Quantity: {product.quantity || 0}
        </Text>
        <HStack spacing={3} mt={2}>
          <Button 
            as={Link} 
            to={`/modifyitem/${product._id}`} 
            leftIcon={<MdOutlineModeEdit />} 
            colorScheme="blue"
            size="sm"
            isLoading={isDeleting}
          >
            Edit
          </Button>
          <IconButton 
            aria-label={`Delete ${product.name}`}
            icon={<FaTrash />}
            colorScheme="red"
            size="sm"
            onClick={() => handleDelete(product._id)}
            isLoading={isDeleting}
            isDisabled={isDeleting}
          />
        </HStack>
      </VStack>
    </Box>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={{ base: 0, md: 4 }} p={5} bg={bg} borderRadius="md" boxShadow="sm">
          {products.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
                {products.map(renderProductCard)}
              </SimpleGrid>
              <Flex justifyContent="center" mt={6}>
                <Button 
                  as={Link} 
                  to="/additem" 
                  colorScheme="green" 
                  size="lg"
                  leftIcon={<MdOutlineModeEdit />}
                >
                  Add New Item
                </Button>
              </Flex>
            </>
          )}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default InventoryManagement;