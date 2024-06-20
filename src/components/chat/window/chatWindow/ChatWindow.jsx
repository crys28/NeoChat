import { useEffect, useRef, useState } from "react";
import "./chatWindow.css"
import EmojiPicker from "emoji-picker-react";
import { arrayRemove, arrayUnion, doc, documentId, getDoc, onSnapshot, updateDoc, collection, addDoc, setDoc } from "firebase/firestore";
import { db, firestore } from "../../../../lib/firebase";
import { useChatStore } from "../../../../lib/chatStore";
import { useUserStore } from "../../../../lib/userStore";
import upload from "../../../../lib/upload";
import { format } from 'timeago.js';
import { useChatGroupStore } from "../../../../lib/chatGroupStore";
import axios from 'axios';
import JsGoogleTranslateFree from "@kreisler/js-google-translate-free";

// import firebase from 'firebase/app';
// import 'firebase/firestore';
// const firestore = firebase.firestore();

const ChatWindow = () => {
  const [chat, setChat] = useState();
  const [groupChat, setGroupChat] = useState();
  const [slider, setSlider] = useState(false);
  const [language, setLanguage] = useState("en")
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const centerChat = document.getElementById("centerChat")
  // const [translate, setTranslate] = useState("");
  const [img, setImg] = useState({
    file: null,
    url:""
  });
  // const [txt, setTxt] = useState({
  //   file: null,
  //   url:""
  // });

  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock} = useChatStore();
  const {userGroup, chatGroupId} = useChatGroupStore();
  const {currentUser, fetchUserInfo} = useUserStore();

  //VIDEO CHAT RELATED
  const [callId, setCallId] = useState(null);
  const [vidChat, setVidChat] = useState(false);
  const [userCall, setUserCall] = useState("");
  const [chatInput, setChatInput] = useState("Input id here...");
  // const servers = {
  //   iceServers: [
  //     {
  //       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
  //     },
  //   ],
  //   iceCandidatePoolSize: 10,
  // };

  const pc = useRef(new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  }));
  // let localStream = null;
  // let remoteStream = null;
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream());
  useEffect(() => {
    pc.current.ontrack = (event) => {
      remoteStream.current.addTrack(event.track);
      document.getElementById('remoteVideo').srcObject = remoteStream.current;
    };

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
  }, []);

  
  // const webcamButton = document.getElementById('webcamButton');
 
  // const callInput = document.getElementById('callInput');
  // const answerButton = document.getElementById('answerButton');
  
  // const hangupButton = document.getElementById('hangupButton');

  const createCall = async () => {
      const callInput = document.getElementById('callInput');
    
      const userDocRef = doc(db, "users", user?.id)
      const callDocRef = doc(collection(firestore, 'calls'));
      // callInput.value = "Hello"
      setCallId(callDocRef.id);
        
        // callInput.innerText = callDocRef.id;
        const offerCandidatesCollectionRef = collection(callDocRef, 'offerCandidates');
        const answerCandidatesCollectionRef = collection(callDocRef, 'answerCandidates');
        
       
        // setChatInput(callDocRef.id)
        callInput.value = callDocRef.id
        // Get candidates for caller, save to db
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
//****************************************************

  const userChat = getDoc(doc(db, "userChats", currentUser.id))
     const endRef = useRef(null);

     console.log(userChat)

  // console.log(chat?.messages.length)

  for(let i=0;i<chat?.messages.length;i++){
      if(chat?.messages[i].img){
        console.log("image found")
      }
  }


  
  const handleTTS =  (txt) => {
    
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(txt);
    synth.speak(u);
  }


  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior: "smooth"})
  },[])    

  

  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>{
      setChat(res.data())
    })

    return () =>{
      unSub();
    }
  }, [chatId]);



  // console.log(groupChat)
  // useEffect(()=>{
  //   const unSub = onSnapshot(doc(db, "groupChats", chatGroupId), (res) =>{
  //     setGroupChat(res.data())
  //   })

  //   return () =>{
  //     unSub();
  //   }
  // }, [chatGroupId]);


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
    // alert("Test")
    if(text === "" && !img.file) return;
    const loadingLogo = document.getElementById("loading");
    loadingLogo.classList.remove("loadingHidden");
    

    let imgUrl = null;
    // let txt = null;
   console.log(language)
   let translation = ""
    try {

      if(slider && text != ""){
        const from = "auto";
        let to = language;
        // const text = translate;
        translation = await JsGoogleTranslateFree.translate({ from, to, text });
        // setTranslate("test")
        console.log(translation)
      }
      if(img.file){
        imgUrl = await upload(img.file);
      }
      
      console.log(translation)
      // console.log(text);
      
        
        await updateDoc(doc(db,"chats",chatId),{
          messages:arrayUnion({
            senderId: currentUser.id,
            // ...(txt && {text:txt}),
            userName: currentUser.username,
            avatar: currentUser.avatar,
            ...(translation != "" ? {text:translation} : {text}),
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
  
          // userChatsData.chats[chatIndex].lastMessage = !text ? "Image File" : text;
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
              <p>{chat?.group ? "Group" : user?.bio}</p>
            </div>
        </div>
          <div className="translator">
            <img src={slider ? "./slideON.png" : "./slideOFF.png"} alt="" onClick={() => setSlider((prev) => !prev)}/>
             <div className="texts">
                  <span>Translator: {slider ? <span style={{color: "green"}}>ON</span> : <span style={{color: "red"}}>OFF</span>}</span>
                  {slider ? <select value={language} style={{position: "absolute", marginTop: "25px"}} onChange={e => setLanguage(e.target.value)}>
                 
                              <option value="en">English</option>
                              <option value="de">German</option>
                              <option value="ru">Russian</option>
                              <option value="ro">Romanian</option>
                           </select> : ""}
             </div> 
          </div>
        <div className="icons">
          <img src="./phone.png" alt=""/>
          <img src="./video.png" alt="" id="webcamButton" onClick={ async ()=>{

            setUserCall(user?.username)
            setVidChat(prev=>!prev)
            const userDocRef = doc(db, "users", user?.id)
            setTimeout(async() => {
              // const webcamVideo = document.getElementById('webcamVideo');
              // const remoteVideo = document.getElementById('remoteVideo');
              localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              // remoteStream = new MediaStream();
              // Push tracks from local stream to peer connection
              document.getElementById('webcamVideo').srcObject = localStream.current;
              localStream.current.getTracks().forEach((track) => {
                pc.current.addTrack(track, localStream.current);
              });
              
              // Pull tracks from remote stream, add to video stream
              // pc.ontrack = (event) => {
              //   event.streams[0].getTracks().forEach((track) => {
              //     remoteStream.addTrack(track);
              //   });
              // };
            
             
              // remoteVideo.srcObject = remoteStream;

             
             
              //Creating offer

              // callButton.disabled = false;
              // answerButton.disabled = false;

            }, 1000);

          
            // callButton.disabled = false;
            // answerButton.disabled = false;
            // webcamButton.disabled = true;
          }}/>
          <img src={detailsOn ? "./x.png" : "./info.png"} alt="" onClick={() => {
                  setDetailsOn(prev=>!prev)
                  const detailSection = document.getElementById("detailSection");
                  if(!detailsOn){
                    detailSection.classList.remove("hidden");
                  }else{
                    detailSection.classList.add("hidden");
                  }
                }
               
          }/>

          <div id="detailSection" className="details hidden">
              <div className="info">
                <div className="option">
                  <div className="title">
                    <span>Chat Settings</span>
                    <img src="./arrowUp.png" alt="" />
                  </div>
                </div>
                <div className="option">
                  <div className="title">
                    <span>Privacy & Help</span>
                    <img src="./arrowUp.png" alt="" />
                  </div>
                </div>
                <div className="option">
                  <div className="title">
                    <span>Shared Photos</span>
                    <img src="./arrowDown.png" alt="" />
                  </div>
                   
                  <div className="photos">
                    {chat?.messages.map((message) =>( 
                
                      <div className="photoItem" style={!message.img ? {display: "none"} : {}} key={message?.createdAt}>
                      <div className="photoDetail">
                        <a href={message.img}>                    
                          <img src={message.img} alt="" />
                        </a>
                        <span>{"Img"}</span>
                      </div>
                        <a href={message.img} download="My_File.pdf"> 
                          <img src="./download.png" alt="" />
                        </a>
                    </div> 
                    
                    )) }        
                  </div>
                </div>
                <div className="option">
                  <div className="title">
                    <span>Shared Files</span>
                    <img src="./arrowUp.png" alt="" />
                  </div>
                </div>
                <div className="blockBtn">
                  <button onClick={handleBlock}>{
                    isCurrentUserBlocked ? "You are blocked!" : isReceiverBlocked ? "User blocked" : "Block User"
                  }</button>
                </div>
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
            <h3>Local Video</h3>
            <video id="webcamVideo" autoPlay playsInline></video>
            <div className="chatInput">
            <button id="callButton" onClick={createCall}>Create Call</button>
            </div>
            {/* <input id="callInput" type="text" /> */}
          </span>
          <span>
          <h3>Remote Video</h3>
            <video id="remoteVideo" autoPlay playsInline></video>
            <div className="chatInput" >
              <input id="callInput" type="text" defaultValue={chatInput}/>
              <button id="answerButton" onClick={answerCall}>Answer</button>
            </div>
          </span>
        </div>}          
        
           
            { chat?.messages?.map((message) =>(

           
            <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
              <div className="texts">
                <a href={message.img}>
                  {message.img && <img src={message.img} alt="" />}
                </a>
             <div className="msg">
                {message.senderId === currentUser?.id ? "" : <img src={message?.avatar} alt="" title={message?.userName}/>} 
              { !message.img && message.text != "" &&
                <p id={message?.createdAt} onClick={()=>{handleTTS(message.text)}}>
                  {/* {message.senderId === currentUser?.id ? "" :  <span>{message?.userName + ": "}</span>}  */}
                
                <img src="./tts.png" alt=""/> 
                {message.text}
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
              centerChat.scrollTop = centerChat.scrollHeight
            }, 500)}
            </span>

      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file"  style={{display: "none"}} onChange={handleImg}/>
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input 
          type="text" 
          placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message" : "Type a message..." }
          value={text} 
          onChange={(e)=>{
            setText(e.target.value)
            // setTranslate(e.target.value)
          }} 
          disabled={isCurrentUserBlocked || isReceiverBlocked}/>
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