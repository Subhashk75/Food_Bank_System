import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  InputGroup, 
  Input, 
  InputLeftAddon, 
  Button, 
  Flex,
  useToast,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../components/utils/api';
import Auth from '../components/utils/auth';

function Modify() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const productId = location.state?.productId;
  
  const [inputValues, setInputValues] = useState({
    name: '',
    description: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
      return;
    }

    if (!productId) {
      navigate("/productlist");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await productService.getById(productId);
        const product = response.data;
        setInputValues({
          name: product.name,
          description: product.description,
          quantity: product.quantity.toString(),
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch product details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate("/productlist");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate, toast]);

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleModifyItem = async () => {
    if (!inputValues.name || !inputValues.quantity) {
      toast({
        title: 'Error',
        description: 'Name and quantity are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUpdating(true);
    try {
      const productData = {
        name: inputValues.name,
        description: inputValues.description,
        quantity: parseInt(inputValues.quantity),
      };

      await productService.update(productId, productData);
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate("/productlist");
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Stack spacing={4} p={4}>
      <InputGroup>
        <InputLeftAddon width="150px">Name</InputLeftAddon>
        <Input
          placeholder="Product name"
          value={inputValues.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          isRequired
        />
      </InputGroup>
      
      <InputGroup>
        <InputLeftAddon width="150px">Description</InputLeftAddon>
        <Input
          placeholder="Product description"
          value={inputValues.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </InputGroup>
      
      <InputGroup>
        <InputLeftAddon width="150px">Quantity</InputLeftAddon>
        <Input
          type="number"
          min="0"
          placeholder="Quantity"
          value={inputValues.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          isRequired
        />
      </InputGroup>
      
      <Flex justifyContent="center" mt={4}>
        <Button
          colorScheme="green"
          width="150px"
          onClick={handleModifyItem}
          isLoading={updating}
          loadingText="Updating..."
        >
          Update Product
        </Button>
      </Flex>
    </Stack>
  );
}

export default Modify;