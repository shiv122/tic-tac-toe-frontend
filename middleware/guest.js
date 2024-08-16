export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('accessToken')
  if (token.value) {
    return navigateTo("/")
  }
})
