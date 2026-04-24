import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'

const Features = dynamic(() => import('@/components/Features'))
const Footer = dynamic(() => import('@/components/Footer'))

export default async function Home() {
  return (
    <main className="container">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  )
}
