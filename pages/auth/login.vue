<template>
    <div class="min-h-screen flex items-center justify-center w-full ">
        <UCard class=" shadow-md rounded-lg px-6 pb-6 max-w-md min-w-[25rem]">
            <template #header>
                <h1 class="text-2xl text-center  ">Welcome Back!</h1>
            </template>

            <form @submit.prevent="login">

                <UFormGroup label="Email" required>
                    <UInput v-model="form.email" placeholder="your@email.com" required name="email" />
                </UFormGroup>
                <UFormGroup class="mt-5" label="Password" name="email" required>
                    <UInput v-model="form.password" placeholder="your@email.com" required type="password" />
                </UFormGroup>

                <div class="flex items-center justify-between mb-4 mt-2">
                    <UCheckbox v-model="form.remember" name="remember">
                        <template #label>
                            <span class="text-xs">Remember me</span>
                        </template>
                    </UCheckbox>

                    <ULink to="/auth/signup" class="text-xs">
                        Create
                        Account
                    </ULink>

                </div>
                <UButton class="mt-10" :loading="loading" type="submit" block>
                    Login
                </UButton>
            </form>
        </UCard>
    </div>
</template>

<script setup lang="js">
const form = ref({
    email: "",
    password: "",
    remember: false,
});

definePageMeta({
    middleware: "guest",
});

const router = useRouter()
const route = useRoute()


const isPasswordVisible = ref(false);

const loading = ref(false);


const login = async () => {
    loading.value = true;
    const notification = push.promise("Validating Credentials ...");

    try {
        const res = await $api("/auth/login", {
            method: "POST",
            body: {
                email: form.value.email,
                password: form.value.password,
                remember: form.value.remember,
            }
        });
        notification.resolve({
            message: `Login successfull`,
        })
        console.log("response >>>", res);
        const { accessToken, userData } = res;
        useCookie("userData").value = userData;
        useCookie("accessToken").value = accessToken;
        nextTick(async () => {
            await goto('')
        })
    } catch (error) {
        console.log("Error res >>>", error)
        notification.reject(error.response?._data?.message ?? "Something Went Wrong")
    }
    finally {
        loading.value = false
    }
};

const goto = async (path) => {
    await router.push(path)
    router.go(0)
}


</script>