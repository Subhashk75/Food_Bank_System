import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InputGroup, Input, InputLeftAddon, Button, Flex, Box, List, ListItem, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const API_URL = "http://localhost:3001/api/v1/products"; // Updated Backend API route

function ModifyItem() {
  const bg = useColorModeValue("white", "gray.800"); 
  const color = useColorModeValue("gray.700", "gray.200"); 

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

  useEffect(() => {
    axios.get(`${API_URL}`)
      .then(response => {
        setProducts(response.data);
        console.log("respone get in modifyItem file and inside useEffect  fectch Prodout ")
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);

    if (value) {
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredProducts.map(product => product.name));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchName(suggestion);
    setSuggestions([]);
  };

  const handleSearchClick = () => {
    axios.get(`http://localhost:3001/api/v1/searchProduct?name=${searchName}`)
    .then(response => {
        if (response.data) {
          setInputValues(response.data);
          console.log("respone get in modifyItem file and inside handleSearchClick ");
        }
      })
      .catch(error => console.error('Error fetching product:', error));

  };

  const handleInputChange = (fieldName, value) => {
    setInputValues(prevValues => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };
 // handle Modify item 
 const handleModifyItem = async () => {
  if (!inputValues.id) {
    alert("No product selected for modification.");
    return;
  }

  try {
    // Fetch category ID if inputValues.category is a name instead of an ID
    const categoryResponse = await axios.get(`http://localhost:3001/api/v1/categories`);
    const foundCategory = categoryResponse.data.find(cat => cat.name === inputValues.category);
    console.log("respone get in modifyItem file and inside handleModifyItem  ")

    if (!foundCategory) {
      alert("Invalid category selected.");
      return;
    }

    const updatedProduct = {
      name: inputValues.name,
      description: inputValues.description,
      image: inputValues.image,
      quantity: parseInt(inputValues.quantity, 10),
      category: foundCategory._id, // Ensure the category is sent as an ObjectId
    };

    await axios.put(`http://localhost:3001/api/v1/products/${inputValues.id}`, updatedProduct);
    console.log("respone get in modifyItem file and inside handleSearchClick after put rest api ")

    alert("Product modified successfully!");
  } catch (error) {
    console.log(" error respone get in modifyItem file and inside handleSearchClick ")

    console.error("Error modifying product:", error);
    alert("Error modifying product. Check console for details.");
  }
};

  

  return (
    <Flex direction="column" minHeight="100vh">
      <Header />
      <Flex as="main" flex="1" p={4}>
        <Sidebar />
        <Box flex="1" ml={4} p={5} bg={bg} borderRadius="md" color={color}>
          <InputGroup>
            <InputLeftAddon children='Search by Name' />
            <Input
              placeholder='Product name'
              value={searchName}
              onChange={handleSearchChange}
            />
            <Button onClick={handleSearchClick}>Search</Button>
          </InputGroup>

          {suggestions.length > 0 && (
            <List>
              {suggestions.map((suggestion, index) => (
                <ListItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </ListItem>
              ))}
            </List>
          )}

          {inputValues.id && (
            <Box mt={4}>
              <InputGroup>
                <InputLeftAddon children='Name' />
                <Input value={inputValues.name} onChange={(e) => handleInputChange('name', e.target.value)} />
              </InputGroup>
              <InputGroup mt={2}>
                <InputLeftAddon children='Description' />
                <Input value={inputValues.description} onChange={(e) => handleInputChange('description', e.target.value)} />
              </InputGroup>
              <InputGroup mt={2}>
                <InputLeftAddon children='Image' />
                <Input value={inputValues.image} onChange={(e) => handleInputChange('image', e.target.value)} />
              </InputGroup>
              <InputGroup mt={2}>
                <InputLeftAddon children='Quantity' />
                <Input value={inputValues.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} type="number" />
              </InputGroup>
              <InputGroup mt={2}>
                <InputLeftAddon children='Category' />
                <Input value={inputValues.category} onChange={(e) => handleInputChange('category', e.target.value)} />
              </InputGroup>
              <Button mt={2} onClick={handleModifyItem}>Modify Item</Button>
            </Box>
          )}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
}

export default ModifyItem;