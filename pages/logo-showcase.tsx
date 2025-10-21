import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const LogoShowcase = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Logo Implementation Showcase
            </h1>
            <p className="text-lg text-gray-600">
              Demonstrating the Automation System logo across different contexts and sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Original Logo */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-center">Original Logo</h3>
              <div className="flex justify-center">
                <div className="relative h-24 w-24">
                  <Image
                    src="/logo.png"
                    alt="Original Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Navbar Size */}
            <div className="bg-blue-600 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-center text-white">Navbar Size</h3>
              <div className="flex justify-center items-center">
                <div className="relative h-12 w-12">
                  <Image
                    src="/logo.png"
                    alt="Navbar Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-bold ml-3">Automation System</span>
              </div>
            </div>

            {/* Login Page Size */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-center">Login Page Size</h3>
              <div className="flex justify-center">
                <div className="relative h-20 w-20">
                  <Image
                    src="/logo.png"
                    alt="Login Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Footer Size */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-center text-white">Footer Size</h3>
              <div className="flex justify-center items-center">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="Footer Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-bold ml-3">Automation System</span>
              </div>
            </div>

            {/* Mobile Size */}
            <div className="bg-blue-600 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-center text-white">Mobile Size</h3>
              <div className="flex justify-center items-center">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="Mobile Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-bold ml-2 text-sm">Auto</span>
              </div>
            </div>

            {/* Favicon Preview */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold mb-4 text-center">Favicon Sizes</h3>
              <div className="flex justify-center items-center space-x-4">
                <div className="relative h-4 w-4">
                  <Image
                    src="/favicon-16x16.png"
                    alt="16x16 Favicon"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative h-8 w-8">
                  <Image
                    src="/favicon-32x32.png"
                    alt="32x32 Favicon"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative h-12 w-12">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Apple Touch Icon"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">16px, 32px, 180px</p>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Implementation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">✅ Implemented Locations:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Header/Navbar (all pages)</li>
                  <li>• Login page (centered)</li>
                  <li>• Footer (all pages except login)</li>
                  <li>• Browser favicon/tab icon</li>
                  <li>• PWA app icon</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">🎨 Features:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Responsive design (mobile/desktop)</li>
                  <li>• Transparent background preserved</li>
                  <li>• Hover animations</li>
                  <li>• Loading states</li>
                  <li>• Error fallbacks</li>
                  <li>• SEO optimized</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LogoShowcase
