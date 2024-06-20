import { useState } from "react";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import ChatWindow from "./chatWindow/ChatWindow"
import Settings from "./settings/Settings";
import "./window.css"
import Groups from "./groups/Groups";

const Window = () => {

  const {chatId} = useChatStore();
  const {currentUser,settingsPage, groupsPage} = useUserStore();
  const [arrow, setArrow] = useState([false])
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