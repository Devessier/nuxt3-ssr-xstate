# Nuxt3 SSR + XState

Wait for XState machine to settle before returning data during Nuxt3 SSR.

## Why doing that?

I want to use XState to manage my whole applications, whether they are single page applications or server-rendered applications.

Frameworks that offer SSR, like SvelteKit, Nuxt or Next, bring a function that runs on the server and that returns the data used to build a good old HTML page. SvelteKit has [load](https://kit.svelte.dev/docs#loading), Nuxt has [useAsyncData](https://v3.nuxtjs.org/docs/usage/data-fetching#useasyncdata) and Next has [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering)

## How to do that?

The challenge is to launch a state machine in this function, wait for it to *settle* and then return the data it computed, as well as the settled state, so that we can hydrate the state machine for client-side rendering.

We use [`useAsyncData`](https://v3.nuxtjs.org/docs/usage/data-fetching#useasyncdata) Nuxt3 hook to interpret the machine and wait for it to settle. Once the machine has settled, we return from `useAsyncData` callback the settled state, and the context of the machine. We stop the machine to prevent memory leaks.

Then we call `useMachine` hook from `@xstate/vue` to interpret the machine again, and we tell it to start from the settled state:

```ts
const { state, send } = useMachine(machine, {
  state: machine.resolveState(State.from(data.value.state, data.value.context)),
});
```

The server will build the HTML we expect, and the client will have access to the data returned by `useAsyncData` callback during SSR. As a consequence, the machine will be hydrated correctly!

[Open app.vue file](https://github.com/Devessier/nuxt3-ssr-xstate/blob/main/app.vue)

## Setup

Make sure to install the dependencies

```bash
yarn install
```

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment).