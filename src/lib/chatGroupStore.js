import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatGroupStore = create((set) => ({
  chatGroupId: null,
  userGroup: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChatId: (stateVar) => {
    if(stateVar){
        return set({
            chatGroupId,
        })
    }else{
        return set({
            chatGroupId: null,
        })
    }
  },
  changeChatGroup: (chatGroupId, userGroup) =>{
    // const currentUser  = useUserStore.getState().currentUser


    
        return set({
            chatGroupId,
            userGroup,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        })
   

    
    
},
}))