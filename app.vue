<script lang="ts" setup>
import "./style.css";
import { interpret } from "xstate/lib/interpreter";
import { createModel } from "xstate/lib/model";
import { ContextFrom, State, StateValue } from "xstate/lib/index";
import { useMachine } from "@xstate/vue/lib/index";

const model = createModel(
  {
    content: "",
    count: 0,
  },
  {
    events: {
      FETCHED_CONTENT: (args: { content: string }) => args,
      INC: () => ({}),
      REFETCH: () => ({}),
    },
  }
);

const assignContentToContext = model.assign(
  {
    content: (_, event) => event.content,
  },
  "FETCHED_CONTENT"
);

const incrementCountToContext = model.assign(
  {
    count: (context) => context.count + 1,
  },
  "INC"
);

const machine = model.createMachine({
  initial: "fetching",

  states: {
    fetching: {
      invoke: {
        src: () => async (sendBack) => {
          const content = await $fetch("/api/mountain");

          sendBack({
            type: "FETCHED_CONTENT",
            content,
          });
        },
      },

      on: {
        FETCHED_CONTENT: {
          target: "fetched",

          actions: assignContentToContext,
        },
      },
    },

    fetched: {
      tags: "settled",

      entry: () => {
        console.log("Enter fetched state");
      },

      on: {
        INC: {
          actions: incrementCountToContext,
        },

        REFETCH: {
          target: "fetching",
        },
      },
    },
  },
});

const { data } = await useAsyncData<{
  state: StateValue;
  context: ContextFrom<typeof model>;
}>("machine", () => {
  return new Promise((resolve) => {
    const service = interpret(machine)
      .onTransition((state) => {
        if (state.hasTag("settled")) {
          resolve({ state: state.value, context: state.context });

          service.stop();

          return;
        }
      })
      .start();
  });
});

const { state, send } = useMachine(machine, {
  state: machine.resolveState(State.from(data.value.state, data.value.context)),
});

function handleCounterClick() {
  send({ type: "INC" });
}

function handleRefetchClick() {
  send({ type: "REFETCH" });
}
</script>

<template>
  <div>
    <h1 class="text-center">Nuxt3 SSR + XState</h1>

    <p>{{ state.value }} | {{ state.context.content }}</p>

    <button @click="handleCounterClick">
      Increment counter: {{ state.context.count }}
    </button>

    <button @click="handleRefetchClick">Refetch</button>
  </div>
</template>
