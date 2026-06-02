import { seqNumbers } from "beams/ax/array-utils";
import { createStore } from "snap-store";
import { ReactUnitTemplateFn } from "@/host-app/unit-frame/react-unit-interface";
import { Knob } from "@/shared/components/knob";

export const createMixerUnit: ReactUnitTemplateFn = (unitInterface) => {
  const audioContext = unitInterface.audioContext;
  const destinationNode = unitInterface.primaryOutputPort.audioOutput.node;

  const inputPorts = unitInterface.createMultiChannelInputPorts(4);

  if (0) {
    //debug
    inputPorts.forEach((port, i) => {
      port.setCallbacks({
        onConnectedFrom(subPortTypes) {
          console.log(`mixer ch${i} connected from`, subPortTypes);
        },
      });
    });
  }

  const gainNodes = inputPorts.map((port) => {
    const gainNode = audioContext.createGain();
    port.audioInput.node.connect(gainNode);
    gainNode.connect(destinationNode);
    return gainNode;
  });

  const store = createStore({
    levels: gainNodes.map(() => 0.5),
  });

  const actionsInternal = {
    affectLevelToGain(ch: number, level: number) {
      const gainNode = gainNodes[ch];
      if (gainNode) {
        const gain = level ** 2 * 2;
        gainNode.gain.linearRampToValueAtTime(
          gain,
          audioContext.currentTime + 0.01,
        );
      }
    },
  };
  seqNumbers(4).forEach((ch) => {
    const level = store.state.levels[ch];
    actionsInternal.affectLevelToGain(ch, level);
  });

  const actions = {
    setLevel(ch: number, level: number) {
      store.setLevels((prev) => prev.map((l, i) => (i === ch ? level : l)));
      actionsInternal.affectLevelToGain(ch, level);
    },
  };

  return {
    RenderUi() {
      const { levels } = store.useSnapshot();
      return (
        <div className="bg-gray-200 w-[200px] h-[100px] flex-c gap-3">
          {seqNumbers(4).map((ch) => (
            <div key={ch} className="flex-vc gap-1">
              <span>{ch + 1}</span>
              <Knob
                value={levels[ch]}
                onChange={(value) => actions.setLevel(ch, value)}
              />
            </div>
          ))}
        </div>
      );
    },
  };
};
