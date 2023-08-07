import { Button,Box , FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React , { useState } from 'react';
import ChatLoading from '../components/authentication/ChatLoading';
import { useChatState } from '../context/ChatProvider';
import UserListItem from '../components/authentication/userAvatar/UserListItem';
import UserBadgeItem from '../components/authentication/userAvatar/UserBadgeItem';

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ groupChatName , setGroupChatName ] = useState();
    const [ selectedUsers , setSelectedUsers ] = useState([]);
    const [ search , setSearch] = useState();
    const [ searchResult , setSearchResult] = useState();
    const [ loading , setLoading] = useState(false);
    
    const toast = useToast();
    const { user , chats , setChats } = useChatState();

    const handleSearch = async(query) => {
        setSearch(query);

        if(query.length === 0){
          setSearchResult([]);
        }else{
          try{
            const config = {
              headers : {
                  authorization : `Bearer ${user.token}`
              }
            }
  
            const { data } = await axios.get(`/api/user?search=${search}` , config);
            setLoading(false);
            setSearchResult(data);
            setSearch('');
          }catch (err) {
              toast({
                  title:'Error Occured!',
                  description:'Failed To load the search results',
                  status:'error',
                  duration:2000,
                  isClosable:true,
                  position:'bottom-left',
                });
                setSearch('');
          }
        }
    }

    const handleSubmit = async() => {
        if(!groupChatName || !selectedUsers){
            toast({
                title:'Please Fill All The Fields',
                status:'warning',
                duration:2000,
                isClosable:true,
                position:'top',
              });
        }else{
            try{

                const config = {
                    headers: {
                        authorization : `Bearer ${user.token}`
                    }
                }

                const { data } = await axios.post('/api/chat/group' , { name : groupChatName , users: JSON.stringify(selectedUsers.map(u => u._id))} , config);
                setChats([data , ...chats]);
                setSelectedUsers([]);
                setSearch('');
                onClose();
                toast({
                    title:'New Group Chat Created',
                    status:'success',
                    duration:2000,
                    isClosable:true,
                    position:'bottom',
                  });
            }catch(err){
                toast({
                    title:'Failed To Create Group',
                    description: err.response.data,
                    status:'error',
                    duration:2000,
                    isClosable:true,
                    position:'top',
                  });
                  setSelectedUsers([]);
                  setSearch('');
            }
        }
    }


    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter(item => item._id !== userToDelete._id));
    }

    
    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            toast({
                title:'User Already Added',
                status:'warning',
                duration:2000,
                isClosable:true,
                position:'top',
              });
        }else{
        setSelectedUsers([...selectedUsers , userToAdd]);
        }
    }
    return (
      <>
        <span onClick={onOpen}>{children}</span>
  
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
            fontSize={'35px'}
            fontFamily='Work sans'
            display={'flex'}
            justifyContent='center'
            >Create Group Chat</ModalHeader>
            <ModalCloseButton />
            <ModalBody display={'flex'} flexDir='column' alignItems={'center'}>
               <FormControl>
                <Input placeholder='Chat Name' mb={3} onChange={(e) => setGroupChatName(e.target.value)}/>
               </FormControl>
               <FormControl>
                <Input placeholder='Add Users eg: Omkar Rohit Rohan' mb={1} onChange={(e) => handleSearch(e.target.value)}/>
               </FormControl>

               <Box w='100%' display='flex' flexWrap='wrap'>
               {selectedUsers?.map( (u) => (<UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />))}
               </Box>
               {loading ? <ChatLoading/> : searchResult?.slice(0,4).map( item => <UserListItem key={item._id} handleFunction={() => handleGroup(item)} user={item} />)}
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='blue' onClick={handleSubmit}>
                Create Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default GroupChatModal