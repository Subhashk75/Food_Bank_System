import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
  Box,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  IconButton
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { productService } from '../components/utils/api';
import Auth from '../components/utils/auth';

const ProductList = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.700', 'gray.200');
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setProducts(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, toast]);

  // Handle delete request
  const handleDelete = async (productId) => {
    try {
      setDeletingId(productId);
      await productService.delete(productId);
      
      setProducts(products.filter((product) => product._id !== productId));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Flex direction="column" minHeight="100vh">
        <Header />
        <Flex as="main" flex="1" p={4}>
          <Sidebar />
          <Center flex="1">
            <Spinner size="xl" />
          </Center>
        </Flex>
        <Footer />
      </Flex>
    );
  }

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box 
          flex="1" 
          ml={{ base: 0, md: 4 }} 
          p={5} 
          bg={bg} 
          borderRadius="md"
          boxShadow="sm"
          overflowX="auto"
        >
          <TableContainer>
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Quantity</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <Tr key={product._id}>
                      <Td>{product.name}</Td>
                      <Td>{product.quantity}</Td>
                      <Td>{product.description || '-'}</Td>
                      <Td>{product.category?.name || '-'}</Td>
                      <Td>
                        <Flex gap={2}>
                          <Button
                            as={Link}
                            to={`/modifyitem/${product._id}`}
                            state={{ productId: product._id }}
                            size="sm"
                            colorScheme="blue"
                          >
                            Edit
                          </Button>
                          <IconButton
                            aria-label="Delete product"
                            icon={<FaTrash />}
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            isLoading={deletingId === product._id}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No products found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justifyContent="center" mt={6}>
            <Button 
              as={Link} 
              to="/additem" 
              colorScheme="green"
              size="lg"
            >
              Add New Product
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default ProductList;