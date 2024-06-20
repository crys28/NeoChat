import { useChatStore } from "../../lib/chatStore"
import { auth } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore"
import "./navbar.css"


const Navbar = () => {
  const {currentUser, changeSettings, displayGroups } = useUserStore()
  const {changeChatId } = useChatStore()
  return (
    <div className="navbar">
      <div className="logo">
        <img src="/logo.png" alt="" width="254" height="84" onClick={()=>{location.reload()}}/>
      </div>
      <div className="navBtns">
        <img src={currentUser.avatar || "/profile.png"} title="Profile" alt="" width="38" height="38" onClick={() => {
          displayGroups(false);
          changeChatId(false);
          changeSettings(false);
        }}/>
        <span>{currentUser.username || "User"} </span>
        <span>|</span>
        <img src="/groups.png" title="Groups" alt="" width="38" height="38" onClick={() => {
          displayGroups(true);
          changeChatId(false);
          changeSettings(false);
        }}/>
        <img src="/settings.png" title="Settings" alt="" width="38" height="38" onClick={() => {
          changeSettings(true);
          displayGroups(false);
          changeChatId(false);
        }}/>
        <img src="/logOut.png" title="Log Out" alt="" width="38" height="38" onClick={()=> auth.signOut()}/>
      </div>
    </div>
  )
}

export default Navbar