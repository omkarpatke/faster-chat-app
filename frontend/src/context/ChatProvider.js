import { createContext , useContext , useState } from 'react';




const ChatContext = createContext();
export const useChatState = () => useContext(ChatContext);

export const ChatProvider = ({children}) => {
    const [ user , setUser] = useState('');
    const [ selectedChat , setSelectedChat] = useState('');
    const [ chats , setChats ] = useState([]);
    const [ notification , setNotification ] = useState([]);

    return (<ChatContext.Provider value={{ chats , setChats, user , setUser,  selectedChat , setSelectedChat, notification , setNotification }}>{children}</ChatContext.Provider>)
}

