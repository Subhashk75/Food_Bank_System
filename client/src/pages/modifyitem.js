import React, { useState, useEffect } from 'react';
import { 
  InputGroup, 
  Input, 
  InputLeftAddon, 
  Button, 
  Flex, 
  Box, 
  List, 
  ListItem, 
  useColorModeValue,
  useToast,
  Text,
  Spinner
} from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { productService, categoryService } from '../components/utils/api';
import Auth from '../components/utils/auth';
import { useNavigate } from 'react-router-dom';

function ModifyItem() {
  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.700", "gray.200");
  const toast = useToast();
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState('');
  const [inputValues, setInputValues] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    quantity: '',
    category: '',
  });

  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
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

  const handleInputChange = (field, value) => {
  setInputValues((prevValues) => ({
    ...prevValues,
    [field]: value,
  }));
};


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);

    if (value) {
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredProducts);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchName(product.name);
    setInputValues({
      id: product._id,
      name: product.name,
      description: product.description,
      image: product.image,
      quantity: product.quantity.toString(),
      category: product.category?.name || '',
    });
    setSuggestions([]);
  };

  const handleSearchClick = async () => {
    if (!searchName) return;

    try {
      setSearching(true);
      const response = await productService.search(searchName);
      if (response.data.length > 0) {
        const product = response.data[0];
        setInputValues({
          id: product._id,
          name: product.name,
          description: product.description,
          image: product.image,
          quantity: product.quantity.toString(),
          category: product.category?.name || '',
        });
      } else {
        toast({
          title: 'Not Found',
          description: 'No product found with that name',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleModifyItem = async () => {
    if (!inputValues.id) {
      toast({
        title: 'Error',
        description: 'No product selected for modification',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUpdating(true);
      
      // Get category ID if needed
      let categoryId = inputValues.category;
      if (isNaN(categoryId)) {
        const categories = await categoryService.getAll();
        const foundCategory = categories.data.find(cat => cat.name === inputValues.category);
        if (!foundCategory) {
          throw new Error('Invalid category selected');
        }
        categoryId = foundCategory._id;
      }

      const updatedProduct = {
        name: inputValues.name,
        description: inputValues.description,
        image: inputValues.image,
        quantity: parseInt(inputValues.quantity),
        category: categoryId,
      };

      await productService.update(inputValues.id, updatedProduct);
      
      toast({
        title: 'Success',
        description: 'Product modified successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setSearchName('');
      setInputValues({
        id: '',
        name: '',
        description: '',
        image: '',
        quantity: '',
        category: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to modify product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={{ base: 0, md: 4 }} p={5} bg={bg} borderRadius="md" color={color}>
          <InputGroup>
            <InputLeftAddon width="150px">Search Product</InputLeftAddon>
            <Input
              placeholder="Product name"
              value={searchName}
              onChange={handleSearchChange}
            />
            <Button 
              onClick={handleSearchClick}
              isLoading={searching}
              loadingText="Searching..."
            >
              Search
            </Button>
          </InputGroup>

          {suggestions.length > 0 && (
            <Box mt={2} borderWidth="1px" borderRadius="md" p={2} maxH="200px" overflowY="auto">
              <List>
                {suggestions.map((product) => (
                  <ListItem 
                    key={product._id} 
                    p={2} 
                    _hover={{ bg: 'gray.100' }}
                    cursor="pointer"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    {product.name}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {inputValues.id && (
            <Box mt={4}>
              <InputGroup>
                <InputLeftAddon width="150px">Name</InputLeftAddon>
                <Input 
                  value={inputValues.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup mt={2}>
                <InputLeftAddon width="150px">Description</InputLeftAddon>
                <Input 
                  value={inputValues.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup mt={2}>
                <InputLeftAddon width="150px">Image URL</InputLeftAddon>
                <Input 
                  value={inputValues.image} 
                  onChange={(e) => handleInputChange('image', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup mt={2}>
                <InputLeftAddon width="150px">Quantity</InputLeftAddon>
                <Input 
                  type="number"
                  min="0"
                  value={inputValues.quantity} 
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                />
              </InputGroup>
              
              <InputGroup mt={2}>
                <InputLeftAddon width="150px">Category</InputLeftAddon>
                <Input 
                  value={inputValues.category} 
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </InputGroup>
              
              <Button 
                mt={4} 
                colorScheme="blue"
                onClick={handleModifyItem}
                isLoading={updating}
                loadingText="Updating..."
              >
                Update Product
              </Button>
            </Box>
          )}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default ModifyItem;