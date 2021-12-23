import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';
let socket;
const Chat = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const ENDPOINT = 'http://localhost:5000';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    socket = io(ENDPOINT);
    setName(name);
    setRoom(room);
    socket.emit('join', { name, room }, () => {});
    return () => {
      // socket.emit('disconnect');
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, message]);
    });
    socket.on('roomData', ({ users }) => {
      setUsers([...users]);
    });
  }, [messages, users]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) socket.emit('sendMessage', message, () => setMessage(''));
  };
  console.log(users);
  return (
    <div className='outerContainer'>
      <div className='container'>
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
        {/* <TextContainer users={users} /> */}
      </div>
    </div>
  );
};

export default Chat;
