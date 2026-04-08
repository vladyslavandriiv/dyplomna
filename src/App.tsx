import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { HomePage } from '@/pages/HomePage'
import { PlayerPage } from '@/pages/PlayerPage'
import { AccountPage } from '@/pages/AccountPage'
import { SteamCallbackPage } from '@/pages/SteamCallbackPage'
import { HeroesPage } from '@/components/heroes/HeroesPage'
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage'
import { MetaPage } from '@/components/meta/MetaPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
          <Navbar />
          <main style={{ flex: 1, maxWidth: 'var(--page-max)', margin: '0 auto', width: '100%', padding: '36px 28px' }}>
            <Routes>
              <Route path="/"                       element={<HomePage />} />
              <Route path="/player/:id"             element={<PlayerPage />} />
              <Route path="/heroes"                 element={<HeroesPage />} />
              <Route path="/leaderboard"            element={<LeaderboardPage />} />
              <Route path="/meta"                   element={<MetaPage />} />
              <Route path="/account"                element={<AccountPage />} />
              <Route path="/auth/steam/callback"    element={<SteamCallbackPage />} />
              <Route path="*"                       element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
