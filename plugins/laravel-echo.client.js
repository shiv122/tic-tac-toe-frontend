import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
export default defineNuxtPlugin(nuxtApp => {
    window.Pusher = Pusher
    const echo = new Echo({
        broadcaster: 'pusher',
        key: 'yl9nwwgxhaxgobgbej11',
        authEndpoint: useRuntimeConfig().public.apiBaseUrl + '/broadcasting/auth',
        wsHost: 'admin-api.ddev.site',
        wsPort: "6001",
        cluster: 'mt1',
        forceTLS: false,
        auth: {
            headers: {
                'Authorization': 'Bearer ' + useCookie('accessToken').value,
                'Accept': 'application/json'
            }
        }
    })
    return {
        provide: {
            echo: echo,
        },
    };
})
