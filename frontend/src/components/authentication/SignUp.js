import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React , { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { useChatState } from '../../context/ChatProvider';

const SignUp = () => {
    const [ name , setName ] = useState('');
    const [ email , setEmail ] = useState('');
    const [ password , setPassword ] = useState('');
    const [ confirmPassword , setConfirmPassword ] = useState('');
    const [ pic , setPic ] = useState();
    const [ show , setShow ] = useState(false);
    const [ loading , setLoading ] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const { setUser } = useChatState();
   
    async function submitHandler(){
        setLoading(true);

        if(!name || !email || !password || !confirmPassword ){
          toast({
            title: 'Please Fill All The Fields',
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          setLoading(false);
        }

        if(password !== confirmPassword){
          toast({
            title: 'Password Do Not Match',
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
          const  data  = await axios.post('/api/user' , { name , email , password , pic } ,  config );
          toast({
            title: 'Registration Successfull',
            status: 'success',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          localStorage.setItem('userInfo' , JSON.stringify(data.data));
          const userInfo = localStorage.getItem('userInfo');
          setUser(JSON.parse(userInfo));
          setLoading(false);
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

    const postDetails = (pics) => {
      setLoading(true);
      if(pics === undefined){
        toast({
          title: 'Please Select an Image',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position:"bottom",
        });
      }

        if(pics.type ==='image/jpeg' || pics.type === 'image/png'){
          const data = new FormData();
          data.append('file' , pics);
          data.append('upload_preset' , 'faster-chat-app');
          data.append('cloud_name' , 'dvzfukz3n');
          fetch('https://api.cloudinary.com/v1_1/dvzfukz3n/image/upload',{
            method:'post',
            body:data,
          }).then((res) => res.json()).then((result) => {
            setPic(result.url);
            setLoading(false);
          }).catch((err) => {
            console.log(err);
            setLoading(false);
          })
        }else{
          toast({
            title: 'Please Select an Image',
            status: 'warning',
            duration: 4000,
            isClosable: true,
            position:"bottom",
          });
          setLoading(false);
        }
      }
    
  return (
    <VStack spacing={'5px'}>
    <FormControl 
    id='first-name'
    isRequired>
    <FormLabel>Name</FormLabel>
      <Input 
      value={name}
      placeholder='Enter Your Name' 
      onChange={(e) => setName(e.target.value)} />
    </FormControl>


    <FormControl 
    id='email' 
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


    <FormControl 
    id='confirmPassword' 
    isRequired >
      <FormLabel>ConfirmPassword</FormLabel>
    </FormControl>
    <InputGroup>
    <Input 
    value={confirmPassword}
    type={show ? 'text' : 'password'}
    placeholder='Confirm Password' 
    onChange={(e) => setConfirmPassword(e.target.value)} />

    <InputRightElement width={'4.5rem'}>
        <Button h={'1.75rem'} size='sm' onClick={() => setShow(prev => !prev)}>{show ? 'Hide' : 'Show'}</Button>
    </InputRightElement>
    </InputGroup>



    <FormControl 
    id='pic' 
    isRequired >
      <FormLabel>Select Your Pic</FormLabel>
      <Input 
      type={'file'}
      p={1.5}
      accept='image/*'
      onChange={(e) => postDetails(e.target.files[0])} />
    </FormControl>

    <Button
    colorScheme={'blue'}
    width='100%'
    mt={10}
    style={{marginTop:'1rem'}}
    onClick={submitHandler}
    isLoading={loading}>Sign Up</Button>


    </VStack>
  )
}

export default SignUp