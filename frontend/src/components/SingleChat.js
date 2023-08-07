import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box , FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import React , { useState , useEffect } from 'react'
import { getSender, getSenderFull } from '../config/ChatLogics';
import { useChatState } from '../context/ChatProvider'
import ProfileModal from '../miscellaneous.js/ProfileModal';
import UpdateGroupChatModal from '../miscellaneous.js/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import './singleChat.css';
import loadingGif from '../animation/loading.gif';
import io from 'socket.io-client';
const ENDPOINT = 'https://faster-chats.herokuapp.com/';
let socket , selectedChatCompare;


const SingleChat = ({ fetchAgain , setFetchAgain }) => {
    const { user , selectedChat , setSelectedChat , notification , setNotification } = useChatState();
    const [messages , setMessages ] = useState([]);
    const [loading , setLoading ] = useState(false);
    const [newMessage , setNewMessage ] = useState('');
    const [toggle , setToggle ] = useState(false);
    const [typing , setTyping ] = useState(false);
    const [isTyping , setIsTyping ] = useState(false);
    const [ socketConnected , setSocketConnected ] = useState(false);
    const toast = useToast();

    const fetchMessages = async() => {
        if(!selectedChat)return;

        try {
            const config = {
                headers: {
                    authorization: `Bearer ${user.token}`
                }
            }
            setLoading(true);
            const { data } = await axios.get(`/api/messages/${selectedChat._id}` , config );
            setMessages(data);
            setLoading(false);
            socket.emit('join chat' , selectedChat._id);
        } catch (error) {
            toast({
                title:'Error Occured',
                description: 'Failed to send the message',
                status:'error',
                duration:2000,
                isClosable:true,
                position:'bottom',
            })
        }
    }

    const sendMessage = async(e) => {
        if(e.key === 'Enter' && newMessage ){
          socket.emit('stop typing' , selectedChat._id);
           try {
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    authorization: `Bearer ${user.token}`
                }
            }

            setNewMessage('');
            const { data } = await axios.post('/api/messages' , { content : newMessage , chatId: selectedChat._id } , config);
            socket.emit('new message' , data)
            setMessages([...messages , data]);
            setToggle(!toggle);
           } catch (error) {
            toast({
                title:'Error Occured',
                description: 'Failed to send the message',
                status:'error',
                duration:2000,
                isClosable:true,
                position:'bottom',
            })
           }
        }
    }
    
    
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    
      }, []);
    
      useEffect(() => {
        fetchMessages();
    
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
      }, [selectedChat]);


    
      useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
          if (
            !selectedChatCompare || // if chat is not selected or doesn't match current chat
            selectedChatCompare._id !== newMessageRecieved.chat._id
          ) {
            if(!notification.includes(newMessageRecieved)){
              setNotification([newMessageRecieved , ...notification]);
              setFetchAgain(!fetchAgain);
            }
          } else {
            setMessages([...messages, newMessageRecieved]);
          }
        });
      });


    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if(!socketConnected)return;

        if(!typing){
          setTyping(true);
          socket.emit('typing' , selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;

        setTimeout(() => {
          let timeNow = new Date().getTime();
          let timeDiff = timeNow - lastTypingTime;

          if(timeDiff >= timerLength && typing){
            socket.emit('stop typing' , selectedChat._id);
            setTyping(false);
          }
        } , timerLength)
    }

  return (
    <>
    {selectedChat ? (
        <>
        <Text
        fontSize={{ base: '28px' , md:'30px'}}
        pb={3}
        px={2}
        w='100%'
        fontFamily={'Work sans'}
        display='flex'
        justifyContent={'space-between'}
        alignItems='center'
        >
            <IconButton
            display={{ base:'flex' , md:'none'}}
            icon={<ArrowBackIcon />}
            onClick={() => setSelectedChat('')} 
            />
            {messages && 
             (!selectedChat.isGroupChat ? (
             <>
             {getSender(user , selectedChat.users)} 
             <ProfileModal 
             user={getSenderFull(user , selectedChat.users)} 
             />
             </>
             ) : (
             <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal 
                fetchAgain={fetchAgain} 
                setFetchAgain={setFetchAgain} 
                fetchMessages={fetchMessages} 
                />
                </> 
                ))}
        </Text>
        <Box
        display={'flex'}
        justifyContent='flex-end'
        flexDir={'column'}
        p={3}
        bg='#E8E8E8'
        w='100%'
        h='100%'
        borderRadius={'lg'}
        overflowY='hidden'>
        { loading ? (
        <Spinner  
        size={'xl'} 
        w={20} 
        h={20} 
        alignSelf={'center'} 
        margin={'auto'} 
        /> 
        ) : (
        <div className='messages'>
           <ScrollableChat messages={messages} toggle={toggle} />
        </div>
        )}
        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
          { isTyping ? <img src={loadingGif} style={{ width:70 }} alt="loading img"/> : <></>}
          <Input variant={'filled'} bg='#E0E0E0' placeholder={'Enter a message...'} onChange={typingHandler} value={newMessage} />
        </FormControl>
        </Box>
        </>)
        : (
            <Box 
            display={'flex'}
            justifyContent='center'
            alignItems={'center'}
            height='100%'
            >
            <Text 
            fontSize='3xl'
            pb={3}
            fontFamily='Work sans'>
                Click On a User To Start Chatting
            </Text>
            </Box>
        )
    }
    </>
  )
}

export default SingleChat