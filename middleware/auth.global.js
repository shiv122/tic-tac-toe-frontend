export default defineNuxtRouteMiddleware(async (to, from) => {
  // const token = useCookie('accessToken')
  // if (!token.value) {
  //   return navigateTo("/login")
  // }
  if (to.path.startsWith('/auth')) {
    return;
  }


  try {
    const user = await $api("/user");
    useCookie("userData").value = user;
  } catch (error) {
    if (error.status == 401) {
      const token = useCookie('accessToken')
      const user = useCookie("userData");
      token.value = null
      user.value = null
      console.log('logged out', useCookie('accessToken'));
      return navigateTo("/auth/login?to=" + from.path)
    }
  }
})
