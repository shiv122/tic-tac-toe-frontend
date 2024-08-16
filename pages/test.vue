<template>
    <div class="flex  justify-center items-center h-screen">
        <UCard class="bg-white p-4 rounded-lg shadow-md w-[30rem] divide-y-2 divide-dashed">
            <template #header>
                <h4 class="text-center">
                    Join or Create Room
                </h4>
            </template>
            <div class="">
                <form @submit.prevent="joinRoom" class="mb-4">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="room_id">
                            Room ID
                        </label>
                        <UInput v-model="roomId" id="room_id" type="text" placeholder="Room ID" />
                    </div>
                    <div class="flex items-center justify-between">

                        <UButton variant="soft" @click="createRoom()" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m6 0h6m-3-3v6" />
                            </svg>
                            Create
                        </UButton>
                        <UButton variant="soft" type="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
                                <path fill="currentColor"
                                    d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm6.56 4.5h5.69a.75.75 0 0 1 0 1.5H8.56l1.97 1.97a.749.749 0 0 1-.326 1.275a.749.749 0 0 1-.734-.215L6.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.749.749 0 0 1 1.275.326a.749.749 0 0 1-.215.734Z" />
                            </svg>
                            Join
                        </UButton>
                    </div>


                </form>
            </div>
            <div class="mt-4">
                <UDivider label="Your Recent Rooms" type="dashed" size="xs" />
                <USelectMenu v-model="roomId" :options="rooms" value-attribute="room_code" class="mt-5"
                    option-attribute="room_code" />

            </div>
        </UCard>
    </div>
</template>

<script setup>


const roomStore = useRoomStore();
const roomId = ref();
const router = useRouter()
const loading = ref(true);
const rooms = ref([]);

onMounted(async () => {
    try {
        loading.value = true;
        const res = await $api("/room/list", {
            method: "GET",
            onResponseError({ response }) {
                alert('error')
            },
        });
        console.log('rooms >>>', res);
        rooms.value = res.rooms
        roomId.value = res.rooms[0]?.room_code

    } catch (error) {
        console.log("Error res >>>", error)
    }
    finally {
        loading.value = false
    }

});




const setRoonmId = (id) => {
    roomId.value = id
}

const createRoom = async () => {
    try {
        const res = await $api("/room/create", {
            method: "POST",
            onResponseError({ response }) {
                alert('error')
            },
        });

        console.log("response >>>", res);
        roomStore.roomData = res.room
        nextTick(async () => {
            await goto('/room')
        })
    } catch (error) {
        console.log("Error res >>>", error)
    }
    finally {
    }
}


const joinRoom = async () => {
    if (!roomId.value) {
        alert('no id')
        return;
    }
    try {
        const res = await $api("/room/join", {
            method: "POST",
            body: {
                room_id: roomId.value,
            },
            onResponseError({ response }) {
                alert('error')
            },
        });

        console.log("response >>>", res);
        roomStore.roomData = res.room
        nextTick(async () => {
            await goto('/room')
        })
    } catch (error) {
        console.log("Error res >>>", error)
    }
    finally {
    }
}
const goto = async (path) => {
    await router.push(path)
    router.go(0)
}

</script>