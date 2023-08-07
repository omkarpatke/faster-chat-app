import React , { useState } from 'react';
import { Button , Tooltip , Box, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react'
import ProfileModal from './ProfileModal';
import { useChatState } from '../context/ChatProvider';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../components/authentication/ChatLoading';
import UserListItem from '../components/authentication/userAvatar/UserListItem';
import { getSender } from '../config/ChatLogics';
import './notification.css';

const SideDrawer = () => {
    const [ search , setSearch] = useState('');
    const [ searchResult , setSearchResult] = useState([]);
    const [ loading , setLoading] = useState(false);
    const [ loadingChat , setLoadingChat] = useState();
    const { user , setSelectedChat , chats , setChats , notification , setNotification } = useChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
  
    const logoutHandler = () => {
      localStorage.clear();
      history.push('/');
    }

    const accessChat = async(userId) => {

      try{
        setLoadingChat(true);

        const config = {
          headers: {
            'Content-type':'application/json',
            authorization: `Bearer ${user.token}`
          },
        };

        const { data } = await axios.post('/api/chat' , {userId} , config );
        if(!chats.find(c=> c._id === data._id)) setChats([data, ...chats]);
        setSelectedChat(data);
        setLoadingChat(false);
        onClose();

      }catch(err){
        toast({
          title:'Error Fetching the chat',
          description:err.message,
          status:'error',
          duration:2000,
          isClosable:true,
          position:'bottom-left',
        });
      }
     
    }

    const handleSearch = async() => {
      if(!search){
        toast({
          title:'Please Enter Something in the Search',
          status:'warning',
          duration:2000,
          isClosable:true,
          position:'top-left',
        });
        return;
      }

      try{
        setLoading(true);
        const config = {
          headers: {
            authorization :  `Bearer ${user.token}`
          }
        }

        const data  = await axios.get(`/api/user?search=${search}` , config);
        setLoading(false);
        setSearchResult(data.data);
      }catch(err){
        toast({
          title:'Error Occured',
          description:'Failed to Load the search Results',
          status:'error',
          duration:2000,
          isClosable:true,
          position:'bottom-left',
        });
        setLoading(false);
      }
    }
    
  return (
    <>
    <Box
    display={'flex'}
    justifyContent={'space-between'}
    alignItems={'center'}
    bg={'white'}
    w='100%'
    p='5px 10px 5px 10px'
    borderWidth={'5px'}
    >
      <Tooltip label='Search User To Chat' hasArrow placement='bottom-end'>
      <Button variant='ghost' onClick={onOpen}>
      <i className="fa-solid fa-magnifying-glass"></i>
      <Text d={{base:'none' , md:'flex'}} px='4'>Search User</Text>
      </Button>
      </Tooltip>

      <Text fontSize='2rem' fontFamily='Work sans'> Faster-Chats </Text>
      <div>
        <Menu>
            <MenuButton p={1} className='noti-icon'>
              { notification.length ? <span className='noti-badge'>{notification.length}</span> : ''}
            <i className="fa-solid fa-bell" style={{ fontSize:'2xl' , margin:'1rem'}}></i>
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages" }
              {notification.map(noti => (
                <MenuItem key={noti._id} onClick={() => {
                  setSelectedChat(noti.chat);
                  setNotification(notification.filter( n => n !== noti))
                }}>
                   {noti.chat.isGroupChat?`New Message in ${noti.chat.chatName}` : `New Message from ${getSender(user , noti.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
        </Menu>

        <Menu>
            <MenuButton as={Button} rightIcon={<i className="fa-solid fa-angle-down"></i>}>
              <Avatar
              size={'sm'}
              cursor='pointer'
              name={user.name}
              src={user.pic}></Avatar>
            </MenuButton>
            {/* <MenuList></MenuList> */}
            <MenuList>
            <ProfileModal user={user}>
            <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
        </MenuList>
        </Menu>
       
      </div>
    </Box>

    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth={'1px'}> Search User </DrawerHeader>
        <DrawerBody>
        <Box display='flex' pb={2}>
         <Input placeholder='Search by name or email'
         mr={2}
         value={search}
         onChange={(e) => setSearch(e.target.value)} />
         <Button 
         onClick={handleSearch}
         >GO</Button>
        </Box>
        {
          loading ? <ChatLoading /> : (
            searchResult?.map(userItem => (<UserListItem key={userItem._id} user={userItem} handleFunction={() => accessChat(userItem._id)}/>))
          )
        }
        {loadingChat && <Spinner ml={'auto'} d={'flex'} />}
      </DrawerBody>
      </DrawerContent>


    </Drawer>
    </>
  )
}

export default SideDrawer