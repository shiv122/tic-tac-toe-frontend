import { defineStore } from "pinia";

export const useRoomStore = defineStore("roomData", {
  state: () => ({ roomData: null, gameState: null }),
  actions: {
    setRoomData(data) {
      this.roomData = data;
    },
  },
  persist: true,
});
