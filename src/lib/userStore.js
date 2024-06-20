import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  settingsPage: null,
  groupsPage: null,
  isLoading: true,
  changeSettings: ( stateVar ) => {
    if(stateVar){
        return set({
            settingsPage: true,
        })
    }else{
        return set({
            settingsPage: false,
        })
    }
  },
  displayGroups: ( stateVar ) => {
    if(stateVar){
        return set({
            groupsPage: true,
        })
    }else{
        return set({
            groupsPage: false,
        })
    }
  },
    fetchUserInfo: async (uid) => {
        if(!uid) return set({currentUser:null, isLoading:false});

        try{

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                set({currentUser:docSnap.data(), isLoading:false});
            }else{
                set({currentUser:null, isLoading:false});
            }

        }catch(err){
            console.log(err);
            return set({currentUser:null, isLoading:false});
        }
    },
}))