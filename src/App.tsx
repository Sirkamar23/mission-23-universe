import { AnimatePresence, MotionConfig } from 'motion/react';
import { useEffect, type ComponentType } from 'react';
import { sky, type SkyTheme } from './core/sky';
import { audio } from './core/audio';
import { Backdrop, FingerTrail, Starfield } from './components/Sky';
import { Hud, MissionControl } from './components/Hud';
import { StoryProvider, useStory, type SceneId } from './core/story';
import Opening from './scenes/Opening';
import WorldOne from './scenes/WorldOne';
import JazzGarden from './scenes/JazzGarden';
import Library from './scenes/Library';
import FlavorPlanet from './scenes/FlavorPlanet';
import Victories from './scenes/Victories';
import Transition from './scenes/Transition';
import WorldTwo from './scenes/WorldTwo';
import MusicHall from './scenes/MusicHall';
import Workshop from './scenes/Workshop';
import Places from './scenes/Places';
import Becoming from './scenes/Becoming';
import Constellation from './scenes/Constellation';
import Planet23 from './scenes/Planet23';
import Hoodie from './scenes/Hoodie';
import Finale from './scenes/Finale';

const SCENES: Record<SceneId, ComponentType> = {
  opening: Opening,
  world1: WorldOne,
  jazz: JazzGarden,
  library: Library,
  flavor: FlavorPlanet,
  victories: Victories,
  transition: Transition,
  world2: WorldTwo,
  music: MusicHall,
  workshop: Workshop,
  places: Places,
  becoming: Becoming,
  constellation: Constellation,
  planet23: Planet23,
  hoodie: Hoodie,
  finale: Finale,
};

const THEME: Partial<Record<SceneId, SkyTheme>> = {
  world1: 'w1',
  jazz: 'w1',
  library: 'w1',
  flavor: 'w1',
  victories: 'w1',
  transition: 'w1',
  world2: 'w2',
  music: 'w2',
  workshop: 'w2',
  places: 'w2',
  becoming: 'w2',
  constellation: 'gold',
  planet23: 'gold',
  hoodie: 'gold',
  finale: 'w2',
};
const WORLD_TWO_SCENES: SceneId[] = ['world2', 'music', 'workshop', 'places', 'becoming', 'constellation', 'planet23', 'hoodie', 'finale'];

function Stage() {
  const { scene } = useStory();
  const Scene = SCENES[scene];
  useEffect(() => {
    const t = THEME[scene];
    if (t) sky.setTheme(t);
    if (scene !== 'opening' && scene !== 'transition') audio.setWorld(WORLD_TWO_SCENES.includes(scene) ? 2 : 1);
  }, [scene]);
  return (
    <div className="stage">
      <AnimatePresence>
        <Scene key={scene} />
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoryProvider>
        <Backdrop />
        <Starfield />
        <Stage />
        <div className="vignette" aria-hidden />
        <FingerTrail />
        <div className="grain" aria-hidden />
        <Hud />
        <MissionControl />
      </StoryProvider>
    </MotionConfig>
  );
}
