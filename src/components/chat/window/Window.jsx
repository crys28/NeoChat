import { useEffect, useState } from "react";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import ChatWindow from "./chatWindow/ChatWindow"
import Settings from "./settings/Settings";
import "./window.css"
import Groups from "./groups/Groups";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { toast } from "react-toastify";

const Window = () => {
  const [state, setState] = useState(false)
  const {chatId} = useChatStore();
  const {currentUser,settingsPage, groupsPage} = useUserStore();
  const [arrow, setArrow] = useState([false])
  const userDocRef = doc(db, "users", currentUser?.id)
  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "users", currentUser.id), async (res) => {
      const callNow = res.data();

      try {
        if(callNow.callNow){
      
          alert(callNow.caller + " is calling you!\nUse this id to connect to the call:\n" + callNow?.callId); 
          
          setTimeout( async() => {
          await navigator.clipboard.writeText(callNow?.callId);
          toast.success('Call ID copied to clipboard');
            
          await updateDoc(userDocRef, {
              callNow: false,
              callId: "",
              caller: ""
            })
          }, 500);
          
      
      }
      } catch (error) {
        console.log(error)
      }

      


    });

    return ()=>{
      unSub()
    }
    
  },[currentUser.id])
      
    
    
 
  // const window = document.getElementById('window');
  // window.style.backgroundImage = "url('/bg.png')";
  const styleSpan = {
    // width: "400px",
    // height:"200px",
    backgroundColor: "rgba(60, 60, 60, 1)",
    boxShadow: "0px 2px 50px #888",
    borderRadius: "20px",
    padding: "20px"
  }
  return (
    <div className="window" id="window">
      {/* <ChatWindow/> */}
      {chatId && <ChatWindow/> || settingsPage && <Settings/> || groupsPage && <Groups/> ||  <span style={styleSpan}>Select any chat to start a conversation...</span>}
      <img className="arrowImg" src={arrow ? "./leftArrow.png" : "./rightArrow.png"}  alt="" width="44" height="44" style={{alignSelf: "flex-end", position: "absolute", left: "-7px", top: "11%", zIndex: "4"}} onClick={() =>{
      const list = document.getElementById("list");
        if(arrow){
          list.style.position = "absolute";
          list.style.left = "-500px";
          
        }else{
          // list.classList.remove("hidden");
          list.style.position = "relative";
          list.style.left = "0px";
        }
        setArrow(prev=>!prev);
        
      }}/>
    </div>
  )
}

export default Window