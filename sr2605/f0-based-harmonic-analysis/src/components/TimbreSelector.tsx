import { For } from "solid-js";
import { appActions } from "../app-actions";
import { store } from "../store";

export function TimbreSelector() {
  return (
    <div class="flex-ha gap-1">
      <button
        type="button"
        class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        onClick={() => appActions.prevTimbre()}
      >
        ◀
      </button>
      <select
        class="px-2 py-1 bg-gray-700 rounded text-sm"
        style={{ "min-width": "13rem" }}
        value={store.timbreIndex}
        onChange={(e) => appActions.setTimbre(Number(e.target.value))}
      >
        <For each={store.timbreNames}>
          {(name, i) => (
            <option value={i()}>
              {i() + 1}. {name}
            </option>
          )}
        </For>
      </select>
      <button
        type="button"
        class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        onClick={() => appActions.nextTimbre()}
      >
        ▶
      </button>
    </div>
  );
}
