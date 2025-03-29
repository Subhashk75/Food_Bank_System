import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Stack, InputGroup, Input, InputLeftAddon, Button, Flex, Box, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const API_URL = 'http://localhost:3001/api/v1/products';
const CATEGORY_API_URL = 'http://localhost:3001/api/v1/getCategories';

function AddItem() {
  const bg = useColorModeValue('gray.100', 'gray.800');
  const color = useColorModeValue('gray.700', 'gray.200');

  const [inputValues, setInputValues] = useState({
    name: '',
    description: '',
    image: '',
    quantity: '',
    categoryId: '',
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCategoriesLoading(true);
    axios
      .get(CATEGORY_API_URL)
      .then((response) => {
        const fetchedCategories = response.data;
        if (fetchedCategories.length === 0) {
          setError('No categories found in the database.');
        } else {
          setCategories(fetchedCategories);
        }
        setCategoriesLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories from the server.');
        setCategoriesLoading(false);
      });
  }, []);

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleAddItem = async () => {
    setLoading(true);
    setError('');
    console.log("Adding item...");

    try {
      const response = await axios.post(API_URL, inputValues);
      console.log('Product added:', response.data);
      
      // Reset form after successful addition
      setInputValues({
        name: '',
        description: '',
        image: '',
        quantity: '',
        categoryId: '',
      });

    } catch (error) {
      setError(error.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={4} p={5} bg={bg} borderRadius="md" color={color}>
          <Stack spacing={4}>
            <InputGroup>
              <InputLeftAddon width="150px">Name</InputLeftAddon>
              <Input
                placeholder="Item name"
                value={inputValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width="150px">Description</InputLeftAddon>
              <Input
                placeholder="Item description"
                value={inputValues.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width="150px">Image</InputLeftAddon>
              <Input
                placeholder="Image URL"
                value={inputValues.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width="150px">Quantity</InputLeftAddon>
              <Input
                placeholder="Enter quantity"
                type="number"
                value={inputValues.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width="150px">Category</InputLeftAddon>
              <select
                value={inputValues.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '5px' }}
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </InputGroup>

            <Flex justifyContent="center">
              <Button
                size="sm"
                colorScheme="green"
                width="100px"
                onClick={handleAddItem}
                isLoading={loading}
                isDisabled={!inputValues.name || !inputValues.categoryId || !inputValues.quantity || loading}
              >
                Add Item
              </Button>
            </Flex>

            {categoriesLoading && <p>Loading categories...</p>}
            {!categoriesLoading && categories.length === 0 && <p>No categories available.</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default AddItem;
