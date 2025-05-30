import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Stat,
  Text,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useBreakpointValue
} from "@chakra-ui/react";
import { MdCallMade, MdCallReceived } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";
import Footer from "../layout/Footer";
import Auth from "../utils/auth";
import { inventoryService, productService, categoryService, transactionService } from "../utils/api";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productIndex, setProductIndex] = useState(null);
  const [clicked, setClicked] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const bg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const results = await Promise.allSettled([
          transactionService.getAll(),
          productService.getAll(),
          categoryService.getAll(),
          inventoryService.getAll()
        ]);

        const [transactionsData, productsData, categoriesData, inventoryData] = results;

        if (isMounted) {
          setTransactions(transactionsData.status === 'fulfilled' ? transactionsData.value.data : []);
          setProducts(productsData.status === 'fulfilled' ? productsData.value.data : []);
          setCategories(categoriesData.status === 'fulfilled' ? categoriesData.value.data : []);
          setInventory(inventoryData.status === 'fulfilled' ? inventoryData.value.data.inventory : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = (index) => {
    if (index !== productIndex) {
      setClicked(true);
      setProductIndex(index);
    } else {
      setClicked(false);
      setProductIndex(null);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalQuantity = Array.isArray(inventory) 
    ? inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" className='main' flex="1" p={1}>
        <Sidebar />
        <Box bg={bg} borderRadius="md" flex="1" p={5}>
          <Stack spacing={4}>
            <Flex justify="space-between" flexWrap="wrap" gap={4}>
              <Stat minW="150px">
                <StatLabel>Total Products</StatLabel>
                <StatNumber>{totalProducts}</StatNumber>
                <StatHelpText>Available in inventory</StatHelpText>
              </Stat>
              <Stat minW="150px">
                <StatLabel>Total Categories</StatLabel>
                <StatNumber>{totalCategories}</StatNumber>
                <StatHelpText>Product categories</StatHelpText>
              </Stat>
              <Stat minW="150px">
                <StatLabel>Total Quantity</StatLabel>
                <StatNumber>{totalQuantity}</StatNumber>
                <StatHelpText>Total kg in stock</StatHelpText>
              </Stat>
            </Flex>
            <Box overflowX="auto">
              {transactions.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Op.</Th>
                      {!isMobile && <Th>Operation</Th>}
                      <Th>Products No.</Th>
                      <Th>Units</Th>
                      <Th>Total</Th>
                      {!isMobile && (
                        <>
                          <Th>Purpose</Th>
                          <Th>BatchSize</Th>
                          <Th>Date</Th>
                        </>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((transaction, index) => {
                      const products = transaction.products || [];
                      return (
                        <React.Fragment key={index}>
                          <Tr onClick={() => handleClick(index)} style={{ cursor: "pointer" }}>
                            <Td>
                              {transaction.operation === "Receive" ? (
                                <MdCallReceived color="green" />
                              ) : (
                                <MdCallMade color="red" />
                              )}
                            </Td>
                            {!isMobile && <Td>{transaction.operation}</Td>}
                            <Td>{products.length}</Td>
                            <Td>{transaction.unit}</Td>
                            <Td>
                              {products
                                .reduce((sum, product) => sum + (product.quantity * transaction.unit), 0)}
                            </Td>
                            {!isMobile && (
                              <>
                                <Td>{transaction.purpose}</Td>
                                <Td>{transaction.batchSize}</Td>
                                <Td>{new Date(transaction.createdAt).toLocaleDateString()}</Td>
                              </>
                            )}
                          </Tr>
                          {clicked && productIndex === index && (
                            <OpenProductList data={products} unit={transaction.unit} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <Text>No transactions available</Text>
              )}
            </Box>
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

function OpenProductList({ data, unit }) {
  if (!Array.isArray(data)) return null;

  return (
    <>
      <Tr>
        <Td><strong>Name</strong></Td>
        <Td><strong>Quantity</strong></Td>
        <Td><strong>Units</strong></Td>
        <Td><strong>Total</strong></Td>
      </Tr>
      {data.map((product, index) => (
        <Tr key={index}>
          <Td>{product.name}</Td>
          <Td>{product.quantity}</Td>
          <Td>{unit}</Td>
          <Td>{product.quantity * unit}</Td>
        </Tr>
      ))}
    </>
  );
}

export default Dashboard;