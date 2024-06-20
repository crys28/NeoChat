import { useEffect, useState } from "react";
import "./groups.css";
import { DocumentSnapshot, FieldValue, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";
import { useChatStore } from "../../../../lib/chatStore";
import upload from "../../../../lib/upload";
import { toast } from "react-toastify";

const Groups = () => {
    const [chats, setChats] = useState([]);
    const {currentUser, fetchUserInfo} = useUserStore();
    const {chatId,changeChat} = useChatStore();
    const [users, setUsers] = useState([]);
    const [chatGr, setChatGr] = useState([]);

    const [groupImg, setGroupImg] = useState({
      file:null,
      url:""
  })
    // const testArr = ["alex", "calin"]

    // console.log(currentUser.id)

    
    // const userChatRef = getDoc(db, 'userChats', currentUser.id);
    // console.log(userChatRef)
    // const snapshot = userChatRef.get();
    // snapshot.forEach(doc => {
    //   console.log(doc.currentUser.id, '=>', doc.data());
    // });
    // const members = []
    // useEffect(() =>{
      // const docRef = doc(db, "userChats", currentUser.id);
      // const docSnap = getDoc(docRef);
      // console.log(docSnap.data())
      
      
      // const getUserChat = onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
      //   const items = res.data().chats;
        
      //   items.map(async (item) =>{
      //     if(item.members){
      //      members.push(item.members)
      //       console.log(item.members)
      //     }
      //   })
      //   console.log(members)
      // })

      // for(let i = 0; i<=members[0].length; i++){
      //   const unSub = onSnapshot(doc(db, "users", currentUser.id), async (res) =>{
      //     const items = res.data();
      //     console.log(items.username)

      //   })
      // }
      
        // console.log(chatGr?.members)
        // const promises = items.map( async(item)=>{
          //  items.map(async(item)=>{
          //   console.log(item)

            // return{...item}
          //  })
      //       console.log(item.username)
      //     //   const userDocRef = doc(db, "chats", item.chatId);
      //     //   const userDocSnap = await getDoc(userDocRef);
      
      //     // const group = userDocSnap.data()
      //     return {...item};
      
    
      // })
      // const chatData = await Promise.all(promises)
    
      //   setChatGr(chatData.sort((a,b)=>b.updatedAt - a.updatedAt))
     
    
    //   return () =>{
    //     unSub();
    //     getUserChat();
    //   }
    // }, [currentUser.id])

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


    const usersArr = []
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    })

    const handleAvatar = e => {
        if(e.target.files[0]){
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const [groupModal, setGroupModal] = useState(false);
    
    const hidden = {display: "none"}

    const handleCreateGroup = async () =>{
        users.push(currentUser.id)
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userChats");
        const groupTitle = document.getElementById("groupTitle");
        try {
           
            toast.success("Group Created!")
          const newChatRef = doc(chatRef)
          const imgUrl = await upload(avatar.file);

          await setDoc(newChatRef,{
            createdAt: serverTimestamp(),
            group: true,
            img: imgUrl,
            messages: [],
            title: groupTitle.value.trim()
          });

          // await setDoc(newUserChatRef,{
          //   createdAt: serverTimestamp(),
          //   group: true,
          //   img: imgUrl,
          //   messages: [],
          //   title: groupTitle.value.trim()
          // });
    
         for(let i=0; i<=users.length; i++ ){
            await updateDoc(doc(userChatsRef, users[i]),{
                chats: arrayUnion({
                  chatId: newChatRef.id,
                  lastMessage: "",
                  isSeen: false,
                  group: true,
                  img: imgUrl,
                  title: groupTitle.value.trim(),
                  members: users,
                  receiverId: currentUser.id,
                  updatedAt: Date.now()
                })
              })
         }
          
        
         location.reload()
        } catch (err) {
          console.log(err);
        //   throw(err);
        }
        
      }
   

    const handleGroupEdit = async (chatId) => {
      const loadingLogo = document.getElementById("loading");
      loadingLogo.classList.remove("loadingHidden");
      let imgUrl = null;
      
      try{

        if(groupImg.file){
          imgUrl = await upload(groupImg.file);
        }
        const groupTitle = document.getElementById(chatId + "_" + "groupTitleInput")

        await updateDoc(doc(db,"chats", chatId),{
            title: groupTitle.value.trim(), 
            ...(imgUrl && {img:imgUrl}),
          });

          onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
            const items = res.data();
            let arrTest = items.chats;
            try {
              arrTest.map(async (item) =>{
                 if(item.chatId == chatId && item.members){
                 for(let i = 0; i< item.members.length; i++){
                   onSnapshot(doc(db, "userChats", item.members[i]), async (res) =>{
                     const items = res.data();
                     let arrTest = items.chats;
                     arrTest.map(async (item, indexTest)=>{
                       if(item.chatId == chatId && item.members){
                        //  arrTest.splice(indexTest, 1)
                          arrTest[indexTest]["img"] = imgUrl ? imgUrl : arrTest[indexTest]["img"]
                          arrTest[indexTest]["title"] = groupTitle.value.trim()

                         await updateDoc(doc(db,"userChats", item.members[i]),{
                           chats: arrTest
                         })
                         
                       }
                     })
                   })
                 }
               }
               })
              console.log("Group edited")
            } catch (err) {
              console.log(err)
            }finally{
              loadingLogo.classList.add("loadingHidden");
            }
          })
       
        fetchUserInfo(currentUser.id)
        // const saveBtn = document.getElementById("btns");
        // saveBtn.classList.add('hidden')
        toast.success("Group edited succesfully!");
    }catch(err){
        // console.log(username);
        toast.error(err.message);
    }finally{
      loadingLogo.classList.add("loadingHidden");
      location.reload()
        // setLoading(false);
        // loadingLogo.classList.add("loadingHidden");
        // settingsContainer.style = "filter: blur(0px);"
        
    }
    }

    const handleGroupImg = e => {
      if(e.target.files[0]){
          setGroupImg({
              file: e.target.files[0],
              url: URL.createObjectURL(e.target.files[0])
          })
      }
  }

  const handleGroupDelete = async (chatId) => {
    const loadingLogo = document.getElementById("loading");
    loadingLogo.classList.remove("loadingHidden");
    onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
        const items = res.data();
        let arrTest = items.chats;
        try {
          arrTest.map(async (item) =>{
             if(item.chatId == chatId && item.members){
             for(let i = 0; i< item.members.length; i++){
               onSnapshot(doc(db, "userChats", item.members[i]), async (res) =>{
                 const items = res.data();
                 let arrTest = items.chats;
                 arrTest.map(async (item, indexTest)=>{
                   if(item.chatId == chatId && item.members){
                     arrTest.splice(indexTest, 1)
   
                     await updateDoc(doc(db,"userChats", item.members[i]),{
                       chats: arrTest
                     })

                     await deleteDoc(doc(db, "chats", item.chatId));
                     
                   }
                 })
               })
             }
           }
           })
          console.log("Group deleted")
        } catch (err) {
          console.log(err)
        }finally{
          loadingLogo.classList.add("loadingHidden");
        }


      })

  }

    useEffect(()=>{
        const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
          const items = res.data().chats;
    
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



  return (
    <div className="groups">
      <div className="loading loadingHidden" id="loading"></div>
        <div className="groupsSection">
            <div className="title">
                <h1>Groups</h1>
                <button onClick={()=>{setGroupModal(prev=>!prev)}}>New Group</button>
            </div>
        
        
        {groupModal && <div className="createGroup" id="createGroup">
            <div className="modalTitle">
                <span>Select members of your group!</span>
                <img src="./x.png" alt="" onClick={()=>{setGroupModal(prev=>!prev)}}/>
            </div>
            
            <div className="settingGroup">
                <div className="friendSection">

                    {chats.map((chat)=>(

   !chat?.group ? <div className="item" key={chat.chatId}>
                        <input type="checkbox" onChange={()=>{
                            const createGroupBtn = document.getElementById("createGroupBtn");
                            if(!users.includes(chat.user.id)){
                                users.push(chat.user.id)
                            }else{
                                users.pop(chat.user.id)
                            }
                            console.log(users)
                            createGroupBtn.style.display = "flex"
                        }}/>
                        <img src={ chat.user.avatar || "./avatar.png"} alt="" width="54" height="54"/>
                        <span>{chat.user.username}</span>
                    </div> : ""

                    ))}
                </div>

                <div className="rightSideGroupSetting">
                    <div className="groupImg">
                        <label htmlFor="fileGroupImg">
                            <img src={avatar.url || "./groups.png"} alt="" width="84" height="84"/>
                        </label>
                        <span>Change group image</span>
                        <input type="file" name="fileGroupImg" id="fileGroupImg" style={{display: "none"}} onChange={handleAvatar}/>
                    </div>
                    <div className="groupTitle">
                        <span>Group Title</span>
                        <input type="text" defaultValue="Group" id="groupTitle"/>
                    </div>
                </div>    
            </div>

            <div className="btns" style={hidden} id="createGroupBtn">
                <button onClick={handleCreateGroup}>Create Group</button>
            </div>
        </div>}
            
            <div className="groupSection">

            {chatGr.map((chat)=>(
            chat?.group ?  <div className="item" key={chat.chatId}>
                                <div className="info">
                                    <img src={chat?.group.img} alt="" width="44" height="44"/>
                                    <div className="texts">
                                        <h3>{chat?.group.title}</h3>
                                    </div>
                                </div>
                                <div className="btns">
                                    <button onClick={ ()=>{
                                        const from = document.getElementById(chat.chatId);
                                        from.classList.remove('hidden')
                                        setGroupImg({
                                          url: null
                                        })
                                    }}>Edit</button>
                                    <button onClick={()=>{
                                      let confirm = prompt("Are you sure you want to delete this group? \n\n Type 'yes' to confirm");
                                      
                                      if(confirm.toLowerCase() == "yes"){
                                        // alert("Deleted Succesfully")
                                        handleGroupDelete(chat?.chatId)
                                      }
                                    }}>Delete</button>
                                </div>


                                <div className="editForm hidden" id={chat.chatId}>
                                  <label htmlFor="file">
                                    <span>Change Group Image</span>
                                    <img src={groupImg.url || chat?.group.img} alt=""  width="164" height="164"/>
                                  </label>
                                  <input type="file" id="file" style={{display: "none"}} onChange={handleGroupImg}/>
                                  <div className="titleGroup">
                                    <span>Change Group Title</span>
                                  <input type="text" id={chat.chatId + "_" + "groupTitleInput"} defaultValue={chat?.group.title}/>
                                  </div>
                                  <div className="btns">
                                    <button onClick={()=> {
                                      handleGroupEdit(chat?.chatId)
                                    }}>Save</button>
                                    <button onClick={() => {
                                      const from = document.getElementById(chat.chatId);
                                      const groupTitleInput = document.getElementById(chat.chatId + "_" +"groupTitleInput");
                                      groupTitleInput.value = chat?.group.title 
                                      from.classList.add('hidden')
                                      setGroupImg({
                                        url: null
                                      })
                                     
                                    }}>Cancel</button>
                                  </div>
                                </div>
                            </div>
                            : ""
   
            ))}     
            </div>


        </div>

    </div>
  )
}

export default Groups