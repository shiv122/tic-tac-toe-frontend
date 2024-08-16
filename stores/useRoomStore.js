import { defineStore } from 'pinia'

export const useRoomStore = defineStore('roomData', {
    state: () => ({ roomData: null }),
    actions: {
        setRoomData(data) {
            this.roomData = data;
        },
    }, persist: true,
})