import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { UserContextProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatContext, ChatContextProvider } from './context/ChatContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <UserContextProvider>
    <ChatContextProvider>
    <NotificationProvider>
    <React.StrictMode>
      <App/>
    </React.StrictMode>
    </NotificationProvider>
    </ChatContextProvider>
    </UserContextProvider>
  
);


