import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import "./addUser.css";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify";

const AddUser = () => {
  const {currentUser} = useUserStore();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [testArr, setTestArr] = useState([]);
  const [userExist, setUserExist] = useState(false);
  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
      const items = res.data().chats;

      const promises = items.map( async(item)=>{
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        testArr.push(item?.receiverId)
        const user = userDocSnap.data()

        return {...item, user, testArr};
      })
     
      const chatData = await Promise.all(promises)

      setChats(chatData.sort((a,b)=>b.updatedAt - a.updatedAt));

    });

    return ()=>{
      unSub()
    }
 },[currentUser.id]);

  const handleSearch = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get("username")
    try{
      const userRef = collection(db, "users");
      
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);
      
      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data());
        for(let i = 0; i<testArr.length; i++){
          if(testArr[i] === querySnapShot.docs[0].data().id){
            setUserExist(true)
          }else{
            setUserExist(false)
          }
        }
        
       
      }
    }catch(err){
      console.log(err)
    }
  }

  const handleAddUser = async () =>{

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");
    try {
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef,{
        createdAt: serverTimestamp(),
        messages: [],
      });

     
      await updateDoc(doc(userChatsRef, user.id),{
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now()
        })
      })

     

        await updateDoc(doc(userChatsRef, currentUser.id),{
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: user.id,
            updatedAt: Date.now()
          })
        })
    
       
    

      // console.log(newChatRef.id)
    } catch (err) {
      console.log(err);
    }finally{
      const modal = document.getElementById("modal");
            const imgFix = document.getElementById("imgFix");
            const chatWindow = document.getElementById("chatWindow");
            {chatWindow ? chatWindow.style = "filter: blur(0px)" : ""};
            modal.style = "display: none";
            imgFix.src = "./plus.png"
            toast.success("User added to your friends!")
  }
  }

  return (
    <div className="addUser" id="modal">
       <div className="loading loadingHidden" id="loading"></div>
       <div className="addUserModal">
        <div className="titleBar">
          <span>Add new friends</span>
          <img src="./x.png" alt="" onClick={()=>{
            const modal = document.getElementById("modal");
            const imgFix = document.getElementById("imgFix");
            const chatWindow = document.getElementById("chatWindow");
            {chatWindow ? chatWindow.style = "filter: blur(0px)" : ""};
            modal.style = "display: none";
            imgFix.src = "./plus.png"
            // location.reload();
          }}/>
        </div>
        
        <form onSubmit={handleSearch}>
            <input type="text" placeholder="Username" name="username"/>
            <button>Search</button>
        </form>

        {(user && (user.username == currentUser.username)) && 
        <div className="user">
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button disabled style={{backgroundColor: "#dddddd2d", color: "grey"}}>You</button>
        </div>
        }

        {(user && (user.username != currentUser.username)) &&
        <div className="user">
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button disabled={userExist} style={userExist ? {backgroundColor: "#dddddd2d", color: "grey"} : {}} onClick={handleAddUser}>{userExist ? "Added" : "Add User"}</button>
        </div>
        }

        </div>
    </div>
  )
}

export default AddUser;