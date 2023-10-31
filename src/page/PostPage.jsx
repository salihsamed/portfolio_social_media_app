import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import Post from '../components/Post';
import {ClipLoader} from 'react-spinners'

const PostPage = () => {

    const [infos,setInfos]=useState({});
    const {postID,userID}=useParams();

    const getInfos=async()=>{

        const docRef = doc(db, "posts",userID);
        const snapshot=await getDoc(docRef);
        setInfos(snapshot.data()[postID]);

    }

    
    useEffect(()=>{


        getInfos();
        


    },[postID])

  return (
    <div className='dark:bg-black py-10'>

        <div className='w-[40%] mx-auto'>
          {Object.keys(infos).length>0?<Post post={infos} key={infos.postID}/>:<ClipLoader/>}
        </div>
        
    </div>
  )
}

export default PostPage