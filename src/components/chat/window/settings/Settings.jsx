import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import "./settings.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
import upload from "../../../../lib/upload";

const Settings = () => {
    
    const {currentUser, changeSettings, fetchUserInfo } = useUserStore()
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    })
    const [wallpaper, setWallpaper] = useState({
        file:null,
        url:""
    })
 

    const handleSlider = () => {
        const slider = document.getElementById("slider");
        const settingsContainer = document.getElementById("settingsContainer");
        let val = slider.value;
        settingsContainer.style.backgroundColor = `rgba(17, 25, 35, 0.${val})`
        const opacRez = document.getElementById("opacRez");
        opacRez.innerHTML = slider.value + "%"
        if(val == 99){
            settingsContainer.style.backgroundColor = `rgba(17, 25, 35, 1)`
            opacRez.innerHTML = "100%"
        }

        const saveBtn = document.getElementById("btnsOpacity");
        saveBtn.classList.remove('hidden')
    }

    

    const handleAvatar = e => {
        if(e.target.files[0]){
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }

        const saveBtn = document.getElementById("btns");
        saveBtn.classList.remove('hidden')
    }

    const handleWallpaper = e => {
        if(e.target.files[0]){
            setWallpaper({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
            
        }
        const saveBtn = document.getElementById("btnsWallpaper");
        saveBtn.classList.remove('hidden')
    }

    const handleItemDisplay = (itemSet) =>{
        const wallpaperSet = document.getElementById("wallpaperSet");
        const profileSet = document.getElementById("profileSet");
        const OpacitySet = document.getElementById("OpacitySet");
        const bioSet = document.getElementById("bioSet");

        if(itemSet == "profileSet"){
            profileSet.classList.remove("hidden")
            wallpaperSet.classList.add("hidden")
            OpacitySet.classList.add("hidden")
            bioSet.classList.add("hidden")
        }else if(itemSet == "wallpaperSet"){
            profileSet.classList.add("hidden")
            wallpaperSet.classList.remove("hidden")
            OpacitySet.classList.add("hidden")
            bioSet.classList.add("hidden")
        }else if(itemSet == "OpacitySet"){
            profileSet.classList.add("hidden")
            wallpaperSet.classList.add("hidden")
            OpacitySet.classList.remove("hidden")
            bioSet.classList.add("hidden")
        }else if(itemSet == "bioSet"){
            profileSet.classList.add("hidden")
            wallpaperSet.classList.add("hidden")
            OpacitySet.classList.add("hidden")
            bioSet.classList.remove("hidden")
        }

    }

    const handleProfileChange = async (e) =>{
        e.preventDefault()
        const loadingLogo = document.getElementById("loading");
        const settingsContainer = document.getElementById("settingsContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        settingsContainer.style = "filter: blur(5px);"
 
        try{

            const imgUrl = await upload(avatar.file);

            await updateDoc(doc(db,"users", currentUser.id),{
                avatar: imgUrl
              });
           
            fetchUserInfo(currentUser.id)
            const saveBtn = document.getElementById("btns");
            saveBtn.classList.add('hidden')
            toast.success("Profile picture changed!");
        }catch(err){
            // console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            settingsContainer.style = "filter: blur(0px);"
            
        }
    }

    const handleWallpaperChange = async (e) =>{
        e.preventDefault()
        const loadingLogo = document.getElementById("loading");
        const settingsContainer = document.getElementById("settingsContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        settingsContainer.style = "filter: blur(5px);"
 
        try{

            const imgUrl = await upload(wallpaper.file);

            await updateDoc(doc(db,"users", currentUser.id),{
                bg: imgUrl
              });
           
            fetchUserInfo(currentUser.id)
            const saveBtn = document.getElementById("btnsWallpaper");
            saveBtn.classList.add('hidden')
            toast.success("Wallpeper picture changed!");
        }catch(err){
            // console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            settingsContainer.style = "filter: blur(0px);"
            
        }
    }

    const handleOpacity = async (e) =>{
        e.preventDefault()
        const loadingLogo = document.getElementById("loading");
        const settingsContainer = document.getElementById("settingsContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        settingsContainer.style = "filter: blur(5px);"
 
        try{
           const slider = document.getElementById("slider");
           
            await updateDoc(doc(db,"users", currentUser.id),{
               opacity: slider.value == "99" ? 100 : slider.value
              });
           
            fetchUserInfo(currentUser.id)
            const saveBtn = document.getElementById("btnsOpacity");
            saveBtn.classList.add('hidden')
            
            toast.success("Opacity was set succesfully!");
        }catch(err){
            // console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            settingsContainer.style = "filter: blur(0px);"
            
        }
    }
    const handleBioArea = () => {
        const saveBtn = document.getElementById("btnsBio");
        saveBtn.classList.remove('hidden')
    }

    const handleBio = async (e) =>{
        e.preventDefault()
        const loadingLogo = document.getElementById("loading");
        const settingsContainer = document.getElementById("settingsContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        settingsContainer.style = "filter: blur(5px);"
 
        try{
           const bioArea = document.getElementById("bioArea");
           
            await updateDoc(doc(db,"users", currentUser.id),{
               bio: bioArea.value == "" ? "Bio" : bioArea.value
              });
           
            fetchUserInfo(currentUser.id)
            const saveBtn = document.getElementById("btnsBio");
            saveBtn.classList.add('hidden')
            
            toast.success("Bio was changed succesfully!");
        }catch(err){
            // console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            settingsContainer.style = "filter: blur(0px);"
            
        }
    }

  return (
    <div className='settings'>
        <div className="loading loadingHidden" id="loading"></div>
        <div className="settingsSection" id="settingsContainer" style={{backgroundColor : `rgba(17, 25, 35, ${currentUser.opacity == 100 ? "1" : "0." + currentUser.opacity}`}}>
            <div className="leftSide">
                <div className="item">
                    <div className="texts">
                        <span>Settings</span>
                    </div>
                </div>
                <div className="item" onClick={() =>{handleItemDisplay("profileSet")}}>
                    <img src={currentUser.avatar || "/profile.png"} alt="" width="80" height="80"/>
                    <div className="texts">
                        <span>Profile picture</span>
                        <span>Click to change your profile picture</span>
                    </div>
                </div>
                <div className="item" onClick={() =>{handleItemDisplay("wallpaperSet")}}>
                    <img src={currentUser.bg || "/bg.png"} alt="" width="80" height="80"/>
                    <div className="texts">
                        <span>Wallpaper</span>
                        <span>Click to change your wallpaper picture</span>
                    </div>
                </div>
                <div className="item" onClick={() =>{handleItemDisplay("OpacitySet")}}>
                    {/* <img src={currentUser.bg || "/bg.png"} alt="" width="80" height="80"/> */}
                    <div className="texts">
                        <span>Background Opacity</span>
                        <span>Click to change your Background Opacity</span>
                    </div>
                </div>
                <div className="item" onClick={() =>{handleItemDisplay("bioSet")}}>
                    {/* <img src={currentUser.bg || "/bg.png"} alt="" width="80" height="80"/> */}
                    <div className="texts">
                        <span>Bio</span>
                        <span>Click to change your bio</span>
                    </div>
                </div>
                
            </div>
            <div className="vr"></div>
            <div className="rightSide" id="rightSide">
                <div className="itemDisplay hidden" id="profileSet">
                    <form onSubmit={handleProfileChange}>
                        <label htmlFor="file">
                            <img src={avatar.url || currentUser.avatar } alt="" width="200" height="200"/>
                            <span>Change</span>
                        </label>
                        
                        <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar}/>
                        <div className="btns hidden" id="btns">
                            <button type="submit">Save</button>
                            <button type="button" onClick={()=>{
                                setAvatar({
                                    url: currentUser.avatar
                                })
                                const saveBtn = document.getElementById("btns");
                                saveBtn.classList.add('hidden')
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
                <div className="itemDisplay hidden" id="wallpaperSet">
                    <form onSubmit={handleWallpaperChange}>
                        <label htmlFor="fileWallpaper">
                            <img src={wallpaper.url || currentUser.bg } alt="" style={{borderRadius: "0%"}} width="300" height="200"/>
                            <span>Change</span>
                        </label>
                        
                        <input type="file" id="fileWallpaper" style={{display: "none"}} onChange={handleWallpaper}/>
                       
                        <div className="btns hidden" id="btnsWallpaper">
                            <button type="submit">Save</button>
                            <button type="button" onClick={()=>{
                                 const containerMain = document.getElementById("window");
                                 containerMain.style.backgroundImage = `url('${wallpaper.url}')`
                                 containerMain.style.backgroundSize = `cover` 

                            }}>Try</button>
                            <button type="button" onClick={()=>{
                                setWallpaper({
                                    url: currentUser.bg
                                })
                                const saveBtn = document.getElementById("btnsWallpaper");
                                saveBtn.classList.add('hidden')
                                const containerMain = document.getElementById("window");
                                containerMain.style = {backgroundImage: `url("${currentUser.bg}")`}
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>

                <div className="itemDisplayOpac hidden" id="OpacitySet">
                   
                    <form onSubmit={handleOpacity}>
                        <span>Change opacity</span>
                      
                        <input type="range" className="slider" id="slider" min="10" max="99" defaultValue={currentUser.opacity} onChange={handleSlider}/>
                        <span id="opacRez">{currentUser.opacity + "%"}</span>
                        <div className="btns hidden" id="btnsOpacity">
                            <button type="submit">Save</button>
                            <button type="button" onClick={()=>{
                                
                                const saveBtn = document.getElementById("btnsOpacity");
                                saveBtn.classList.add('hidden')
                                const slider = document.getElementById("slider");

                                slider.value = currentUser.opacity;
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>

                <div className="itemDisplayBio hidden" id="bioSet">
                   
                    <form onSubmit={handleBio}>
                        <span>Change your bio</span>
                      
                        {/* <input type="text" className="slider" id="slider" min="10" max="99" defaultValue={currentUser.opacity} onChange={handleSlider}/> */}
                        <textarea id="bioArea" defaultValue={currentUser.bio} maxLength="30" onChange={handleBioArea}></textarea>
                        <div className="btns hidden" id="btnsBio">
                            <button type="submit">Save</button>
                            <button type="button" onClick={()=>{
                                
                                const saveBtn = document.getElementById("btnsBio");
                                saveBtn.classList.add('hidden')
                                const bio = document.getElementById("bioArea");
                                bio.value = currentUser.bio
                            }}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Settings