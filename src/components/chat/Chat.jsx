import { useUserStore } from "../../lib/userStore"
import "./chat.css"
import List from "./list/List"
import Window from "./window/Window"
// import AddUser from "./addUser/AddUser"
// import addMode from "./list/List"

const Chat = () => {
  // const body = document.getElementsByTagName("body");
  // const Background = "'./bg.png'"
  // body[0].style = {backgroundImage: `url(${Background})`}
  const {currentUser, isLoading, fetchUserInfo } = useUserStore();

  // const containerMain = document.getElementById('containerMain');
  // containerMain.style = {backgroundImage:`url("${currentUser.bg}")`}
  return (
    <div className="chat">
        <List/>
        <Window/>
        {/* {addMode ? <AddUser/> : ""} */}
    </div>
  )
}

export default Chat