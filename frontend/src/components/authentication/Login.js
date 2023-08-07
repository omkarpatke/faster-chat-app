import { Button,useToast, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React , { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { useChatState } from '../../context/ChatProvider';


const Login = () => {
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ show , setShow ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const { setUser } = useChatState();
   

   async function submitHandler(){
        setLoading(true);

        if( !email || !password  ){
          toast({
            title: 'Please Fill All The Fields',
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          setLoading(false);
        }

        try{
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          }

          const data = await axios.post('/api/user/login' , { email , password  } ,  config );
          toast({
            title: 'Login Successfull',
            status: 'success',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          localStorage.setItem('userInfo' , JSON.stringify(data.data));
          const userInfo = localStorage.getItem('userInfo');
          setUser(JSON.parse(userInfo));
          history.push('/chats');
        }catch (err) {
          toast({
            title: 'Error Occured',
            description: err.response.data.message,
            status: 'error',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          setLoading(false);
        };
    }


    
    return (
        <VStack spacing={'5px'}>
        
        <FormControl 
        id='loginEmail' 
        isRequired>
        <FormLabel>Email</FormLabel>
          <Input placeholder='Enter Your Email' 
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
    
        <FormControl 
        id='password' 
        isRequired >
          <FormLabel>Password</FormLabel>
        </FormControl>
        <InputGroup>
        <Input 
        value={password}
        type={show ? 'text' : 'password'}
        placeholder='Password' 
        onChange={(e) => setPassword(e.target.value)} />
    
        <InputRightElement width={'4.5rem'}>
            <Button h={'1.75rem'} size='sm' onClick={() => setShow(prev => !prev)}>{show ? 'Hide' : 'Show'}</Button>
        </InputRightElement>
        </InputGroup>
    

        <Button
        colorScheme={'blue'}
        width='100%'
        style={{marginTop:'1rem'}}
        onClick={submitHandler}>Login</Button>

        <Button
        variant={'solid'}
        colorScheme={'red'}
        width='100%'
        isLoading={loading}
        onClick={() => {
            setEmail('guest@example.com');
            setPassword('123456');
        }}>Guest Credentials</Button>
    
    
        </VStack>
      )
}

export default Login