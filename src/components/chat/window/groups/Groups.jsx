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
    const [slider, setSlider] = useState(false);
    const [sliderMember, setSliderMember] = useState(false);
    const [selVal, setSelVal] = useState("");


    const [groupImg, setGroupImg] = useState({
      file:null,
      url:""
  })
    
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
      const loadingLogo = document.getElementById("loading");
      const groupsSection = document.getElementById("groupsSection");
      loadingLogo.classList.remove("loadingHidden");
      groupsSection.style = "filter: blur(5px);"

        users.push(currentUser.id)
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userChats");
        const groupTitle = document.getElementById("groupTitle");
        try {
           
           
          const newChatRef = doc(chatRef)
          const imgUrl = await upload(avatar.file);

          await setDoc(newChatRef,{
            createdAt: serverTimestamp(),
            group: true,
            img: imgUrl,
            messages: [],
            title: groupTitle.value.trim()
          });

         for(let i=0; i<=users.length; i++ ){
            await updateDoc(doc(userChatsRef, users[i]),{
                chats: arrayUnion({
                  chatId: newChatRef.id,
                  lastMessage: "",
                  isSeen: false,
                  group: true,
                  groupAdmin: [currentUser?.username],
                  img: imgUrl,
                  title: groupTitle.value.trim(),
                  members: users,
                  receiverId: currentUser.id,
                  updatedAt: Date.now()
                })
              })
         }
         
        } catch (err) {
          toast.error(err);
        }finally{
          toast.success("Group Created!")
          loadingLogo.classList.add("loadingHidden");
          groupsSection.style = "filter: blur(0px);"
          location.reload()
        }
        
      }
    
    const handleLeaveGroup = async (chatId) =>{
      const loadingLogo = document.getElementById("loading");
      loadingLogo.classList.remove("loadingHidden");
      onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
        const items = res.data();
        let arrTest = items.chats;
        try {
          arrTest.map(async (item, indx) =>{
             if(item.chatId == chatId){
            
             for(let i = 0; i< item.members.length; i++){
               onSnapshot(doc(db, "userChats", item.members[i]), async (res) =>{
                
                const items = res.data();
                 let arrTest2 = items.chats;
                 arrTest2.map(async (item2, indexTest)=>{
                   if(item2.chatId == chatId){
                    let membersArr = item2.members;
                    let adminsArr = item2.groupAdmin;
                    for(let z = 0; z<adminsArr.length;z++){
                      if(adminsArr[z] == currentUser?.username){
                        adminsArr.splice(z, 1)
                        arrTest2[indexTest]["groupAdmin"] = adminsArr
                      }
                    }
                    // console.log(membersArr)
                    for(let j = 0; j<membersArr.length;j++){
                      if(membersArr[j] == currentUser?.id){
                        membersArr.splice(j, 1)
                        arrTest2[indexTest]["members"] = membersArr
                        // console.log(item.members[i])
                        await updateDoc(doc(db,"userChats", item.members[i]),{
                          chats: arrTest2
                        })
                      }
                    }
                   }
                 })
               })
             }
             arrTest.splice(indx, 1)
             await updateDoc(doc(db,"userChats", currentUser?.id),{
               chats: arrTest
             })

           }
           })
          console.log("User left the group")
        } catch (err) {
          console.log(err)
        }finally{
          setTimeout(() => {
          loadingLogo.classList.add("loadingHidden");
           location.reload()
          
         }, 1000);
        }


      })
    }

    const handleGroupEdit = async (chatId) => {
      const groupsSection = document.getElementById("groupsSection");
      const memberSelect = document.getElementById("memberSelect");
      const loadingLogo = document.getElementById("loading");
      const userChatsRef = collection(db, "userChats");
      loadingLogo.classList.remove("loadingHidden");
       groupsSection.style = "filter: blur(5px);"
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
            let adminsArr = []
            // let membersArr = []
            try {
              arrTest.map(async (item) =>{
                 if(item.chatId == chatId && item.members){
                  // membersArr = item.members
                  // if(!users.length < 1){
                  //   for(let j = 0; j < users.length; j++){

                   
                  //   membersArr.push(users[j]);
                  //   await updateDoc(doc(userChatsRef, users[j]),{
                  //     chats: arrayUnion({
                  //       chatId: item.chatId,
                  //       lastMessage: "",
                  //       isSeen: false,
                  //       group: true,
                  //       groupAdmin: item.groupAdmin,
                  //       img: item.imgUrl,
                  //       title: groupTitle.value.trim(),
                  //       members: membersArr,
                  //       receiverId: currentUser.id,
                  //       updatedAt: Date.now()
                  //     })
                  //   })
                  // }
                  // }
                 for(let i = 0; i< item.members.length; i++){
                  
                   onSnapshot(doc(db, "userChats", item.members[i]), async (res) =>{
                     const items = res.data();
                     let arrTest = items.chats;
                     
                     
                     arrTest.map(async (item, indexTest)=>{
                       if(item.chatId == chatId && item.members){
                        //  arrTest.splice(indexTest, 1)
                        adminsArr = item.groupAdmin;
                        
                          arrTest[indexTest]["img"] = imgUrl ? imgUrl : arrTest[indexTest]["img"]
                          arrTest[indexTest]["title"] = groupTitle.value.trim()
                          // arrTest[indexTest]["members"] = membersArr
                          if(selVal != "" && !adminsArr.includes(selVal)){
                            adminsArr.push(selVal);
                            arrTest[indexTest]["groupAdmin"] = adminsArr;
                          }
                          
                          

                         await updateDoc(doc(db,"userChats", item.members[i]),{
                           chats: arrTest
                         })
                        //  console.log(arrTest[indexTest]["groupAdmin"])
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
            }
          })
       
        toast.success("Group edited succesfully!");
    }catch(err){
        // console.log(username);
        toast.error(err.message);
    }finally{
      fetchUserInfo(currentUser.id)
      loadingLogo.classList.add("loadingHidden");
       groupsSection.style = "filter: blur(0px);"
       
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

    //  useEffect(()=>{
    //   setChatMember([])
      
    // }, [chatId])
  
    const [chatMembers, setChatMember] = useState([]);
  
    const handleMembers = (chatId)=>{
      onSnapshot(doc(db, "userChats", currentUser?.id), (res) =>{
        let arr = res.data().chats
        
        try {
          
          arr.map(async (item, indx) =>{
            if(item.chatId == chatId && item.members){
              for(let i=0; i<item.members.length; i++){
                onSnapshot(doc(db, "users", item.members[i]), (res) =>{
                  let arr2 = res.data()
                  
                      if(arr2.id == item.members[i]){
                        // console.log(arr2.username)
                       if(item.groupAdmin.includes(arr2.username)){
  
                        // chatMembers.push(arr2.username + " (Admin)")
                       }
                       else{
                        chatMembers.push(arr2.username)
                       }
                        
                      }
                 
                })
              }
              
            }
  
        })
        } catch (error) {
          console.log(error)
        }finally{
          // setChatMember([])
          console.log(chatMembers)
        }
        
      })
    }

    const handleAddMembers = (chatId) =>{
      const loadingLogo = document.getElementById("loading");
      loadingLogo.classList.remove("loadingHidden");
      const userChatsRef = collection(db, "userChats");
      onSnapshot(doc(db, "userChats", currentUser?.id), (res) =>{
        let arrChats = res.data().chats
        let tempMemberArr = []
        let memberArr = []
        try {
          
          arrChats.map(async (item, indx) =>{
            if(item.chatId == chatId){
              // console.log(item.members)
              memberArr = item.members
              tempMemberArr = {...memberArr}
             
              for(let i = 0; i<users.length; i++){
                if(!memberArr.includes(users[i])){

                  memberArr.push(users[i])
                
                // console.log(item.imgUrl)
                await updateDoc(doc(userChatsRef, users[i]),{
                  chats: arrayUnion({
                    chatId: item.chatId,
                    lastMessage: "",
                    isSeen: false,
                    group: true,
                    groupAdmin: item.groupAdmin,
                    img: item.img,
                    title: item.title,
                    members: memberArr,
                    receiverId: users[i],
                    updatedAt: Date.now()
                  })
                })
              }
              }
              // if(!memberArr.some(r=> users.includes(r))){
              for(let j=0;j<memberArr.length;j++){
                console.log(memberArr)
               
                  onSnapshot(doc(db, "userChats", memberArr[j]), (res2) =>{
                    let arrTest = res2.data().chats;
                    try {
                      arrTest.map(async (item2, index)=>{
                        if(item2.chatId == chatId && !item2.members.some(r=> users.includes(r))){
                          arrTest[index]["members"] = memberArr;
                          
                          if(!users.includes(memberArr[j])){
                            await updateDoc(doc(db,"userChats", memberArr[j]),{
                              chats: arrTest
                            })
                            
                          }
                         
                        }
                      })
                    } catch (error) {
                      console.log(error)
                    }finally{
                      setTimeout(() => {
                        loadingLogo.classList.add("loadingHidden");
                        location.reload()
                      }, 1000);
                      return;
                    }
                  })
                
              }
            
              // console.log(item.members)
              // setTimeout(() => {
                
               
              // }, 1000);
            
            } 
           
          })
          // console.log(memberArr)
          // let testArr = ['DbN1zsNtCnP7oF7VepnzoPcohND3']
          // if(memberArr.includes(users)){
          //   console.log("IT IS INCLUDED")
          // }else{
          //   console.log("not INCLUDED")
          // }
          const found = memberArr.some(r=> users.includes(r))
          // console.log(found)
          // tempMemberArr.map((item)=>{
          //   console.log(item)
          // })

        

            // Object.values(tempMemberArr).forEach(value => {
            //   console.log(value)
            //   console.log(users)
            //   if(users.includes(value)){
            //      onSnapshot(doc(db, "userChats", value), (res2) =>{
            //     let arrTest = res2.data().chats;
            //     try {
            //       arrTest.map(async (item2, index)=>{
            //         if(item2.chatId == chatId && !item2.members.some(r=> users.includes(r))){
            //           arrTest[index]["members"] = memberArr;
                      
                        
            //             await updateDoc(doc(db,"userChats", value),{
            //               chats: arrTest
            //             })
                     
            //         }
            //       })
            //     } catch (error) {
            //       console.log(error)
            //     }finally{
            //       return;
            //     }
            //   })
            // }
            //  });
          
          // for(let j = 0; j<tempMemberArr.length;j++){
           
          //   onSnapshot(doc(db, "userChats", tempMemberArr[j]), (res) =>{
          //     let arrTest = res.data().chats;
          //     try {
          //       arrTest.map(async (item2, index)=>{
          //         if(item2.chatId == chatId && !users.includes(tempMemberArr[j])){
          //           arrTest[index]["members"] = memberArr;
          //           await updateDoc(doc(db,"userChats", tempMemberArr[j]),{
          //             chats: arrTest
          //           })
          //         }
          //       })
          //     } catch (error) {
          //       console.log(error)
          //     }
          //   })
          // }

        } catch (error) {
          console.log(error)
        }finally{
          return;
        }
      })
    }

  return (
    <div className="groups">
      <div className="loading loadingHidden" id="loading"></div>
        <div className="groupsSection" id="groupsSection">
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
                                      const from = document.getElementById(chat.chatId + "Addmembers");
                                      from.classList.remove('hidden')
                                      handleMembers(chat?.chatId)
                                      setTimeout(() => {
                    
                                      fetchUserInfo(currentUser?.id)
                                    }, 500);
                                      
                                    }}>Add members</button>
                                    <button onClick={()=>{
                                      if(chat?.groupAdmin.length < 2){
                                        alert("You need to assign the admin role to someone else too before you leave this group !")
                                      }else{
                                        let confirm = prompt("Are you sure you want to leave this group? \n\n Type 'yes' to confirm");
                                        
                                        if(confirm.toLowerCase() == "yes"){
                                          handleLeaveGroup(chat?.chatId)
                                        }
                                      }
                                      
                                    }}>Leave Group</button>
                                   {chat?.groupAdmin.includes(currentUser?.username) ? <button onClick={()=>{
                                      let confirm = prompt("Are you sure you want to delete this group? \n\n Type 'yes' to confirm");
                                      
                                      if(confirm.toLowerCase() == "yes"){
                                        // alert("Deleted Succesfully")
                                        handleGroupDelete(chat?.chatId)
                                      }
                                    }}>Delete</button> : ""}
                                </div>
                                
                                <div className="editForm hidden" id={chat.chatId + "Addmembers"}>
                                <div className="addMemberSection">
                                    <span>Add members:</span>
                                    <div className="memberList">
                                    {chats.map((chat2)=>(
                                          !chat2?.group && !chat.members.includes(chat2.user.id) ? <div className="item" key={chat2.chatId}>
                                                              <input type="checkbox" onChange={()=>{
                                                                  const createGroupBtn = document.getElementById("createGroupBtn");
                                                                  if(!users.includes(chat2.user.id)){
                                                                      users.push(chat2.user.id)
                                                                  }else{
                                                                      users.pop(chat2.user.id)
                                                                  }
                                                                  console.log(users)
                                                                  // createGroupBtn.style.display = "flex"
                                                              }}/>
                                                              <img src={ chat2.user.avatar || "./avatar.png"} alt="" width="54" height="54"/>
                                                              <span>{chat2.user.username}</span>
                                                          </div> : ""

                                          ))}
                                    </div>
                                </div>
                                <div className="btns">
                                    <button onClick={()=> {
                                      // handleGroupEdit(chat?.chatId)
                                      handleAddMembers(chat?.chatId)
                                    }}>Save</button>
                                    <button onClick={() => {
                                      const from = document.getElementById(chat.chatId + "Addmembers");
                                      from.classList.add('hidden')
                                      
                                      
                                      
                                     
                                    }}>Cancel</button>
                                  </div>
                                </div>
                                <div className="editForm hidden" id={chat.chatId}>
                                  <label htmlFor="file">
                                    <span>Change Group Image</span>
                                    <img src={groupImg.url || chat?.group.img} alt=""  width="164" height="164"/>
                                  </label>
                                  <input type="file" id="file" style={{display: "none"}} onChange={handleGroupImg}/>
                                  <div className="belowGroupDetails">
                                    <div className="titleGroup">
                                      <span>Change Group Title</span>
                                    <input type="text" id={chat.chatId + "_" + "groupTitleInput"} defaultValue={chat?.group.title}/>
                                    </div>
                                    {chat.groupAdmin.includes(currentUser.username) ? <div className="grantAdmin">
                                      <span>Grant Admin Role: <img src={slider ? "slideON.png" : "slideOFF.png"} alt="" onClick={()=>{
                                        setSlider((prev) => !prev)
                                        if(!slider){
                                          handleMembers(chat?.chatId)
                                          setTimeout(() => {
                        
                                          fetchUserInfo(currentUser?.id)
                                        }, 500);
                                        }else{
                                          setChatMember([])
                                          setSelVal("")
                                        }
                                      }}/></span>
                                      {slider ? <select name="asd" id="memberSelect" value={selVal} onChange={e => setSelVal(e.target.value)}>
                                      <option value=""></option>
                                      {chatMembers?.map((member, indx) => (
                                         
                                          <option key={indx} value={member}> {member} </option>
                                         ))}
                                      </select> : ""}
                                    </div> : ""}
                                    {/* <div className="addMembers">
                                    <span>Add new members: <img src={sliderMember ? "slideON.png" : "slideOFF.png"} alt="" onClick={()=>{
                                        setSliderMember((prev) => !prev)
                                        if(!sliderMember){
                                          setTimeout(() => {
                                          fetchUserInfo(currentUser?.id)
                                        }, 500);
                                        }else{
                                          setUsers([])
                                        }
                                      }}/></span>
                                      {sliderMember ? <div className="memberList">
                                      {chats.map((chat2)=>(

                                            !chat2?.group && !chat.members.includes(chat2.user.id) ? <div className="item" key={chat2.chatId}>
                                                                <input type="checkbox" onChange={()=>{
                                                                    const createGroupBtn = document.getElementById("createGroupBtn");
                                                                    if(!users.includes(chat2.user.id)){
                                                                        users.push(chat2.user.id)
                                                                    }else{
                                                                        users.pop(chat2.user.id)
                                                                    }
                                                                    console.log(users)
                                                                    // createGroupBtn.style.display = "flex"
                                                                }}/>
                                                                <img src={ chat2.user.avatar || "./avatar.png"} alt="" width="34" height="34"/>
                                                                <span>{chat2.user.username}</span>
                                                            </div> : ""

                                      ))}</div> : ""}
                                    </div> */}
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
                                      setChatMember([])
                                      setSlider(false)
                                      setSliderMember(false)
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