// ==========================
// React SignupCard Component
// ==========================

'use client';
import {
  Flex, Box, FormControl, FormLabel, Input, Stack, Button,
  Heading, Text, Link, useToast
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../components/utils/api';
import Auth from '../../components/utils/auth';

export default function SignupCard() {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    verificationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpPhase, setOtpPhase] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetOtp = async () => {
    setIsLoading(true);
    try {
      const { username, email, password } = formState;
      const response = await authService.register({ username, email, password });

      if (response.success) {
        setOtpPhase(true);
        toast({ title: 'OTP sent to your email', status: 'success', duration: 3000, isClosable: true });
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpPhase) {
      await handleGetOtp();
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.requestOtp({ code: formState?.verificationCode });

      if (response.success) {
        const loginRes = await authService.login({ email: formState?.email, password: formState?.password });

        if (loginRes.success) {
          Auth.login(loginRes.token);
          toast({ title: 'Account verified and logged in!', status: 'success', duration: 3000, isClosable: true });
          navigate('/dashboard');
        } else {
          throw new Error(loginRes.message);
        }
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      toast({ title: 'Verification failed', description: error.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH={'100vh'} minW={'70vw'} align={'center'} justify={'center'} bg="gray.50">
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign up</Heading>
          <Text fontSize={'lg'}>To start helping! ✌️</Text>
        </Stack>
        <Box rounded={'lg'} bg="white" boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input type="text" name="username" value={formState.username} onChange={handleChange} />
              </FormControl>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input type="email" name="email" value={formState.email} onChange={handleChange} />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" value={formState.password} onChange={handleChange} />
              </FormControl>

              {otpPhase && (
                <FormControl id="verificationCode" isRequired>
                  <FormLabel>OTP</FormLabel>
                  <Input type="text" name="verificationCode" value={formState.verificationCode} onChange={handleChange} />
                </FormControl>
              )}

              <Stack spacing={10} pt={2}>
                <Button
                  size="lg"
                  bg={'blue.400'}
                  color={'white'}
                  type="submit"
                  isLoading={isLoading}
                  loadingText={otpPhase ? 'Verifying OTP...' : 'Sending OTP...'}
                  _hover={{ bg: 'blue.500' }}
                >
                  {otpPhase ? 'Submit OTP & Sign Up' : 'Get OTP'}
                </Button>
              </Stack>

              <Stack pt={6}>
                <Text align={'center'}>
                  Already a user? <Link color={'blue.400'} as={ReactRouterLink} to='/'>Login</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
