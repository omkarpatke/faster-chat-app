import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import axios from 'axios';
import React , { useState } from 'react'
import UserBadgeItem from '../components/authentication/userAvatar/UserBadgeItem';
import UserListItem from '../components/authentication/userAvatar/UserListItem';
import { useChatState } from '../context/ChatProvider';

const UpdateGroupChatModal = ({ fetchAgain , setFetchAgain , fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ groupChatName , setGroupChatName ] = useState();
    const { selectedChat , setSelectedChat , user } = useChatState();
    const [ search , setSearch ] = useState('');
    const [ searchResult , setSearchResult ] = useState([]);
    const [ loading , setLoading ] = useState(false);
    const [ renameLoading , setRenameLoading ] = useState(false);

    const toast = useToast();

    const handleAddUser = async(userToAdd) => {
        if(selectedChat.users.find(u => u._id === userToAdd._id)){
            toast({
                title:'User Already In A Group!',
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
              setSearch('');
        }

        if(selectedChat.groupAdmin._id === userToAdd._id){
            toast({
                title:'Only Admin Can Add Someone!',
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
              setSearch('');
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put('/api/chat/groupadd' , { chatId: selectedChat._id , userId: userToAdd._id} , config);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
            setSearch('');
        } catch (error) {
            toast({
                title:'Error Occured',
                description:error.response.data.message,
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
              setLoading(false);
              setSearch('');
        }
    }

    const handleRemove = async(userToRemove) => {
        console.log(selectedChat)
        if(selectedChat.groupAdmin._id !== user._id){
            toast({
                title:'Only Admin Can Remove Someone!',
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
        }else{
            try {
            setLoading(true);

            const config = {
                headers: {
                    authorization: `Bearer ${user.token}`
                }
            }

            const { data } = await axios.put('/api/chat/groupremove' , { chatId: selectedChat._id , userId: userToRemove._id} , config);
            userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title:'Error Occured',
                description:error.response.data.message,
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
              setLoading(false);
        }
    }

    }


    const handleRename = async() => {
            try{
              setRenameLoading(true);
              const config = {
                headers: {
                    authorization: `Bearer ${user.token}`
                }
              }

              const { data } = await axios.put('/api/chat/rename' , { chatId: selectedChat._id , chatName: groupChatName, } , config);
              setSelectedChat(data);
              setFetchAgain(!fetchAgain);
              setRenameLoading(false);
            }catch(err){
              toast({
                title:'Error Occured',
                description:err.response.data.message,
                status:'error',
                duration: 2000,
                isClosable:true,
                position:'bottom',
              })
            }
            setGroupChatName('');
    }


    const handleSearch = async(query) => {
        setSearch(query);

        if(!query){
            return;
        }

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

    return (
      <>
        <IconButton display={{ base : 'flex'}} icon={<ViewIcon/>} onClick={onOpen} />
  
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
            fontSize={'35px'}
            fontFamily='Work sans'
            display={'flex'}
            justifyContent='center'
            >{selectedChat.chatName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box w='100%' display='flex' flexWrap={'wrap'} pb={3}>
                { selectedChat.users.map(u => (
                    <UserBadgeItem 
                    key={user._id}
                    user={u}
                    handleFunction={() => handleRemove(u)}
                    />
                ))}
              </Box>
              <FormControl display={'flex'}>
                <Input 
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}/>
                <Button variant={'solid'} colorScheme='teal' ml={1} isLoading={renameLoading} onClick={handleRename}>Update</Button>
              </FormControl>
              <FormControl display={'flex'}>
                <Input 
                placeholder='Add User To Group'
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}/>
              </FormControl>
              {loading ? <Spinner size={'large'} /> : searchResult?.slice(0,3).map(searchedUser => (
                <UserListItem 
                key={searchedUser._id}
                user={searchedUser}
                handleFunction={() => handleAddUser(searchedUser)}
                />
              )) }
            </ModalBody>
  
            <ModalFooter>
              <Button colorScheme='red' onClick={() => handleRemove(user)}>
                Leave Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default UpdateGroupChatModal