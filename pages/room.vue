<template>
  <div
    class="flex flex-col gap-5 justify-center items-center h-screen relative"
  >
    <div class="fixed left-[50%] translate-y-2/4">
      <ConfettiExplosion v-if="confettiVisible" :duration="5000" />
    </div>
    <UCard
      class="bg-gray-300 flex flex-col gap-5 justify-center items-center w-f"
    >
      <div class="flex gap-2 justify-between items-center mb-3">
        <h4 class="text-gray-200 text-center">
          Room Code : {{ roomStore.roomData?.room_code }}
        </h4>
        <UButton
          :icon="`${
            !copied ? 'i-heroicons-document-duplicate' : 'i-heroicons-clipboard'
          }`"
          size="xs"
          :disabled="copied"
          color="primary"
          square
          variant="ghost"
          @click="copy(room_code_source)"
        />
      </div>
      <div
        class="bg-gray-800 p-8 rounded-lg shadow-md w-[30rem] h-[30rem] flex flex-col justify-center items-center"
      >
        <div
          class="flex w-full justify-around"
          v-for="(row, i) of grid"
          :key="i"
        >
          <button
            :disabled="!yourTurn || grid[i][j] !== null"
            class="h-[6rem] w-[6rem] border-4 border-[#D9EDBF] m-[1rem] rounded-lg"
            :class="`${cell === you.id ? 'text-cyan-500' : 'text-[#FF9800]'} ${
              !yourTurn ? 'cursor-not-allowed' : ''
            } ${yourTurn ? 'border-green-500' : 'border-red-500'}`"
            v-for="(cell, j) of row"
            :key="j"
            @click="play(i, j)"
          >
            <span v-if="cell === null"></span>
            <div v-else-if="cell === you.id">
              <!-- SVG for the first player's marker (e.g., X) -->
              You
            </div>
            <div v-else-if="cell !== you.id">
              <!-- SVG for the second player's marker (e.g., O) -->
              Other
            </div>
          </button>
        </div>
      </div>
      <div class="relative rounded-lg shadow-md w-[30rem]">
        <div class="text-center mt-2">
          <!-- <UButton @click="test">Test</UButton> -->
        </div>
        <UDivider label="Players" type="dashed" size="sm" class="my-5" />
        <div
          v-for="player in players"
          :key="player.user.id"
          :class="
            player.user.id == currentPlayer
              ? 'ring-2 ring-gray-200 dark:ring-slate-500'
              : ''
          "
          class="player-card flex bg-gray-800 justify-between rounded-md overflow-hidden my-2"
        >
          <div
            class="player-card__info flex items-center pointer-events-none select-none"
          >
            <div class="player-card__avatar w-10 h-10 m-2 rounded-md">
              <img
                class="rounded-full"
                :src="
                  `https://ui-avatars.com/api/?background=9ca3af&name=` +
                  player.user.name
                "
                alt=""
              />
            </div>
            <p class="player-card__name m-1 font-bold text-gray-200 leading-5">
              {{
                player.user.id === you.id ? "You " + you.id : player.user.name
              }}
              <br />
              <small class="player-card__username text-gray-500"
                >@{{ player.user.email.split("@")[0] }}
              </small>
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import ConfettiExplosion from "vue-confetti-explosion";

const grid = ref([
  [null, null, null],
  [null, null, null],
  [null, null, null],
]);
const winner = ref(null);
const tied = ref(false);
const gameover = ref(false);
const gameoverSent = ref(false);
const currentPlayer = ref(null); // Store the current player's user ID
const players = ref([]);
const roomStore = useRoomStore();
const { $echo } = useNuxtApp();
const yourTurn = ref(false);
const you = useCookie("userData").value;
const router = useRouter();
const room_code_source = ref(roomStore.roomData?.room_code);
const { text, copy, copied, isSupported } = useClipboard({ room_code_source });
let move = 0;

const confettiVisible = ref(false);

const test = async () => {};
const play = async (i, j) => {
  if (players.value.length < 2) {
    push.warning("You need two players in the room");
    return;
  }

  if (gameover.value) {
    if (gameoverSent.value) {
      push.warning("Game ended");
      return;
    }
    gameoverSent.value = true;
  }
  if (grid.value[i][j] !== null) {
    push.warning("Already Set");
    return;
  }
  move++;
  grid.value[i][j] = currentPlayer.value; // Set the current player's ID in the grid

  try {
    const res = await $api("/game/play", {
      method: "POST",
      body: {
        game_id: roomStore.roomData.room_code,
        data: {
          grid: { i, j },
          player: you.id, // Pass the current player's ID
        },
      },
      headers: {
        "X-Socket-Id": $echo.socketId(),
      },
      onResponseError({ response }) {
        alert("error");
      },
    });

    console.log("play res >>>", res);
    grid.value = res.data.grid;
    if (res.data.winner) {
      winner.value = res.data.winner;

      if (winner.value == you.id) {
        push.success({
          title: "Congrats!!!",
          message: "You Won the game",
        });
        confettiVisible.value = false;
        await nextTick();
        confettiVisible.value = true;
      }
      gameover.value = true;
      await getRoomState();
    } else if (res.data.draw) {
      push.success({
        title: "Game Over",
        message: "This game as been a tie",
      });
      tied.value = true;
      gameover.value = true;
      await getRoomState();
    }
    if (gameover.value) {
    } else {
      currentPlayer.value = res.data.current_player; // Switch to the next player's ID
    }
  } catch (error) {
    console.log("play error >>>", error);
  } finally {
  }
};

const reset = () => {
  grid.value = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  winner.value = null;
  tied.value = false;
  gameover.value = false;
  gameoverSent.value = false;
  currentPlayer.value = players.value.length > 1 ? 0 : you.id; // Reset to the first player's ID
};

const getRoomState = async () => {
  try {
    const res = await $api("/room/get-state", {
      method: "POST",
      body: {
        game_id: roomStore.roomData.room_code,
      },
    });
    if (res.state == null) {
      reset();
    } else {
      const st = JSON.parse(res.state);
      console.log("state  res >>>", st);

      grid.value = st.grid;
      currentPlayer.value = st.current_player;
    }
  } catch (error) {
    console.log("state error >>>", error);
  }
};

onMounted(async () => {
  if (roomStore.roomData === null) {
    await router.push("/");
  }
  await getRoomState();
  $echo
    .join(`room.${roomStore.roomData?.room_code}`)
    .here((users) => {
      players.value = users;
    })
    .joining(async (user) => {
      push.success(user.user.name + " Joined the game");
      players.value.push(user);
      await getRoomState();
    })
    .leaving(async (user) => {
      players.value = players.value.filter((pl) => pl.user.id !== user.user.id);
      push.warning(user.user.name + " left the game");
    })
    .error((error) => {
      console.error(error);
    });

  $echo
    .private(`game.${roomStore.roomData?.room_code}`)
    .listen(".update", async (e) => {
      console.log("Channel Response >>>>", e);
      grid.value = e.data.grid;
      if (e.data.winner) {
        const otherpl = players.value.find((p) => p.user.id !== you.id)?.user
          .name;
        push.warning({
          title: "Game Over",
          message: otherpl + " Won The Match",
        });
        gameover.value = true;
        await getRoomState();
      } else if (e.data.draw) {
        push.success({
          title: "Game Over",
          message: "This game as been a tie",
        });
        tied.value = true;
        gameover.value = true;
        await getRoomState();
      }
      currentPlayer.value = e.data.current_player;
    });
});

onUnmounted(() => {
  $echo.leave(`room.${roomStore.roomData?.room_code}`);
  $echo.leave(`game.${roomStore.roomData?.room_code}`);
  roomStore.roomData = null;
});

watch(copied, (isCopied) => {
  if (isCopied) {
    push.info({ message: "Copied to clipboard", duration: 1000 });
  }
});
watch(currentPlayer, (cp) => {
  yourTurn.value = cp == you.id;
});
</script>
