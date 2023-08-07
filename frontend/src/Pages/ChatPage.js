import React , { useEffect , useState } from 'react';
import { Box } from '@chakra-ui/layout';
import SideDrawer from '../miscellaneous.js/SideDrawer';
import MyChats from '../miscellaneous.js/MyChats';
import ChatBox from '../miscellaneous.js/ChatBox';
import { useChatState } from '../context/ChatProvider';
import { useHistory } from 'react-router-dom';

const ChatPage = () => {
  const history = useHistory();
  const { user , setUser } = useChatState();
  const [ fetchAgain , setFetchAgain ] = useState(false);

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem('userInfo'));
    if(data){
        setUser(data);
        history.push('/chats');
    }else{
      history.push('/');
    }
},[history , setUser]);



  return (
    <div style={{ width: '100%'}}>
     { user && <SideDrawer />}
     <Box
     display={'flex'}
     justifyContent='space-between'
     w='100%'
     h='91.5vh'
     p='10px'
     >
       { user && <MyChats fetchAgain={fetchAgain} />}
       { user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
     </Box>
    </div>
  )
}

export default ChatPage;