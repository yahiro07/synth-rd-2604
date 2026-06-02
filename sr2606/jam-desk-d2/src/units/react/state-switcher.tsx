import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";

type StateSlotId = 1 | 2;

type StateSwitcherState = {
  connected: boolean;
  activeSlotId: StateSlotId;
  slots: Record<StateSlotId, Record<string, any> | undefined>;
};

export const createStateSwitcherUnit: ReactUnitTemplateFn = (unitInterface) => {
  const outputPort = unitInterface.primaryOutputPort;
  const store = createStore<StateSwitcherState>({
    connected: false,
    activeSlotId: 1,
    slots: {
      1: undefined,
      2: undefined,
    },
  });

  const actions = {
    loadState() {
      const state = outputPort.stateOutput.emitState?.();
      store.assigns({
        connected: true,
        activeSlotId: 1,
        slots: {
          1: state ? { ...state } : undefined,
          2: state ? { ...state } : undefined,
        },
      });
    },
    clearState() {
      store.assigns({
        connected: false,
        activeSlotId: 1,
        slots: {
          1: undefined,
          2: undefined,
        },
      });
    },
    switchSlot(nextSlotId: StateSlotId) {
      if (!store.state.connected || nextSlotId === store.state.activeSlotId) {
        return;
      }

      const currentState = outputPort.stateOutput.emitState?.();
      const nextState = store.state.slots[nextSlotId];

      store.assigns({
        activeSlotId: nextSlotId,
        slots: {
          ...store.state.slots,
          [store.state.activeSlotId]: currentState
            ? { ...currentState }
            : undefined,
        },
      });

      if (nextState) {
        outputPort.stateOutput.applyState?.({ ...nextState });
      }
    },
  };

  outputPort.setCallbacks({
    onConnectedTo(subPortTypes) {
      if (subPortTypes.includes("state")) {
        actions.loadState();
      } else {
        actions.clearState();
      }
    },
    onDisconnectTo() {
      actions.clearState();
    },
  });

  return {
    RenderUi() {
      const { connected, activeSlotId } = store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[120px] h-[100px] flex-vc gap-3 px-3 py-2">
          <h4>State</h4>
          <div className="flex-h gap-2">
            {([1, 2] as const).map((slotId) => {
              const active = connected && activeSlotId === slotId;
              return (
                <button
                  key={slotId}
                  type="button"
                  disabled={!connected}
                  onClick={() => actions.switchSlot(slotId)}
                  className={[
                    "w-10 h-8 border text-sm font-bold transition-colors",
                    active
                      ? "bg-[#3ac] border-[#333] text-white"
                      : "bg-white border-gray-400 text-[#444]",
                    connected
                      ? "cursor-pointer hover:bg-[#3ac] hover:border-[#3ac] hover:text-white"
                      : "cursor-not-allowed opacity-50",
                  ].join(" ")}
                >
                  {slotId}
                </button>
              );
            })}
          </div>
          {!connected && (
            <span className="text-[11px] text-gray-600">Not connected</span>
          )}
        </div>
      );
    },
  };
};
