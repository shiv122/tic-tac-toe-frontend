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
            :disabled="!yourTurn"
            class="h-[6rem] w-[6rem] border-4 border-[#D9EDBF] m-[1rem] rounded-lg"
            :class="`${cell ? 'text-[#FF9800]' : 'text-cyan-500'} ${
              !yourTurn ? 'cursor-not-allowed' : ''
            } ${yourTurn ? 'border-green-500' : 'border-red-500'}`"
            v-for="(cell, j) of row"
            :key="j"
            @click="play(i, j)"
          >
            <span v-if="cell === null"></span>
            <div v-else-if="cell === false">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0"
                />
              </svg>
            </div>
            <div v-else-if="cell === true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
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
            (player.user.id === you.id && yourTurn
              ? 'ring-2 ring-gray-200 dark:ring-slate-500'
              : '',
            player.user.id !== you.id && !yourTurn
              ? 'ring-2 ring-gray-200 dark:ring-slate-500'
              : '')
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
              {{ player.user.id === you.id ? "You" : player.user.name }}
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
const currentPlayer = ref(true);
const players = ref([]);
const roomStore = useRoomStore();
const { $echo } = useNuxtApp();
const yourTurn = ref(false);
const you = useCookie("userData").value;
const router = useRouter();
const room_code_source = ref(roomStore.roomData?.room_code);
const { text, copy, copied, isSupported } = useClipboard({ room_code_source });
let timeline = [];
let move = 0;

const confettiVisible = ref(false);

const test = async () => {};
const play = async (i, j) => {
  if (players.value.length < 2) {
    push.warning("You need two player in the room");
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
  grid.value[i][j] = currentPlayer.value;
  try {
    const res = await $api("/game/play", {
      method: "POST",
      body: {
        game_id: roomStore.roomData.room_code,
        data: {
          grid: { i, j },
          player: currentPlayer.value,
        },
      },
      headers: {
        "X-Socket-Id": $echo.socketId(),
      },
      onResponseError({ response }) {
        alert("error");
      },
    });

    console.log("response >>>", res);
  } catch (error) {
    console.log("Error res >>>", error);
  } finally {
    checkWinner();
    updateTimeline(
      grid.value.map((row) => [...row]),
      move,
      currentPlayer.value
    );
    if (!gameover.value) {
      currentPlayer.value = !currentPlayer.value;
    }
    yourTurn.value = false;
  }
};

const updateTimeline = (grid, move, currentPlayer) => {
  timeline.push({
    move: move,
    grid: grid,
    player: currentPlayer,
  });
};

const checkWinner = async () => {
  const winningConditions = [
    // --
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // |
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // \
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    const [x1, y1] = a;
    const [x2, y2] = b;
    const [x3, y3] = c;

    if (
      grid.value[x1][y1] !== null &&
      grid.value[x1][y1] === grid.value[x2][y2] &&
      grid.value[x1][y1] === grid.value[x3][y3]
    ) {
      winner.value = grid.value[x1][y1];
      push.success({
        title: yourTurn.value ? "Congrats!!!" : "Game Over",
        message: (yourTurn.value ? "You" : "Other Player") + " Won the game",
      });
      if (yourTurn.value) {
        confettiVisible.value = false;
        await nextTick();
        confettiVisible.value = true;
      }
      gameover.value = true;
      return;
    }
  }

  if (!gameover.value) {
    let isTied = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid.value[i][j] === null) {
          isTied = false;
          break;
        }
      }
      if (!isTied) break;
    }

    if (isTied) {
      push.success({
        title: "Game Over",
        message: "This game as been a tie",
      });
      tied.value = true;
      gameover.value = true;
    }
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
  currentPlayer.value = true;
  timeline = [];
  move = 0;
};

onMounted(async () => {
  if (roomStore.roomData === null) {
    await router.push("/");
  }
  $echo
    .join(`room.${roomStore.roomData.room_code}`)
    .here((users) => {
      players.value = users;
      yourTurn.value = users.length < 2;
    })
    .joining((user) => {
      push.success(user.user.name + " Joined the game");

      players.value.push(user);
    })
    .leaving((user) => {
      players.value = players.value.filter((pl) => pl.user.id !== user.user.id);
      push.warning(user.user.name + " left the game");
      reset();
      yourTurn.value = true;
    })
    .error((error) => {
      console.error(error);
    });

  $echo
    .private(`game.${roomStore.roomData.room_code}`)
    .listen(".update", (e) => {
      console.log("Channel Response >>>>", e);
      grid.value[e.data.grid.i][e.data.grid.j] = e.data.player;
      checkWinner();
      if (!gameover.value) {
        yourTurn.value = true;
        currentPlayer.value = !e.data.player;
      }
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
</script>
