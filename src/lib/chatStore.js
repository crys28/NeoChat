import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChatId: (stateVar) => {
    if(stateVar){
        return set({
            chatId,
        })
    }else{
        return set({
            chatId: null,
        })
    }
  },
    changeChat: (chatId, user) =>{
        const currentUser  = useUserStore.getState().currentUser


        // CHECK IF CURRENT USER IS BLOCKED

        if(user.blocked.includes(currentUser.id)){
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            })
        }



        // CHECK IF CURRENT RECEIVER IS BLOCKED

        else if(currentUser.blocked.includes(user.id)){
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            })
        } else{
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            })
        }   

        
        
    },
    changeBlock: () =>{
        set(state=>({...state,isReceiverBlocked: !state.isReceiverBlocked}))
    }
}))