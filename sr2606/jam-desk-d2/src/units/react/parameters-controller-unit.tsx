import { createStore } from "snap-store";
import type { ParameterSpec } from "@/contract/unit-interfaces";
import type { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Knob } from "@/shared/components/knob";
import { UpperLabel } from "@/shared/components/upper-label";

type ParametersControllerState = {
  connected: boolean;
  parameterSpecs: ParameterSpec[];
  parameterValues: Record<string, number>;
};

function getKnobStep(spec: ParameterSpec): number {
  if (spec.steps === undefined) {
    return 0.01;
  }
  if (spec.steps > 1) {
    return 1 / (spec.steps - 1);
  }
  return spec.steps;
}

export const createParametersControllerUnit: ReactUnitTemplateFn = (
  unitInterface,
) => {
  const outputPort = unitInterface.primaryOutputPort;
  const store = createStore<ParametersControllerState>({
    connected: false,
    parameterSpecs: [],
    parameterValues: {},
  });

  const actions = {
    loadParameters() {
      const parameterSpecs = outputPort.automationOutput.getParameterSpecs();
      const parameterValues = Object.fromEntries(
        parameterSpecs.map((spec) => [
          spec.id,
          outputPort.automationOutput.getParameter(spec.id),
        ]),
      );
      store.assigns({
        connected: true,
        parameterSpecs,
        parameterValues,
      });
    },
    clearParameters() {
      store.assigns({
        connected: false,
        parameterSpecs: [],
        parameterValues: {},
      });
    },
    setParameter(id: string, value: number) {
      outputPort.automationOutput.setParameter(id, value);
      store.assigns({
        parameterValues: {
          ...store.state.parameterValues,
          [id]: value,
        },
      });
    },
  };

  outputPort.setCallbacks({
    onConnectedTo(subPortTypes) {
      if (subPortTypes.includes("automation")) {
        actions.loadParameters();
      } else {
        actions.clearParameters();
      }
    },
    onDisconnectTo() {
      actions.clearParameters();
    },
  });

  return {
    RenderUi() {
      const { connected, parameterSpecs, parameterValues } =
        store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[200px] min-h-[100px] flex-vc gap-3 px-3 py-2">
          <h4>Parameters</h4>
          <div className="flex-h flex-wrap justify-center text-[#444] gap-3">
            {parameterSpecs.map((spec) => (
              <UpperLabel key={spec.id} label={spec.id}>
                <Knob
                  value={parameterValues[spec.id] ?? 0}
                  onChange={(value) => actions.setParameter(spec.id, value)}
                  min={0}
                  max={1}
                  step={getKnobStep(spec)}
                />
              </UpperLabel>
            ))}
            {connected && parameterSpecs.length === 0 && (
              <span className="text-[11px] text-gray-600">No parameters</span>
            )}
            {!connected && (
              <span className="text-[11px] text-gray-600">Not connected</span>
            )}
          </div>
        </div>
      );
    },
  };
};
