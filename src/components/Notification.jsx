import React from 'react'
import { useNavigate } from 'react-router-dom';

const Notification = ({info,removeFunc}) => {


    const navigate=useNavigate();
    var str="";

    switch (info.type) {
        case 0:
            str=`${info.userName} commented on a post.`
            break;
        case 1:
            str=`${info.userName} liked a post`
            break;
        case 2:
            str=`${info.userName} sent a friend request`
            break;
        case 3:
            str=`${info.userName} accepted your friend request`
            break;        
        default:
            break;
    }

    const doTheAction=async()=>{

        if(info.type===0 || info.type==1){

            navigate(`/${info.userID}/Post/${info.postID}`);


        }

        else{

            navigate(`/Profile/${info.userName}`);

        }

        await removeFunc();


    }

  return (
    <div onClick={doTheAction} className='flex cursor-pointer w-full items-center justify-between px-2 py-1 hover:bg-gray-100  dark:hover:bg-[#1d1d1d]'>
        <img src={info.profilePicture} alt={info.userName} className='h-[3vh] w-[3vh] rounded-full'/>
        <span>{str}</span>
    </div>
  )
}

export default Notification