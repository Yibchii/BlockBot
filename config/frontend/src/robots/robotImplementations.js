import MazeBot2DComponent from "../components/MazeBot2DComponent";
import { VirtualSimulatorComponent } from "./VirtualSimulatorComponent";

// The database selects a robot; this map supplies the client implementation.
export const ROBOT_IMPLEMENTATIONS = {
  MazeBot2D: {
    Component: MazeBot2DComponent,
  },
  BrowserSimulation: {
        Component: VirtualSimulatorComponent,
    },
};

