import { useEffect, useState } from "react";
import "./list.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
// import { useChatGroupStore } from "../../../lib/chatGroupStore";

const List = () => {
  
 const [chats, setChats] = useState([]);
 const [input, setInput] = useState("");
 const [addMode, setAddMode] = useState(false);
 const [chatGr, setChatGr] = useState([]);
 const {currentUser} = useUserStore();
 const {chatId,changeChat} = useChatStore();
//  const {changeChatGroup} = useChatGroupStore();
 const [selectChats, setSelectChats] = useState("all")
//  console.log(chatId)

 useEffect(()=>{
    const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
      const items = res.data().chats;
      
      // if(!items[1].participants){
      //   console.log("nu exista participanti")
      //   }else{
      //   console.log("exista participanti")
        
      // } 
      // console.log(items[1].participants)
      const promises = items.map( async(item)=>{
       

          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
  
        const user = userDocSnap.data()
      return {...item, user};
         

      })

      const chatData = await Promise.all(promises)

      setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt));

    });

    return ()=>{
      unSub()
    }
 },[currentUser.id]);

//  useEffect(()=>{
//   const unSub = onSnapshot(doc(db, "chats", currentUser.id), async (res) =>{
//      setChatGr(res.data())
//   })

//   return () =>{
//     unSub();
//   }

//   }, [currentUser.id]);
  
  
 useEffect(()=>{
  const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
    const items = res.data().chats;
    const promises = items.map( async(item)=>{
       
      if(item.group == true){
        
        const userDocRef = doc(db, "chats", item.chatId);
        const userDocSnap = await getDoc(userDocRef);
  
      const group = userDocSnap.data()
    return {...item, group};
      }else{
        return;
      }
     

  })
  const chatData = await Promise.all(promises)

    setChatGr(chatData.sort((a,b)=>b.updatedAt - a.updatedAt))
  })

  return () =>{
    unSub();
  }
}, [currentUser.id]);


  const handleSelect = async (chat) => {
    // console.log(chatGr.title)
    const userChats = chats.map(item => {
      const {user, ...rest} = item;

      return rest;
    })

    const chatIndex = userChats.findIndex((item)=>item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userChats", currentUser.id);

    try {
        await updateDoc(userChatsRef,{
          chats: userChats,
        })
        changeChat(chat.chatId, chat.user)
    } catch (err) {
      console.log(err)
    }

  }

  // const handleGroupSelect = async (chat) => {
  //   // console.log(chatGr.title)
  //   // const userChats = chats.map(item => {
  //   //   const {group, ...rest} = item;

  //   //   return rest;
  //   // })

  //   // const chatIndex = userChats.findIndex((item)=>item.chatId === chat.chatId);

  //   // userChats[chatIndex].isSeen = true;

  //   // const userChatsRef = doc(db, "userChats", currentUser.id);

  //   try {
  //       // await updateDoc(userChatsRef,{
  //       //   chats: userChats,
  //       // })
  //       changeChat(chat.chatId, chat.group)
  //   } catch (err) {
  //     console.log(err)
  //   }

  // }
  const filteredChats = chats.filter(c=> c.user.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="list" id="list">
 
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt=""  width="28" height="28"/>
          <input type="text" placeholder="Search.." onChange={(e) => setInput(e.target.value)}/>
        </div>
        <div className="addUserBtn">
          <img id="imgFix" src={addMode ? "./minus.png" : "./plus.png"} alt="" className="addImg" onClick={()=> {
            setAddMode(prev=>!prev);
            if(!addMode){
              const chatWindow = document.getElementById("chatWindow");
              chatWindow.style = "filter: blur(10px)";
            }else{
              const chatWindow = document.getElementById("chatWindow");
              chatWindow.style = "filter: blur(0px)";
            }
            
            }}/>
        </div>
      </div>
    
    <div className="sliderChats">
      <select name="" id="sliderChats" value={selectChats} onChange={e => setSelectChats(e.target.value)}>
        <option value="all">All</option>
        <option value="chat">Chats</option>
        <option value="group">Groups</option>
      </select>
    </div>

    <div className="chatList">
      

   

    {filteredChats.map((chat)=>(
chat.group && selectChats == "group" || 
!chat.group && selectChats == "chat" || selectChats == "all" ?  
<div className="item" key={chat.chatId} onClick={()=> handleSelect(chat)} style={{backgroundColor: chat?.isSeen? "transparent" : "#dddddd35"}}>
        <img src={chat?.group ? chat?.img || "./groups.png"   : chat?.user.avatar || "./avatar.png"} alt="" />
        <div className="texts">
          <span>{chat?.group ? chat?.title ||  "Group" : chat?.user.username}</span>
          <p>{chat?.lastMessage}</p>
        </div>
      </div>  : ""
       ))}

    </div>
    {addMode ? <AddUser/> : ""}
    </div>
  )
  
}


export default List;