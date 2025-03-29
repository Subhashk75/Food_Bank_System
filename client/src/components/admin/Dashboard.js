import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

function Dashboard() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
    const fetchData = async () => {
      try {
        const [inventoryRes, productsRes, categoriesRes] = await Promise.all([
          axios.get("/api/v1/inventory"),
          axios.get("/api/v1/products"),
          axios.get("/api/v1/getCategories")
        ]);

        setData(inventoryRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" className='main' flex="1" p={1}>
        <Sidebar />
        <Box bg={bg} borderRadius="md" flex="1" p={5}>
          <Stack spacing={4}>
            <Flex justify="space-between">
              <Stat>
                <StatLabel>Total Products</StatLabel>
                <StatNumber>{totalProducts}</StatNumber>
                <StatHelpText>Available in inventory</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Categories</StatLabel>
                <StatNumber>{totalCategories}</StatNumber>
                <StatHelpText>Product categories</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Quantity</StatLabel>
                <StatNumber>{totalQuantity}</StatNumber>
                <StatHelpText>Total kg in stock</StatHelpText>
              </Stat>
            </Flex>
            <Box overflowX="auto">
              {data.length > 0 ? (
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
                    {data.map((transaction, index) => (
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
                          <Td>{transaction.product.length}</Td>
                          <Td>{transaction.unit}</Td>
                          <Td>
                            {transaction.product
                              .map(product => product.quantity * transaction.unit)
                              .reduce((sum, quantity) => sum + quantity, 0)}
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
                          <OpenProductList data={transaction.product} unit={transaction.unit} />
                        )}
                      </React.Fragment>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text>No transactions available</Text>
              )}
              {loading && <Text>Loading...</Text>}
              {error && <Text>Error: {error.message}</Text>}
            </Box>
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

function OpenProductList({ data, unit }) {
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
