import React from 'react';
import { Box, Container , Text ,Tab ,Tabs,  TabList, TabPanels, TabPanel } from '@chakra-ui/react';
import Login from '../components/authentication/Login';
import SignUp from '../components/authentication/SignUp';

const HomePage = () => {
  return (
    <Container maxW='xl'>
      <Box
         d='flex'
         justifyContent={'center'}
         p={3}
         bg={'white'}
         w='100%'
         m='40px 0 15px 0'
         borderRadius='lg'
         borderWidth='1px'
         textAlign={'center'}
         >
        <Text 
        fontSize={'4xl'}
        fontFamily='Work sans'
        color={'black'}
        >Faster Chat</Text>
      </Box>
      <Box 
         d='flex'
         justifyContent={'center'}
         p={4}
         bg={'white'}
         w='100%'
         borderRadius='lg'
         borderWidth='1px'>
          <Tabs variant='soft-rounded'>
  <TabList mb={'1em'}>
    <Tab width={'50%'}>Login</Tab>
    <Tab width={'50%'}>Sign Up</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
      <Login />
    </TabPanel>
    <TabPanel>
      <SignUp />
    </TabPanel>
  </TabPanels>
</Tabs>
         </Box>
    </Container>
  )
}

export default HomePage;