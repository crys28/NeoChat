import { useEffect, useRef, useState } from "react";
import "./chatWindow.css"
import EmojiPicker from "emoji-picker-react";
import { arrayRemove, arrayUnion, doc, documentId, getDoc, onSnapshot, updateDoc, collection, addDoc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db, firestore } from "../../../../lib/firebase";
import { useChatStore } from "../../../../lib/chatStore";
import { useUserStore } from "../../../../lib/userStore";
import upload from "../../../../lib/upload";
import { format } from 'timeago.js';
// import { useChatGroupStore } from "../../../../lib/chatGroupStore";
import axios from 'axios';
import JsGoogleTranslateFree from "@kreisler/js-google-translate-free";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
// import { francAll } from "franc-min";
// import { franc } from 'franc-min';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// const firestore = firebase.firestore();
// const voices = window.speechSynthesis.getVoices();
const ChatWindow = () => {
  const [chat, setChat] = useState();
  const [groupChat, setGroupChat] = useState();
  const [slider, setSlider] = useState(false);
  const [arrowUp, setArrowUp] = useState(false);
  const [language, setLanguage] = useState("en")
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const centerChat = document.getElementById("centerChat")
  const [translate, setTranslate] = useState("");
  const [img, setImg] = useState({
    file: null,
    url:""
  });
  // const [txt, setTxt] = useState({
  //   file: null,
  //   url:""
  // });



  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, changeChatId} = useChatStore();
  // const {userGroup, chatGroupId} = useChatGroupStore();
  const {currentUser, fetchUserInfo} = useUserStore();

  //VIDEO CHAT RELATED
  const [callId, setCallId] = useState(null);
  const [vidChat, setVidChat] = useState(false);
  const [answerOn, setAnswerOn] = useState(false);
  const [userCall, setUserCall] = useState("");
  const [chatInput, setChatInput] = useState("Input id here...");
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);

  const pc = useRef(new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  }));
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream());
  // const rem = document.getElementById('remoteVideo').srcObject

useEffect(()=>{
  // pc.current.ontrack = (event) => {
  //   remoteStream.current.addTrack(event.track);
  //   document.getElementById('remoteVideo').srcObject = remoteStream.current;
  // };
}, [])

  useEffect(() => {
   
    pc.current.oniceconnectionstatechange = () => {
      if (pc.current.iceConnectionState === 'disconnected' || pc.current.iceConnectionState === 'failed' || pc.current.iceConnectionState === 'closed') {
        // hangUp();
        // pc.current = new RTCPeerConnection({
        //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        // });
        // pc.current.ontrack = (event) => {
        //   remoteStream.current.addTrack(event.track);
        //  document.getElementById('remoteVideo').srcObject = remoteStream.current;
        // };
        // remoteStream.current = new MediaStream();
       
          
          setVidChat(false)
          // if (pc) {
          //   pc.current.close();
          //   // pc.current = null;
            
          // }
          // // Stop all local media tracks
          // if (localStream) {
          //   localStream.current.getTracks().forEach(track => track.stop());
          //   localStream.current = null;
          // }
          hangUp()
       
        
      }
    } 
   
   
    // pc.current.onicecandidate = (event) => {
    //   if (event.candidate && callId) {
    //     const candidatesCollectionRef = collection(
    //       firestore,
    //       'calls',
    //       callId,
    //       'candidates'
    //     );
    //     addDoc(candidatesCollectionRef, event.candidate.toJSON());
    //   }
    // };
  }, [pc.current]);

  
  // const webcamButton = document.getElementById('webcamButton');
 
  // const callInput = document.getElementById('callInput');
  // const answerButton = document.getElementById('answerButton');
  
  // const hangupButton = document.getElementById('hangupButton');

  const createCall = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    localStream.current.getTracks().forEach((track) => {
      pc.current.addTrack(track, localStream.current);
    });
    remoteStream.current = new MediaStream();

    pc.current.ontrack = (event) => {
      remoteStream.current.addTrack(event.track);
      document.getElementById('remoteVideo').srcObject = remoteStream.current;
    };
    setAnswerOn(true)
      const callInput = document.getElementById('callInput');
    
      const userDocRef = doc(db, "users", user?.id)
      const callDocRef = doc(collection(firestore, 'calls'));
      setCallId(callDocRef.id);
      const offerCandidatesCollectionRef = collection(callDocRef, 'offerCandidates');
      const answerCandidatesCollectionRef = collection(callDocRef, 'answerCandidates');
        callInput.value = callDocRef.id
        // Get candidates for caller, save to 
        
        pc.current.onicecandidate = (event) => {
          event.candidate && addDoc(offerCandidatesCollectionRef, event.candidate.toJSON());
        };
        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);
    
        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        };
    
        await setDoc(callDocRef, { offer });
    
        onSnapshot(callDocRef, (snapshot) => {
          const data = snapshot.data();
          if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.current.setRemoteDescription(answerDescription);
          }
        });
    
        onSnapshot(answerCandidatesCollectionRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.current.addIceCandidate(candidate);
            }
    
      // setCallId(callDocRef.id);
        });
      });

      await updateDoc(userDocRef, {
        callNow: true,
        callId: callDocRef.id,
        caller: currentUser.username
      })

      alert("Send this id to your friend: " + callDocRef.id)
    
  }

  const answerCall = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    localStream.current.getTracks().forEach((track) => {
      pc.current.addTrack(track, localStream.current);
    });
    remoteStream.current = new MediaStream();

    pc.current.ontrack = (event) => {
      remoteStream.current.addTrack(event.track);
      document.getElementById('remoteVideo').srcObject = remoteStream.current;
    };
    setAnswerOn(true)
    const callId = document.getElementById('callInput').value;
    const callDocRef = doc(firestore, 'calls', callId);
    // setCallId(callId);
    setCallId(callId);
    const offerCandidatesCollectionRef = collection(callDocRef, 'offerCandidates');
    const answerCandidatesCollectionRef = collection(callDocRef, 'answerCandidates');

    pc.current.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidatesCollectionRef, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDocRef)).data();

    const offerDescription = callData.offer;
    await pc.current.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDocRef, { answer });

    onSnapshot(offerCandidatesCollectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current.addIceCandidate(candidate);
        }
      });
    });

  }
  const testhangUp = async () => {
    // let callDoc = doc(collection(firestore, 'calls'));
    // await deleteDoc(callDoc);
    const callDocRef = doc(firestore, 'calls', callId);
    await deleteDoc(callDocRef);
  }
  const hangUp = async () => {
    // Close the RTCPeerConnection
    // if (pc) {
    //   pc.current.close();
    //   pc.current = null;
      
    // }
    // // Stop all local media tracks
    // if (localStream) {
    //   localStream.current.getTracks().forEach(track => track.stop());
    //   localStream.current = null;
    // }
    pc.current.close();
    if (localStream) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }          

  const callDocRef = doc(firestore, 'calls', callId);
  await deleteDoc(callDocRef);
  }

  const toggleLocalMute = () => {
    localStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setIsLocalMuted(!isLocalMuted);
  };

  const toggleRemoteMute = () => {
    remoteStream.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setIsRemoteMuted(!isRemoteMuted);
  };
//****************************************************

  const userChat = getDoc(doc(db, "userChats", currentUser.id))
     const endRef = useRef(null);

    //  console.log(userChat)

  // console.log(chat?.messages.length)
   
  for(let i=0;i<chat?.messages.length;i++){
      if(chat?.messages[i].img){
        console.log("image found")
      }
  }

  
  
  const handleTTS = (txt) => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(decryptMessage(txt));
    u.lang = language
    synth.speak(u);
  }

  useEffect(()=>{
    if(!slider){
      setTranslate("");
    }
  })


  const [avatars, setAvatars] = useState({});

  const getUserAvatar = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userData = (await getDoc(userRef)).data();
    return userData.avatar;
  }     

  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarPromises = chat?.messages.map(async (msg) => {
        const avatarUrl = await getUserAvatar(msg.senderId);
        return { userId: msg.senderId, avatarUrl };
      });

      const avatarResults = await Promise.all(avatarPromises);
      const avatarMap = avatarResults.reduce((acc, { userId, avatarUrl }) => {
        acc[userId] = avatarUrl;
        return acc;
      }, {});

      setAvatars(avatarMap);
    };

    fetchAvatars();
  }, [chat?.messages]);

  const [username, setUsername] = useState({});
  const getUsername = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userData = (await getDoc(userRef)).data();
    return userData.username;
  }     

  useEffect(() => {
    const fetchUsername = async () => {
      const userPromises = chat?.messages.map(async (msg) => {
        const userName = await getUsername(msg.senderId);
        return { userId: msg.senderId, userName };
      });

      const userResults = await Promise.all(userPromises);
      const userMap = userResults.reduce((acc, { userId, userName }) => {
        acc[userId] = userName;
        return acc;
      }, {});

      setUsername(userMap);
    };

    fetchUsername();
  }, [chat?.messages]);

  // console.log(userData.avatar)
  const handleMsgTranslate = async (msgId, txt) =>{
        if(!slider){
          return;
        }
        let text = decryptMessage(txt)
        let msg = document.getElementById(msgId);
        let translation = ""
        const from = "auto";
        let to = language;
        translation = await JsGoogleTranslateFree.translate({ from, to, text });
        if(msg){
          msg.innerHTML = `<img src="./tts.png" alt=""/>` + translation
          msg.title = `Translated text`
          setTranslate(translation)
          const img = msg.querySelector('img');
          img.addEventListener('click', ()=>{handleTTS(encryptMessage(translation))})
         
        }else{
          console.error('Element not found.');
        }
  }


const secretKey = import.meta.env.VITE_CRYPTO_KEY;

// Function to encrypt a message
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

// Function to decrypt a message
const decryptMessage = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};


  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior: "smooth"})
  },[])    

  useEffect(()=>{
    setChatMember([])
    document.getElementById("detailSection").classList.add("hidden");
    setDetailsOn(false)
    setTimeout(() => {
      
      centerChat.scrollTop = centerChat.scrollHeight;
    }, 500);
  }, [chatId])

  const [chatMembers, setChatMember] = useState([]);

  const handleMembers = ()=>{
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

                       chatMembers.push(arr2.username + " (Admin)")
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
      }
      
    })
  }

  // useEffect(()=>{
    
  //   const unSub = onSnapshot(doc(db, "userChats", currentUser?.id), (res) =>{
  //     let arr = res.data().chats
      
  //     try {
        
  //       arr.map(async (item, indx) =>{
  //         if(item.chatId == chatId && item.members){
  //           for(let i=0; i<item.members.length; i++){
  //             onSnapshot(doc(db, "users", item.members[i]), (res) =>{
  //               let arr2 = res.data()
                
  //                   if(arr2.id == item.members[i]){
  //                     // console.log(arr2.username)
                     
  //                       chatMembers.push(arr2.username)
                      
  //                   }
               
  //             })
  //           }
            
  //         }

  //     })
  //     } catch (error) {
  //       console.log(error)
  //     }finally{
  //       // setChatMember([])
  //     }
      
  //   })

  //   return () =>{
  //     unSub();
      
  //   }
   
  // }, [chatId]);

 

  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>{
      setChat(res.data())
    })

    return () =>{
      unSub();
    }
  }, [chatId]);


  const [detailsOn, setDetailsOn] = useState(false);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    // setOpen(false);
  };

  const [picMode, setPicMode] = useState(false);

  
  
  const handleImg = async (e) => {
   
    if(e.target.files[0]){
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
        
    }
    setPicMode(prev=>!prev);
    if(!picMode){
      // const chatWindow = document.getElementById("chatWindow");
      // chatWindow.style = "filter: blur(10px)";
      const picModal = document.getElementById("picModal");
      picModal.classList.remove("hidden")
    }else{
      // const chatWindow = document.getElementById("chatWindow");
      // chatWindow.style = "filter: blur(0px)";
      const picModal = document.getElementById("picModal");
      picModal.classList.add("hidden")
    }
    
    // const picModal = document.getElementById("picModal");
    // const chatWindow = document.getElementById("chatWindow");
    
    // picModal.classList.remove("hidden")
    // chatWindow.style = "filter: blur(10px)";
    
}

  const handleSend = async () => {
    if(text === "" && !img.file) return;
    const loadingLogo = document.getElementById("loading");
    loadingLogo.classList.remove("loadingHidden");

    let imgUrl = null;
    // let txt = null;
   console.log(language)
   let translation = "";
   let encryptedTranslation = ""
   let encryptedText = encryptMessage(text)
    try {
      if(slider && text != ""){
        const from = "auto";
        let to = language;
        translation = await JsGoogleTranslateFree.translate({ from, to, text });
        encryptedTranslation = encryptMessage(translation);
      }
      if(img.file){
        imgUrl = await upload(img.file);
      }
        
        await updateDoc(doc(db,"chats",chatId),{
          messages:arrayUnion({
            senderId: currentUser.id,
            // userName: currentUser.username,
            // avatar: currentUser.avatar,
            ...(translation != "" ? {text:encryptedTranslation} : {text: encryptedText}),
            createdAt: new Date(),
            ...(imgUrl && {img:imgUrl}),
          })
        });

      const userIDs = [currentUser.id, user.id]

      userIDs.forEach(async (id)=>{
        const userChatsRef = doc(db, "userChats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)
  
        if(userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data()
  
          const chatIndex = userChatsData.chats.findIndex((c)=> c.chatId === chatId)
  
          userChatsData.chats[chatIndex].lastMessage = translation != "" ? translation : text != "" ? text : "Image File";
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
  
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats
          })
        }
      })
      
      centerChat.scrollTop = centerChat.scrollHeight;

    } catch (err) {
      console.log(err)
    }finally{
      setImg({
        file:null,
        url:""
      });
  
      setText("");
      loadingLogo.classList.add("loadingHidden");
    }

  }

  const handleKeyDown = (event) => {

    // console.log(event.key)
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleBlock = async () => {
    if(!user) return;

    const userDocRef = doc(db, "users", currentUser.id)

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })
      changeBlock()
    } catch (err) {
        console.log(err)
    }
  }

  const handleUnfriend = async (chatId) => {
    const loadingLogo = document.getElementById("loading");
    loadingLogo.classList.remove("loadingHidden");
    onSnapshot(doc(db, "userChats", currentUser.id), async (res) =>{
        const items = res.data();
        let arrTestCurrentUser = items.chats;
        try {
          arrTestCurrentUser.map(async (item, indx) =>{
             if(item.chatId == chatId){
              arrTestCurrentUser.splice(indx, 1)
              await updateDoc(doc(db,"userChats", currentUser.id),{
                chats: arrTestCurrentUser
              })
              
                onSnapshot(doc(db, "userChats", item.receiverId), async (res) =>{
                  const items = res.data();
                  let arrTest = items.chats;
                  arrTest.map(async (item2, indexTest)=>{
                   console.log(indexTest)
                    if(item2.chatId == chatId){
                      arrTest.splice(indexTest, 1)
                      console.log(arrTest)
                      await updateDoc(doc(db,"userChats", item.receiverId),{
                        chats: arrTest
                      })
                      
                     await deleteDoc(doc(db, "chats", item2.chatId));
                      
                      
                    }
                  })
                })
             
               
             
           }
           })
          console.log("User deleted")
        } catch (err) {
          console.log(err)
        }finally{
          loadingLogo.classList.add("loadingHidden");
          changeChatId(false);
          toast.success("User unfriended")
         
        }


      })

  }

  return (
    <div className="chatWindow" id="chatWindow">
      <div className="loading loadingHidden" id="loading"></div>
       <img src="/rightArrow.png" className="hidden" id="rightArrow" alt=""  width="44" height="44" style={{left: "0", top: "0", position: "absolute" }} onClick={() =>{
        const list = document.getElementById("list");
        list.style.display = "block";
        const rightArrow = document.getElementById("rightArrow");
        rightArrow.classList.add("hidden")
      }}/>
      <div className="WindowSection" id="WindowSection" style={{backgroundColor : `rgba(17, 25, 35, ${currentUser.opacity == 100 ? "1" : "0." + currentUser.opacity}`}}>
      <div className="top">
        <div className="userInfo">
            <img src={chat?.group ? chat?.img : user?.avatar || "./avatar.png"} alt="" />
            <div className="texts">
              <span>{chat?.group ? chat?.title : user?.username}</span>
              <p>{chat?.group ? "Group" : user?.bio} | <span>AES Encrypted</span></p>
            </div>
        </div>
        
          <div className="translator">
            <img src={slider ? "./slideON.png" : "./slideOFF.png"} alt="" 
                 onClick={() => setSlider((prev) => !prev)}/>
             <div className="texts">
                  <span>Translator: {slider ? 
                  <span style={{color: "green"}}>ON</span> : 
                  <span style={{color: "red"}}>OFF</span>}</span>
                  {slider ? <select value={language} 
                                    style={{position: "absolute", marginTop: "25px"}} 
                                    onChange={e => setLanguage(e.target.value)}>
                                        <option value="en">English</option>
                                        <option value="de">German</option>
                                        <option value="ru">Russian</option>
                                        <option value="ro">Romanian</option>
                                        <option value="fr">French</option>
                                        <option value="es">Spanish</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ja">Japanese</option>
                           </select> : ""}
             </div> 
          </div>
        <div className="icons">
          {/* <img src="./phone.png" alt="" onClick={()=>{
            // alert("FUCK OFF ALEX")
            console.log(chatMembers)
            // encryptMessage("Hello World")
            // decryptMessage("U2FsdGVkX19uSQzJe9WrE0LrMXA024PTq+GwId32hQk=")
          }}/> */}
          <img src={vidChat ? "./videoOn.png" : "./video.png"} alt=""  id="webcamButton" onClick={ async ()=>{
            setAnswerOn(false)
            setUserCall(user?.username)
            setVidChat(prev=>!prev)
            const userDocRef = doc(db, "users", user?.id)
            if(!vidChat){
              setTimeout(async() => {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                // Push tracks from local stream to peer connection
                document.getElementById('webcamVideo').srcObject = localStream.current;
               
  
              }, 1000);
            }else{
              hangUp()
            }
           

          
            // callButton.disabled = false;
            // answerButton.disabled = false;
            // webcamButton.disabled = true;
          }}/>
          <img src={detailsOn ? "./x.png" : "./info.png"} alt="" onClick={() => {
                  setDetailsOn(prev=>!prev)
                  const detailSection = document.getElementById("detailSection");
                  if(!detailsOn){
                    detailSection.classList.remove("hidden");
                    handleMembers()
                    setTimeout(() => {
                      
                      fetchUserInfo(currentUser?.id)
                    }, 500);
                  }else{
                    detailSection.classList.add("hidden");
                    setChatMember([])
                  }
                  
                }
               
          }/>

          <div id="detailSection" className="details hidden">
              <div className="info">
                {chat?.group ? <div className="option">
                  <div className="title">
                      <span> {chat?.group ? "Chat Members" : ""}</span>
                      {/* <img src={!arrowUp ? "./arrowDown.png" :  "./arrowUp.png"} alt="" onClick={()=>{setArrowUp(prev=>!prev)}}/> */}
                  </div>
                  <div  className="chatMembers">
                  {chatMembers?.map((member, indx) => (
                          <span key={indx}> {member} </span>
                   ))}
                  </div>
                </div> : ""}
                <div className="option">
                  <div className="title">
                    <span>Shared Photos</span>
                    <img src={arrowUp ? "./arrowDown.png" :  "./arrowUp.png"} alt="" onClick={()=>{setArrowUp(prev=>!prev)}}/>
                  </div>
                   
                  {arrowUp ? <div className="photos">
                    {chat?.messages.map((message) =>( 
                
                      <div className="photoItem" style={!message.img ? {display: "none"} : {}} key={message?.createdAt}>
                      <div className="photoDetail">
                        <a href={message.img} target="_blank">                    
                          <img src={message.img} alt="" />
                        </a>
                        <span>{"Img"}</span>
                      </div>
                        <a href={message.img} download="My_File.pdf" target="_blank"> 
                          <img src="./download.png" alt="" />
                        </a>
                    </div> 
                    
                    )) }        
                  </div> : ""}
                </div>
                {!chat?.group ? <div className="blockBtn">
                  <button onClick={()=>{handleUnfriend(chatId)}}>Unfriend</button>
                  <button onClick={handleBlock}>{
                    isCurrentUserBlocked ? "You are blocked!" : isReceiverBlocked ? "User blocked" : "Block User"
                  }</button>
                </div> : ""}
              </div>

          </div>
          </div>
      </div>

      <div className="center" id="centerChat">
        {vidChat && userCall == user?.username && <div className="videoChat">
          {/* <video controls>
            <source src="./wot.mp4" type="video/mp4" />
          </video> */}
          <span>
            <h3>Your webcam</h3>
            <video id="webcamVideo" autoPlay playsInline onClick={testhangUp}></video>
            <div className="chatInput">
            <button id="callButton" onClick={createCall}>Create Call</button>
            <img onClick={toggleLocalMute} src={isLocalMuted ? './micOFF.png' : './micON.png'} title={isLocalMuted ? 'Unmute' : 'Mute'} width="34" height="34"/>
            {answerOn ? <button style={{backgroundColor: "red"}} onClick={()=>{
              hangUp()
              // pc.current.close();
              // if (localStream) {
              //   localStream.current.getTracks().forEach(track => track.stop());
              //   localStream.current = null;
              // }
              // pc.current = null; 
              setVidChat(prev=>!prev)
              }}>
            End Call
            <img src="./hangUpWhite.png" alt="" width="30" height="30"/>
            </button> : ""}
            </div>
            {/* <input id="callInput" type="text" /> */}
          </span>
          <span>
          <h3>{user?.username + "'s "} webcam</h3>
            <video id="remoteVideo" autoPlay playsInline></video>
            <div className="chatInput" >
              <input id="callInput" type="text" placeholder={chatInput}/>
              <button id="answerButton" onClick={answerCall}>Answer</button>
              <img onClick={toggleRemoteMute} src={isRemoteMuted ? './micOFF.png' : './micON.png'} title={isRemoteMuted ? 'Unmute' : 'Mute'}   width="34" height="34"/>
            </div>
          </span>
        </div>}          
        
           
            { chat?.messages?.map((message) =>(
           
            <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
              <div className="texts">
                <a href={message.img} target="_blank">
                  {message.img && <img src={message.img} alt="" />}
                </a>
             <div className="msg">
                {message?.senderId === currentUser?.id ? "" : <img src={avatars[message?.senderId]} alt="" title={username[message?.senderId]}/>} 
              { !message.img && message.text != "" &&
                <p id={message?.createdAt.nanoseconds} onClick={()=>{
                  // {!slider ? handleTTS(message.text) : ""}
                  handleMsgTranslate(message?.createdAt.nanoseconds, message.text)
                  }}>
                <img src="./tts.png" alt="" onClick={()=>{ {!slider ? handleTTS(message.text) : ""} }}/> 
                {decryptMessage(message.text)}
                </p>
              }
             </div>
               
                <span>{format(message.createdAt.toDate())}</span>
              </div>
            </div>
            )) }
           
          {/* { groupChat?.messages?.map((message) =>(

                    
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              <a href={message.img}>
                {message.img && <img src={message.img} alt="" />}
              </a>
          
            { !message.img && message.text != "" &&
              <p>
              {message.text}
              </p>
            }

              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
          )) } */}
           
           {img.url && (<div className="message own">
              <div className="texts">
                <img src={img.url} alt="" />
              </div>
            </div>)}
            <div ref={endRef}></div>
            <span style={{display: "none"}}>
            {setTimeout(() => {
              // centerChat.scrollTop = centerChat.scrollHeight
            }, 500)}
            </span>

      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file"  style={{display: "none"}} onChange={handleImg}/>
          {/* <img src="./camera.png" alt="" /> */}
          {/* <img src="./mic.png" alt="" /> */}
        </div>
        <input 
          type="text" 
          placeholder={isCurrentUserBlocked || 
            isReceiverBlocked ? 
            "You cannot send a message" : "Type a message..." }
          value={text} 
          onChange={(e)=>{
            setText(e.target.value)
          }} 
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onKeyDown={handleKeyDown}/>
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
          <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>
        <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>

      <div className="picModal hidden" id="picModal">
            <button onClick={() => {
              
          
              setPicMode(prev=>!prev)
              if(!picMode){
                const picModal = document.getElementById("picModal");
                picModal.classList.remove("hidden")
              }else{
                const picModal = document.getElementById("picModal");
                picModal.classList.add("hidden")
              }
              
              handleSend()
            }}>Send</button>
            <button onClick={() => {
              setPicMode(prev=>!prev)
              if(!picMode){
                const picModal = document.getElementById("picModal");
                picModal.classList.remove("hidden")
              }else{
                const picModal = document.getElementById("picModal");
                picModal.classList.add("hidden")
              }

              setImg({
                file: null,
                url: ""
              })

            }}>Cancel</button>
      </div>
      
      </div>    
       {/* WindowSection ends */}
    </div>


    
  )
}

export default ChatWindow