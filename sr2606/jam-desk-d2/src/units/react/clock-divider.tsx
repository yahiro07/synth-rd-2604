import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Button } from "@/shared/components/button";

type ClockDivision = 1 | 2 | 4;

type ClockDividerState = {
  division: ClockDivision;
};

const clockDivisions: ClockDivision[] = [1, 2, 4];

export const createClockDividerUnit: ReactUnitTemplateFn = (unitInterface) => {
  const store = createStore<ClockDividerState>({
    division: 1,
  });

  const clockOutput = unitInterface.primaryOutputPort.clockOutput;

  const actions = {
    setDivision(division: ClockDivision) {
      store.setDivision(division);
    },
  };

  unitInterface.primaryInputPort.setHandlers({
    clockInput: {
      start() {
        clockOutput.start?.();
      },
      step(stepIndex) {
        const division = store.state.division;
        if (stepIndex % division !== 0) {
          return;
        }
        clockOutput.step?.(stepIndex / division);
      },
      stop() {
        clockOutput.stop?.();
      },
    },
    stateInput: {
      emitState() {
        return { division: store.state.division };
      },
      applyState(state) {
        const division = state?.division;
        if (division === 1 || division === 2 || division === 4) {
          store.setDivision(division);
        }
      },
    },
  });

  return {
    RenderUi() {
      const { division } = store.useSnapshot();

      return (
        <div className="bg-gray-200 w-[220px] h-[100px] flex-vc gap-3 px-3 py-2 select-none">
          <h4 className="font-bold text-gray-700">Clock Divider</h4>
          <div className="flex-h gap-2">
            {clockDivisions.map((value) => (
              <Button
                key={value}
                active={division === value}
                onClick={() => actions.setDivision(value)}
                text={String(value)}
              />
            ))}
          </div>
        </div>
      );
    },
  };
};
