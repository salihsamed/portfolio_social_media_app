import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { UserContext } from "../context/UserContext";

const Message = ({message}) => {

  const { userInfos } = useContext(UserContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  function toDateTime(secs) {
    var t=new Date(1970,0,1);
    t.setSeconds((secs + 3 * 60 * 60));
  
    let year = t.getFullYear();
    let month = t.getMonth() + 1;
    let day = t.getDate();
  
    let hours = t.getHours().toString();
    let minutes = t.getMinutes().toString();
  
    return less10(day) + "." + less10(month) + "." + year + " " + hours.padStart(2, "0") + ":" + minutes.padStart(2, "0");
  }

  function less10(time) {
    return time < 10 ? "0" + time : time;
  }

  
  return (


    
    <div ref={ref} className={`flex gap-5 mb-4 ${message.senderId === userInfos.userID && "owner"}`}>

      <div id='messageInfo'>
        <img src={
            message.senderId === userInfos.userID
              ? userInfos.profilePicture
              : data.user.profilePicture
          } alt="" className='h-[40px] w-[40px] object-cover rounded-full' />
        <span className="text-sm dark:text-white">{toDateTime(message.date.seconds)}</span>
      </div>


      <div id='messageContent' className='max-w-[80%] flex flex-col gap-[10px]'>
        {message.text && <p className={`${message.senderId===userInfos.userID?"bg-blue-500 text-white rounded-tl-lg  rounded-br-lg rounded-bl-lg ":"bg-white dark:bg-gray-500 dark:text-white rounded-tr-lg rounded-br-lg rounded-bl-lg"} p-3  max-w-max`}>{message.text}</p>}
        {message.img && <img src={message.img} alt="" />}


      </div>


    </div>
  )
}

export default Message