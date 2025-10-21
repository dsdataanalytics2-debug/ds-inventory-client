import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Footer from '@/components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Don't show footer on login page
  const showFooter = router.pathname !== '/login'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Component {...pageProps} />
      </div>
      {showFooter && <Footer />}
    </div>
  )
}
