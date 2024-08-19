import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";

const Login = () => {
    const {currentUser, isLoading, fetchUserInfo } = useUserStore()
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user.emailVerified) {
                console.log('User logged in:', user);
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Log in successful!");
              } else {
                toast.error("Please verify your email before logging in.");
              }
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
            const user = res.user;    
            const imgUrl = await upload(avatar.file);
            await sendEmailVerification(user);
            toast.warning('Verification email sent! Please check your inbox.');

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
        }catch(err){
            console.log(username);
            toast.error(err.message);
        }finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            loginContainer.style = "filter: blur(0px);"
        }
    }

      const handleGoogleSignIn = async () => {
        const loadingLogo = document.getElementById("loading");
        const loginContainer = document.getElementById("loginContainer");
        setLoading(true);
        loadingLogo.classList.remove("loadingHidden");
        loginContainer.style = "filter: blur(5px);"
        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const additionalUserInfo = getAdditionalUserInfo(result);
            if (additionalUserInfo.isNewUser) {
                console.log('New user created:', user);
                await setDoc(doc(db, "users", user.uid), {
                    username: user.displayName,
                    email: user.email,
                    avatar: user.photoURL,
                    bg: "./bg.png",
                    opacity: "85",
                    bio: "Bio",
                    id: user.uid,
                    blocked:[]
                  });
    
                await setDoc(doc(db, "userChats", user.uid), {
                    chats:[],
                  });
                  toast.success("Account created successfully!");
              } else {
                toast.success("Log in successful!");
              }
        } catch (err) {
            console.error('Error during sign in:', err);
        } finally{
            setLoading(false);
            loadingLogo.classList.add("loadingHidden");
            loginContainer.style = "filter: blur(0px);"
        }
      }

      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');

      const handlePasswordReset = async () => {
        if (!email) {
          toast.warning('Please enter your email address first');
          return;
        }
    
        try {
          await sendPasswordResetEmail(auth, email);
          toast.success('Password reset email sent successfully. Please check your inbox.');
        } catch (error) {
          toast.error(`Error: ${error.message}`);
        }
      };

  return (
    <div className='login'>
        <div className="loading loadingHidden" id="loading"></div>
        <div className="log_reg" id="loginContainer">
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input required type="email" placeholder="Email" name="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                    <input required type="password" placeholder="Password" name="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
                <div className="googleDiv">
                <button onClick={handleGoogleSignIn}>
                <img src="./google.png" alt="" />Login</button>
                </div>
                <a href="#" onClick={handlePasswordReset}>Forgot password? Click here to reset</a>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                    <img src={avatar.url || "./avatar.png"} alt="" />    
                    Upload avatar</label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar}/>
                    <input required type="text" placeholder="Username" name="username" />
                    <input required type="email" placeholder="Email" name="email" />
                    <input required minLength="6" type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login