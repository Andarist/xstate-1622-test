import * as React from "react";
import * as ReactDOM from "react-dom";
import { createMachine, assign, spawn, ActorRefFrom } from "xstate";
import { useActor, useMachine } from "@xstate/react";

const child = createMachine<{ bar: number }, { type: "FOO"; data: number }>({
  id: "myActor",
  context: {
    bar: 1,
  },
  initial: "ready",
  states: {
    ready: {},
  },
});

const m = createMachine<{ actor: ActorRefFrom<typeof child> | null }>(
  {
    initial: "ready",
    context: {
      actor: null,
    },
    states: {
      ready: {
        entry: "spawnActor",
      },
    },
  },
  {
    actions: {
      spawnActor: assign<{ actor: ActorRefFrom<typeof child> | null }>({
        actor: () => spawn(child),
      }),
    },
  }
);

interface Props {
  myActor: ActorRefFrom<typeof child>;
}

function Element({ myActor }: Props) {
  /**
   * This is the most important part. I can't live without typed current and send.
   */
  const [current, send] = useActor(myActor);

  return (
    <>
      {current.context.bar}
      <div onClick={() => send({ type: "FOO", data: 1 })}>click</div>
    </>
  );
}

function App() {
  const [current] = useMachine(m);

  if (!current.context.actor) {
    return null;
  }

  return <Element myActor={current.context.actor} />;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
