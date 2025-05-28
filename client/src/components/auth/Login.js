'use client'
import { Button, Flex, Text, FormControl, FormLabel, Heading, Input, Stack, Image, Box, Link, useToast } from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../components/utils/api';
import Auth from '../../components/utils/auth';

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.login(formState);
      
      if (response.success) {
        Auth.login(response.token);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
          <Image src='../../images/logo.png' alt="logo" />
          <Heading fontSize={'2xl'}>Sign in to your account</Heading>
          
          <form onSubmit={handleSubmit}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input 
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
              />
            </FormControl>
            
            <Stack spacing={6} mt={4}>
              <Button 
                colorScheme={'blue'} 
                variant={'solid'} 
                type="submit"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign in
              </Button>
            </Stack>
          </form>
          
          <Box textAlign="center">
            New to us?{" "}
            <Link color="blue.500" as={ReactRouterLink} to='/register'>
              Sign Up
            </Link>
          </Box>
        </Stack>
      </Flex>
      
      <Flex flex={1} display={{ base: 'none', md: 'flex' }}>
        <Image
          src={'../../images/food.jpg'}
          alt={'Login Image'}
          objectFit={'cover'}
          w="full"
          h="full"
        />
      </Flex>
    </Stack>
  );
};

export default Login;