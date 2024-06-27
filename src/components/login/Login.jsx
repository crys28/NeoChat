import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
    
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    })

    const [loading, setLoading] = useState(false);

    

    const handleAvatar = e => {
        if(e.target.files[0]){
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async (e) =>{
        e.preventDefault()

        const loadingLogo = document.getElementById("loading");
        const loginContainer = document.getElementById("loginContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        loginContainer.style = "filter: blur(5px);"

        const formData = new FormData(e.target)
        const {email, password} = Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth, email, password);

            toast.success("Log in successful!");
        }catch(err){
            console.log(err.message);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            loginContainer.style = "filter: blur(0px);"
        }
    }

    const handleRegister = async (e) =>{
        e.preventDefault()
        
        const loadingLogo = document.getElementById("loading");
        const loginContainer = document.getElementById("loginContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        loginContainer.style = "filter: blur(5px);"
        
        const formData = new FormData(e.target)
        const {username, email, password} = Object.fromEntries(formData);

        
        try{
            const res = await createUserWithEmailAndPassword(auth,email,password);
                
            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                bg: "./bg.png",
                opacity: "85",
                bio: "Bio",
                id: res.user.uid,
                blocked:[]
              });

            await setDoc(doc(db, "userChats", res.user.uid), {
                chats:[],
              });            
            
         
            toast.success("Account created! You can login now!");
        }catch(err){
            console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            loginContainer.style = "filter: blur(0px);"
            
        }
      

    }

  return (
    <div className='login'>
        <div className="loading loadingHidden" id="loading"></div>
        <div className="log_reg" id="loginContainer">
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                    <img src={avatar.url || "./avatar.png"} alt="" />    
                    Upload avatar</label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar}/>
                    <input type="text" placeholder="Username" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login