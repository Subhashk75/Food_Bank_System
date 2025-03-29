import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const API_URL = 'http://localhost:3001/api/v1/products';

const ProductList = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.700', 'gray.200');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log("productlist file inside festchProdouct")
        setProducts(response.data);
      } catch (err) {
        console.log("error  productlist file inside festchProdouct")

        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle delete request
  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API_URL}/${productId}`);
      console.log("productlist file inside handledlete")

      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      console.log(" error productlist file inside handledelete")

      console.error('Error deleting product:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={4} p={5} bg={bg} borderRadius="md">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Quantity</Th>
                  <Th>Description</Th>
                  <Th>Modify Item</Th>
                  <Th>Delete Item</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr key={product._id}>
                    <Td>{product.name}</Td>
                    <Td>{product.quantity}</Td>
                    <Td>{product.description}</Td>
                    <Td>
                      <Link to={`/modifyitem/${product._id}`} state={{ productId: product._id }}>
                        Modify
                      </Link>
                    </Td>
                    <Td>
                      <FaTrash color="red" cursor="pointer" onClick={() => handleDelete(product._id)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex justifyContent="center" mt={4}>
            <Button as={Link} to="/additem" colorScheme="green">
              Add New Item
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default ProductList;
