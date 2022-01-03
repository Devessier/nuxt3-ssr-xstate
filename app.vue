<script lang="ts" setup>
import { interpret } from "xstate/lib/interpreter";
import { createModel } from "xstate/lib/model";

const model = createModel(
  {},
  {
    events: {},
  }
);

const machine = model.createMachine({
  initial: 'pending',
  
  states: {
    pending: {
      after: {
        1_000: {
          target: "fetched",
        },
      },
    },

    fetched: {
      tags: "settled",
    },
  },
});

const { data } = await useAsyncData("machine", () => {
  return new Promise((resolve) => {
    const service = interpret(machine)
      .onTransition((state) => {
        if (state.hasTag("settled")) {
          resolve({state});

          service.stop();

          return;
        }
      })
      .start();
  });
});
</script>

<template>
  <div>
    <NuxtWelcome />

    <p>
      {{data.state.value}}
    </p>
  </div>
</template>
