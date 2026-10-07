import { useCallback, useState } from 'react'
import Almanac from './components/Almanac.jsx'
import GameScreen from './components/GameScreen.jsx'
import { HowTo, LevelSelect, MainMenu } from './components/Menus.jsx'
import { LEVELS, getLevel } from './game/levels.js'
import { loadProgress, saveProgress } from './game/storage.js'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [levelId, setLevelId] = useState(null)
  const [progress, setProgress] = useState(loadProgress)

  const updateProgress = useCallback((patch) => {
    setProgress((p) => {
      const next = { ...p, ...patch }
      saveProgress(next)
      return next
    })
  }, [])

  const startLevel = (id) => {
    setLevelId(id)
    setScreen('game')
  }

  return (
    <main className="app">
      {screen === 'menu' && (
        <MainMenu onPlay={() => setScreen('levels')} onAlmanac={() => setScreen('almanac')} onHowTo={() => setScreen('howto')} />
      )}
      {screen === 'levels' && <LevelSelect progress={progress} onPick={startLevel} onBack={() => setScreen('menu')} />}
      {screen === 'almanac' && <Almanac onClose={() => setScreen('menu')} />}
      {screen === 'howto' && <HowTo onClose={() => setScreen('menu')} />}
      {screen === 'game' && (
        <GameScreen
          key={levelId}
          level={getLevel(levelId)}
          progress={progress}
          updateProgress={updateProgress}
          onExit={() => setScreen('levels')}
          onNext={() => {
            const next = LEVELS.find((l) => l.id === levelId + 1)
            if (next) startLevel(next.id)
            else setScreen('levels')
          }}
        />
      )}
    </main>
  )
}
