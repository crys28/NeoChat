import Chat from "./components/chat/Chat";
import Navbar from "./components/navbar/Navbar";
import Login from "./components/login/Login"
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

// import { useChatStore } from "./lib/chatStore";
{/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}


const App = () => {

  const {currentUser, isLoading, fetchUserInfo, changeSettings, displayGroups } = useUserStore()

  // console.log(currentUser?.bg)

  const {changeChatId } = useChatStore()


  useEffect(()=>{
    const unSub = onAuthStateChanged(auth, (user)=>{
      // if (user?.emailVerified) {
      //   fetchUserInfo(user?.uid)
      // } else {
      //   // alert('Please verify your email before logging in.');
      // }
    
       
        if(!user?.emailVerified){
          // auth.signOut();
          fetchUserInfo(!user?.uid)
        }else{
          // location.reload()
          displayGroups(false);
          changeChatId(false);
          changeSettings(false);
          fetchUserInfo(user?.uid)
        }
    })

    return () => {
      unSub();
    };
  },[fetchUserInfo]);

  

  if(isLoading) return <div className="loading"></div>

  return (
    <div className='container' id="containerMain" style={{backgroundImage: `url("${currentUser ? currentUser.bg : './bg.png'}")`}}>
      {
        currentUser ? (
          <>
          <Navbar/>
          <Chat/>
          </>
        ) : (
        <Login/>
        )
      }
      <Notification/>
     
    </div>
  )
}

export default App;