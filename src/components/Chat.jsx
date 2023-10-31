import React from 'react'
import Messages from './Messages'
import Input from './Input'

const Chat = () => {
  return (
    <div>
      <div className='border-4 border-black p-60'>Chat</div>
      <Messages/>
      <Input/>
    </div>
  )
}

export default Chat