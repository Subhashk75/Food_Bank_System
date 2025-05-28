import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  InputGroup, 
  Input, 
  InputLeftAddon, 
  Button, 
  Flex, 
  Box, 
  useColorModeValue,
  useToast,
  Select,
  Text,
  Spinner,
  Center
} from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { productService, categoryService } from '../components/utils/api';
import Auth from '../components/utils/auth';
import { useNavigate } from 'react-router-dom';

function AddItem() {
  const bg = useColorModeValue('gray.100', 'gray.800');
  const color = useColorModeValue('gray.700', 'gray.200');
  const toast = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data);
        setCategoriesLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [navigate, toast]);

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleAddItem = async () => {
    setLoading(true);

    try {
      const productData = {
        ...inputValues,
        quantity: parseInt(inputValues.quantity),
        category: inputValues.categoryId
      };

      const response = await productService.create(productData);
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form after successful addition
      setInputValues({
        name: '',
        description: '',
        image: '',
        quantity: '',
        categoryId: '',
      });

      // Redirect to inventory after 1 second
      setTimeout(() => {
        navigate('/inventory');
      }, 1000);

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      inputValues.name && 
      inputValues.categoryId && 
      inputValues.quantity && 
      !isNaN(inputValues.quantity)
    );
  };

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
          color={color}
          boxShadow="sm"
        >
          <Stack spacing={4}>
            <InputGroup>
              <InputLeftAddon width="150px">Name</InputLeftAddon>
              <Input
                placeholder="Item name"
                value={inputValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                isRequired
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
              <InputLeftAddon width="150px">Image URL</InputLeftAddon>
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
                min="0"
                value={inputValues.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                isRequired
              />
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width="150px">Category</InputLeftAddon>
              {categoriesLoading ? (
                <Center flex="1">
                  <Spinner size="sm" />
                </Center>
              ) : (
                <Select
                  placeholder="Select a category"
                  value={inputValues.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  isRequired
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              )}
            </InputGroup>

            <Flex justifyContent="center" mt={4}>
              <Button
                colorScheme="green"
                width="150px"
                onClick={handleAddItem}
                isLoading={loading}
                isDisabled={!isFormValid() || loading}
              >
                Add Item
              </Button>
            </Flex>

            {!categoriesLoading && categories.length === 0 && (
              <Text color="orange.500" textAlign="center">
                No categories available. Please create categories first.
              </Text>
            )}
          </Stack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default AddItem;